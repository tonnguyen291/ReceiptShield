// Test Firebase Authentication Configuration
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

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

console.log('🔍 Testing Firebase Authentication...');
console.log('Project ID:', firebaseConfig.projectId);
console.log('Auth Domain:', firebaseConfig.authDomain);

try {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  console.log('✅ Firebase Auth initialized successfully');
  console.log('✅ Auth service is available');
  console.log('\n💡 If you\'re still getting auth/configuration-not-found:');
  console.log('1. Make sure Email/Password is enabled in Firebase Console');
  console.log('2. Check that your project has Authentication enabled');
  console.log('3. Verify the project ID matches your Firebase project');
} catch (error) {
  console.log('❌ Firebase Auth initialization failed:', error.message);
}
