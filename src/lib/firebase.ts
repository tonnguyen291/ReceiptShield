
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBvOkBwvOkBwvOkBwvOkBwvOkBwvOkBwvOk",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "recieptshield.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "recieptshield",
  // Use the correct Firebase Storage bucket format
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "recieptshield.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "74288524309",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:74288524309:web:30e62b6af81e661119f21c",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-D82M0MC28P"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Initialize Analytics (only in browser environment)
let analytics;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
}

export { app, db, storage, auth, analytics };
