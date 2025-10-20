# 🔥 Firebase Authentication Setup - Step by Step

## The Problem
You're getting `auth/configuration-not-found` error because Firebase Authentication is not enabled in your Firebase Console.

## The Solution
Follow these exact steps to enable Authentication:

### Step 1: Go to Firebase Console
1. Open your browser and go to: https://console.firebase.google.com/
2. Make sure you're logged in with your Google account
3. Find and click on your project: **receipt-shield**

### Step 2: Enable Authentication
1. In the left sidebar, look for **"Authentication"**
2. If you see **"Get started"** button, click it
3. If you don't see "Get started", you're already in the Authentication section

### Step 3: Configure Sign-in Methods
1. Click on the **"Sign-in method"** tab (at the top)
2. You should see a list of sign-in providers
3. Look for **"Email/Password"** in the list
4. Click on **"Email/Password"**

### Step 4: Enable Email/Password
1. You'll see a toggle switch for **"Email/Password"**
2. **Turn it ON** (toggle to the right)
3. You can leave the other options as they are
4. Click **"Save"** at the bottom

### Step 5: Verify It's Working
After saving, you should see:
- ✅ **"Email/Password"** appears in the enabled providers list
- ✅ **"Users"** tab becomes available
- ✅ No more "Get started" button

## Test Your App
1. Go to http://localhost:3000
2. Try to create an account or log in
3. The `auth/configuration-not-found` error should be gone!

## Troubleshooting
If you still get the error after enabling Authentication:

1. **Wait 1-2 minutes** - Firebase changes can take a moment to propagate
2. **Refresh your browser** and try again
3. **Check that you're in the correct project** (receipt-shield)
4. **Verify the project ID** matches your .env.local file

## What This Enables
- ✅ User registration (sign up)
- ✅ User login (sign in)
- ✅ Password reset functionality
- ✅ User session management
- ✅ All Origin-style UI features

---
**Need help?** Make sure you're in the correct Firebase project and that Authentication is properly enabled!
