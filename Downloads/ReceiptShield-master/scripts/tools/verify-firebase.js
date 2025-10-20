// Firebase Setup Verification Script
// Run this to check if your Firebase configuration is working

const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

console.log('🔍 Firebase Configuration Check:');
console.log('================================');
console.log('API Key:', firebaseConfig.apiKey ? '✅ Set' : '❌ Missing');
console.log('Auth Domain:', firebaseConfig.authDomain || '❌ Missing');
console.log('Project ID:', firebaseConfig.projectId || '❌ Missing');
console.log('Storage Bucket:', firebaseConfig.storageBucket || '❌ Missing');
console.log('Messaging Sender ID:', firebaseConfig.messagingSenderId || '❌ Missing');
console.log('App ID:', firebaseConfig.appId ? '✅ Set' : '❌ Missing');
console.log('Measurement ID:', firebaseConfig.measurementId || '❌ Missing');

console.log('\n🔧 Testing Firebase Initialization:');
try {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  console.log('✅ Firebase initialized successfully!');
  console.log('✅ Auth service is available');
} catch (error) {
  console.log('❌ Firebase initialization failed:', error.message);
  console.log('\n💡 Troubleshooting:');
  console.log('1. Make sure your .env.local file exists and has correct values');
  console.log('2. Verify your Firebase project is set up correctly');
  console.log('3. Check that Authentication is enabled in Firebase Console');
  console.log('4. Ensure your Firebase project has the correct configuration');
}
