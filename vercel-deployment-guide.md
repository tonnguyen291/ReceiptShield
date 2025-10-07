# 🚀 Vercel Deployment Guide (Alternative to Firebase)

## Why Vercel?
- ✅ Easier setup than Firebase
- ✅ Automatic deployments from GitHub
- ✅ Built-in environment variables
- ✅ No complex CLI setup required

## Step 1: Deploy to Vercel
1. Go to https://vercel.com/
2. Sign up with GitHub
3. Click "New Project"
4. Import: `Intelligent-Expense-Management/ReceiptShield`
5. Click "Deploy"

## Step 2: Configure Environment Variables
In Vercel Dashboard:
1. Go to your project
2. Settings → Environment Variables
3. Add these variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
GOOGLE_AI_API_KEY=your_google_ai_key (optional)
```

## Step 3: Update GitHub Actions
We can modify the workflow to use Vercel instead of Firebase.

## Benefits:
- ✅ No Firebase CLI setup required
- ✅ Automatic deployments
- ✅ Easy environment variable management
- ✅ Built-in analytics and monitoring
