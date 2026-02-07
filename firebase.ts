
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBHtXjOnnDQZiFmEWe0hR8-dRJmob0xchs",
  authDomain: "profsis4.firebaseapp.com",
  projectId: "profsis4",
  storageBucket: "profsis4.firebasestorage.app",
  messagingSenderId: "926816866437",
  appId: "1:926816866437:web:0e9d1c7b361cbd45a4d9ec",
  measurementId: "G-S2H2WBXXLV"
};

// Singleton pattern: Garante que o app seja inicializado apenas uma vez e com a mesma instância
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
