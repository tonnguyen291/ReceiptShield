# Firebase Setup Guide for ReceiptShield

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `ReceiptShield`
4. Choose whether to enable Google Analytics (recommended)
5. Click "Create project"

## Step 2: Enable Firebase Services

### Enable Firestore Database
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll add security rules later)
4. Select a location close to your users
5. Click "Done"

### Enable Storage
1. In Firebase Console, go to "Storage"
2. Click "Get started"
3. Choose "Start in test mode" (we'll add security rules later)
4. Select the same location as Firestore
5. Click "Done"

### Enable Authentication
1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" authentication
5. Optionally enable other providers (Google, GitHub, etc.)

## Step 3: Get Firebase Configuration

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select "Web"
4. Register app with name "ReceiptShield Web"
5. Copy the configuration object

## Step 4: Configure Environment Variables

1. Copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Update `.env.local` with your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

## Step 5: Update Firebase Project ID

1. Update `.firebaserc` with your actual project ID:
   ```json
   {
     "projects": {
       "default": "your_actual_project_id"
     }
   }
   ```

## Step 6: Deploy Security Rules

1. Deploy Firestore rules:
   ```bash
   npx firebase deploy --only firestore:rules
   ```

2. Deploy Storage rules:
   ```bash
   npx firebase deploy --only storage
   ```

## Step 7: Set up GitHub Integration

1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Add Firebase configuration"
   git push origin main
   ```

2. In Firebase Console, go to "Hosting"
3. Click "Get started"
4. Connect your GitHub repository
5. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `out`
   - Install command: `npm install`

## Step 8: Test the Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:9003
3. Test the authentication flow
4. Test receipt upload functionality

## Step 9: Set up Firebase Emulators (Optional)

For local development with Firebase services:

```bash
npx firebase emulators:start
```

This will start:
- Firestore emulator on port 8080
- Auth emulator on port 9099
- Storage emulator on port 9199
- Emulator UI on port 4000

## Troubleshooting

### Common Issues:

1. **Permission denied errors**: Make sure you're logged in with the correct Firebase account
2. **Project not found**: Verify the project ID in `.firebaserc` and `.env.local`
3. **CORS errors**: Check that your domain is added to authorized domains in Firebase Console
4. **Storage upload failures**: Verify storage rules and bucket configuration

### Getting Help:

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
