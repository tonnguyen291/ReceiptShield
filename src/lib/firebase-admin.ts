import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Firebase Admin configuration
const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "recieptshield",
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Initialize Firebase Admin
let adminApp;
try {
  if (!getApps().length) {
    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.projectId,
      });
    } else {
      // For development, you might want to use the default credentials
      console.warn('Firebase Admin credentials not found. Using default credentials.');
      adminApp = initializeApp({
        projectId: serviceAccount.projectId,
      });
    }
  } else {
    adminApp = getApps()[0];
  }
} catch (error) {
  console.error('Firebase Admin initialization failed:', error);
  throw new Error('Firebase Admin configuration is invalid. Please check your environment variables.');
}

export const auth = getAuth(adminApp);
export const db = getFirestore(adminApp);
export default adminApp;
