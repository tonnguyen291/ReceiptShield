#!/bin/bash

echo "🔐 Setting up Firebase secrets for production environment..."
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Make sure user is logged in
echo "📝 Ensuring you're logged in to Firebase..."
firebase login --reauth

# Set the Gmail App Password as a secret
echo ""
echo "🔑 Creating GMAIL_APP_PASSWORD secret..."
echo "zkflkwxddkbnnyfx" | firebase apphosting:secrets:set GMAIL_APP_PASSWORD

echo ""
echo "✅ Secret created successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. The apphosting.production.yaml file has been created"
echo "   2. Commit and push the changes:"
echo "      git add apphosting.production.yaml"
echo "      git commit -m 'Add production environment configuration'"
echo "      git push origin master"
echo ""
echo "   3. In Firebase Console:"
echo "      - Set environment name to: production"
echo "      - The configuration will be automatically loaded"
echo ""
echo "✅ Setup complete!"

