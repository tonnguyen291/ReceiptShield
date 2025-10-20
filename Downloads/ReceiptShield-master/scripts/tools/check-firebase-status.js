// Check Firebase Project Status
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

console.log('🔍 Firebase Project Status Check');
console.log('================================');
console.log('Project ID:', firebaseConfig.projectId);
console.log('Auth Domain:', firebaseConfig.authDomain);
console.log('API Key:', firebaseConfig.apiKey ? '✅ Set' : '❌ Missing');

try {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  console.log('\n✅ Firebase initialized successfully');
  console.log('✅ Auth service is available');
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
  console.log('2. Select your project: receipt-shield');
  console.log('3. Click "Authentication" in the left sidebar');
  console.log('4. Click "Get started" if you see it');
  console.log('5. Go to "Sign-in method" tab');
  console.log('6. Enable "Email/Password" provider');
  console.log('7. Click "Save"');
  console.log('\nAfter enabling Authentication, your app will work! 🚀');
  
} catch (error) {
  console.log('❌ Firebase initialization failed:', error.message);
  console.log('\n💡 This usually means:');
  console.log('- Your Firebase project is not set up correctly');
  console.log('- Authentication is not enabled in Firebase Console');
  console.log('- The project ID does not match your Firebase project');
}
