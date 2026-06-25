import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const PRODUCTS_COLLECTION = "products";
const ORDERS_COLLECTION = "orders";

export async function fetchProducts() {
  const q = query(collection(db, PRODUCTS_COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function fetchProductById(productId) {
  const snapshot = await getDoc(doc(db, PRODUCTS_COLLECTION, productId));
  if (!snapshot.exists()) {
    return null;
  }

  return { id: snapshot.id, ...snapshot.data() };
}

export async function createProduct(productData) {
  const payload = {
    ...productData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), payload);
  return { id: docRef.id, ...productData };
}

export async function updateProduct(productId, productData) {
  await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), {
    ...productData,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(productId) {
  await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
}

export async function createOrder(orderData) {
  const payload = {
    ...orderData,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, ORDERS_COLLECTION), payload);
  return { id: docRef.id, ...orderData };
}
