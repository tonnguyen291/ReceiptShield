import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBJUMBq1qLQnJjNz7lp72lJ7awKeod3qMo",
  authDomain: "recieptshield.firebaseapp.com",
  projectId: "recieptshield",
  storageBucket: "recieptshield.firebasestorage.app",
  messagingSenderId: "74288524309",
  appId: "1:74288524309:web:30e62b6af81e661119f21c",
  measurementId: "G-D82M0MC28P"
};

// Firebase configuration is now hardcoded to match the console exactly

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Analytics (only in browser environment)
let analytics;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
}

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export { analytics };

export default app;
