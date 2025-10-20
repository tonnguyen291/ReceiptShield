# 🔥 Firebase Setup Guide for ReceiptShield

## Quick Setup (5 minutes)

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter project name: `receiptshield` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click **"Create project"**

### Step 2: Enable Authentication
1. In your Firebase project → **Authentication** → **Get started**
2. Go to **Sign-in method** tab
3. Enable **Email/Password** provider
4. Click **Save**

### Step 3: Enable Firestore Database
1. Go to **Firestore Database** → **Create database**
2. Choose **"Start in test mode"** (for development)
3. Select a location (choose closest to you)
4. Click **Done**

### Step 4: Enable Storage
1. Go to **Storage** → **Get started**
2. Choose **"Start in test mode"** (for development)
3. Select same location as Firestore
4. Click **Done**

### Step 5: Get Configuration
1. Go to **Project Settings** (gear icon) → **General**
2. Scroll to **"Your apps"** section
3. Click **"Add app"** → **Web app** (</> icon)
4. Register app name: `ReceiptShield Web`
5. **Copy the config object** - it looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### Step 6: Update .env.local
Replace the placeholder values in your `.env.local` file:

```env
# Replace with your actual Firebase credentials
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...your_actual_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Step 7: Set Firestore Rules
Go to **Firestore Database** → **Rules** and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Step 8: Set Storage Rules
Go to **Storage** → **Rules** and replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🚀 After Setup
1. Restart your development server: `npm run dev`
2. The authentication should work properly
3. You can create user accounts and test the app

## 🔧 Troubleshooting
- **API Key Error**: Make sure you copied the correct API key from Firebase Console
- **Domain Error**: Ensure the auth domain matches your Firebase project
- **Permission Denied**: Check that Firestore and Storage rules allow authenticated users

## 📱 Testing
1. Go to `http://localhost:3000/login`
2. Try to create an account
3. If successful, Firebase is properly configured!

---
**Need help?** Check the Firebase documentation or ask for assistance!
