import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMlBM0RtW_2q8S1uF26wG4Wnwu5upi9t4",
  authDomain: "dreamland-584ee.firebaseapp.com",
  databaseURL: "https://dreamland-584ee-default-rtdb.firebaseio.com",
  projectId: "dreamland-584ee",
  storageBucket: "dreamland-584ee.firebasestorage.app",
  messagingSenderId: "639603211254",
  appId: "1:639603211254:web:0811cda03361a6aa9be5d7",
  measurementId: "G-RD2KHV4W81"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);

// Explicitly set persistence to local to ensure users stay logged in
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting persistence:", error);
});

const db = getFirestore(app);
const storage = getStorage(app);
const rtdb = getDatabase(app);

export { app, analytics, auth, db, storage, rtdb, firebaseConfig };
