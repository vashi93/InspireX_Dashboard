import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCU_trgRbtK_8RcYsiplVyLy4rgBCW6bKw",
  authDomain: "inspire-x-1c8c6.firebaseapp.com",
  projectId: "inspire-x-1c8c6",
  storageBucket: "inspire-x-1c8c6.appspot.com",
  messagingSenderId: "846702415140",
  appId: "1:846702415140:web:c601766bdb15974b5bb7b1",
  measurementId: "G-P6RCZ5WL37"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
