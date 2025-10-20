#!/bin/bash

# Setup Gmail SMTP secrets for Firebase App Hosting
echo "🔐 Setting up Gmail SMTP secrets for Firebase..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Login to Firebase (if not already logged in)
echo "📝 Please make sure you're logged in to Firebase..."
firebase login

# Set Gmail user secret
echo "🔑 Setting GMAIL_USER secret..."
echo "aqallaf76@gmail.com" | firebase apphosting:secrets:set GMAIL_USER

# Set Gmail app password secret
echo "🔑 Setting GMAIL_APP_PASSWORD secret..."
echo "zkflkwxddkbnnyfx" | firebase apphosting:secrets:set GMAIL_APP_PASSWORD

# Set app URL
echo "🔑 Setting NEXT_PUBLIC_APP_URL..."
echo "https://compensationengine.com" | firebase apphosting:secrets:set NEXT_PUBLIC_APP_URL

echo "✅ Gmail SMTP secrets configured successfully!"
echo ""
echo "📧 Your invitation emails will now be sent from: aqallaf76@gmail.com"
echo "🔗 Invitation links will use: https://compensationengine.com"
echo ""
echo "🚀 Next steps:"
echo "   1. Trigger a new deployment to apply the secrets"
echo "   2. Test sending an invitation email"
echo "   3. Check the recipient's inbox"
echo ""
echo "⚠️  Note: Gmail free accounts have a limit of 100 emails per day"

