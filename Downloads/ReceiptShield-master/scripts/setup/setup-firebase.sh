#!/bin/bash

echo "🚀 Setting up Firebase for ReceiptShield..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from template..."
    cp env.example .env.local
    echo "✅ Created .env.local"
    echo "⚠️  Please update .env.local with your Firebase configuration"
else
    echo "✅ .env.local already exists"
fi

# Check if .firebaserc has the default project ID
if grep -q "YOUR_FIREBASE_PROJECT_ID" .firebaserc; then
    echo "⚠️  Please update .firebaserc with your actual Firebase project ID"
else
    echo "✅ .firebaserc is configured"
fi

echo ""
echo "📋 Next steps:"
echo "1. Create a Firebase project at https://console.firebase.google.com/"
echo "2. Enable Firestore Database, Storage, and Authentication"
echo "3. Get your Firebase configuration from Project Settings"
echo "4. Update .env.local with your Firebase config"
echo "5. Update .firebaserc with your project ID"
echo "6. Run: npm run firebase:deploy:rules"
echo "7. Run: npm run dev"
echo ""
echo "📖 See docs/firebase/setup-firebase.md for detailed instructions"
