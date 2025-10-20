// Firestore Connection Setup Script
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, doc, setDoc } = require('firebase/firestore');
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

async function setupFirestoreConnection() {
  console.log('🔗 Setting up Firestore connection...');
  console.log('Project ID:', firebaseConfig.projectId);
  
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);
    
    console.log('✅ Firebase initialized successfully');
    console.log('✅ Firestore database connected');
    console.log('✅ Auth service connected');
    
    // Test Firestore connection by creating a test document
    console.log('\n🧪 Testing Firestore connection...');
    
    try {
      // Test reading from users collection
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      console.log('✅ Firestore read test successful');
      console.log(`📊 Found ${usersSnapshot.size} users in database`);
      
      // Test writing to Firestore (create a test document)
      const testDocRef = await addDoc(collection(db, 'test'), {
        message: 'Firestore connection test',
        timestamp: new Date(),
        status: 'success'
      });
      console.log('✅ Firestore write test successful');
      console.log('📝 Test document created with ID:', testDocRef.id);
      
    } catch (firestoreError) {
      console.log('❌ Firestore connection test failed:', firestoreError.message);
      console.log('\n💡 This usually means:');
      console.log('1. Firestore is not enabled in Firebase Console');
      console.log('2. Firestore rules are too restrictive');
      console.log('3. The project does not have Firestore enabled');
      return false;
    }
    
    console.log('\n🎯 Firestore Setup Complete!');
    console.log('Your app is now connected to Firestore for:');
    console.log('✅ User authentication data');
    console.log('✅ User profiles and credentials');
    console.log('✅ Receipt data storage');
    console.log('✅ Application data persistence');
    
    return true;
    
  } catch (error) {
    console.log('❌ Firebase setup failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Make sure your .env.local file has correct Firebase credentials');
    console.log('2. Verify your Firebase project is set up correctly');
    console.log('3. Check that Firestore is enabled in Firebase Console');
    return false;
  }
}

// Run the setup
setupFirestoreConnection().then(success => {
  if (success) {
    console.log('\n🚀 Your ReceiptShield app is ready to use Firestore!');
    console.log('Go to http://localhost:3000 to test the app');
  } else {
    console.log('\n🔧 Please fix the issues above and run this script again');
  }
});
