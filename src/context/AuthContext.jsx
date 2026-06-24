import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { deleteDoc, doc, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const profileRef = doc(db, "users", user.uid);
    const unsubscribeProfile = onSnapshot(profileRef, (snapshot) => {
      setProfile(snapshot.exists() ? snapshot.data() : null);
      setLoading(false);
    });

    return () => unsubscribeProfile();
  }, [user]);

  const syncProfileToFirestore = async (currentUser, overrides = {}) => {
    const profileData = {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName || "",
      address: "",
      createdAt: serverTimestamp(),
      ...overrides,
    };

    await setDoc(doc(db, "users", currentUser.uid), profileData, { merge: true });

    const savedDoc = await getDoc(doc(db, "users", currentUser.uid));
    if (savedDoc.exists()) {
      setProfile(savedDoc.data());
    }
  };

  const signup = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const currentUser = userCredential.user;

    if (displayName) {
      await updateProfile(currentUser, { displayName });
    }

    await syncProfileToFirestore(currentUser, {
      displayName: displayName || currentUser.displayName || "",
      address: "",
      createdAt: serverTimestamp(),
    });

    return currentUser;
  };

  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {
      // Ignore sign-out errors if no session is active.
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account", login_hint: "" });
    const result = await signInWithPopup(auth, provider);
    const currentUser = result.user;

    await syncProfileToFirestore(currentUser, {
      displayName: currentUser.displayName || "",
      address: "",
      createdAt: serverTimestamp(),
    });

    return result;
  };

  const updateUserProfile = async (displayName, address) => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("No authenticated user.");
    }

    if (displayName !== currentUser.displayName) {
      await updateProfile(currentUser, { displayName });
    }

    await setDoc(
      doc(db, "users", currentUser.uid),
      {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: displayName || "",
        address: address || "",
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    const refreshedDoc = await getDoc(doc(db, "users", currentUser.uid));
    if (refreshedDoc.exists()) {
      setProfile(refreshedDoc.data());
    } else {
      setProfile((currentProfile) => ({
        ...(currentProfile || {}),
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: displayName || "",
        address: address || "",
        updatedAt: new Date().toISOString(),
      }));
    }
  };

  const deleteUserAccount = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("No authenticated user.");
    }

    await deleteDoc(doc(db, "users", currentUser.uid));

    try {
      await deleteUser(currentUser);
    } catch (error) {
      await firebaseSignOut(auth);
      throw error;
    }

    await firebaseSignOut(auth);
  };

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  const value = useMemo(
    () => ({ user, profile, loading, signup, login, signInWithGoogle, logout, updateUserProfile, deleteUserAccount }),
    [user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
