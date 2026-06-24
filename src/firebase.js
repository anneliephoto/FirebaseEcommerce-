import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA_VkD10BGFzIP0eGJD4dr4u5oFXWe4i50",
  authDomain: "fir-ecommerce-4314f.firebaseapp.com",
  projectId: "fir-ecommerce-4314f",
  storageBucket: "fir-ecommerce-4314f.firebasestorage.app",
  messagingSenderId: "1013637491036",
  appId: "1:1013637491036:web:da37eaaab1ee7956403999",
  measurementId: "G-50D5YZ879K",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
