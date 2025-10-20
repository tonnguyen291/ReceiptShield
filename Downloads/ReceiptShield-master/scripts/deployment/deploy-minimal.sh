#!/bin/bash

# Minimal ReceiptShield Deployment Script
# This script deploys a basic version without problematic features

set -e  # Exit on any error

echo "🚀 Starting Minimal ReceiptShield Deployment..."

# Check if Firebase CLI is available
if ! command -v npx &> /dev/null; then
    echo "❌ npx is not available. Please install Node.js first."
    exit 1
fi

# Create a minimal build by temporarily removing problematic files
echo "📦 Preparing minimal build..."

# Backup problematic files
mkdir -p backup
cp -r src/app/api/monitoring backup/ 2>/dev/null || true
cp -r src/lib/monitoring* backup/ 2>/dev/null || true
cp -r src/lib/alerting* backup/ 2>/dev/null || true
cp -r src/ai backup/ 2>/dev/null || true
cp src/lib/enhanced-ocr-service.ts backup/ 2>/dev/null || true
cp src/lib/hybrid-ocr-service.ts backup/ 2>/dev/null || true
cp src/lib/ml-fraud-service.ts backup/ 2>/dev/null || true
cp src/lib/enhanced-fraud-service.ts backup/ 2>/dev/null || true
cp src/components/shared/chatbot.tsx backup/ 2>/dev/null || true
cp src/components/employee/receipt-upload-form.tsx backup/ 2>/dev/null || true
cp -r src/app/employee/submit-receipt backup/ 2>/dev/null || true
cp -r src/app/employee/verify-receipt backup/ 2>/dev/null || true
cp src/app/api/test-ocr/route.ts backup/ 2>/dev/null || true

# Remove problematic files temporarily
rm -rf src/app/api/monitoring
rm -f src/lib/monitoring.ts
rm -f src/lib/alerting.ts
rm -f src/lib/monitoring-config.ts

# Remove problematic AI files
rm -rf src/ai
rm -f src/lib/enhanced-ocr-service.ts
rm -f src/lib/hybrid-ocr-service.ts
rm -f src/lib/ml-fraud-service.ts
rm -f src/lib/enhanced-fraud-service.ts

# Remove problematic API routes
rm -f src/app/api/test-ocr/route.ts

# Remove components that depend on AI
rm -f src/components/shared/chatbot.tsx
rm -f src/components/employee/receipt-upload-form.tsx

# Remove pages that depend on AI
rm -f src/app/employee/submit-receipt/page.tsx
rm -f src/app/employee/verify-receipt/[receiptId]/page.tsx

echo "✅ Problematic files removed for minimal deployment"

# Try to build
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Restoring files and exiting."
    cp -r backup/* src/ 2>/dev/null || true
    exit 1
fi

echo "✅ Build completed successfully!"

# Deploy to Firebase App Hosting
echo "🚀 Deploying to Firebase App Hosting..."
npx firebase deploy --only apphosting

if [ $? -eq 0 ]; then
    echo "🎉 Minimal deployment completed successfully!"
    echo "Your app should be available at the Firebase App Hosting URL."
    echo ""
    echo "Next steps:"
    echo "1. Test the basic application"
    echo "2. Gradually add back features"
    echo "3. Fix Firebase SDK compatibility issues"
    echo "4. Re-enable monitoring and AI features"
else
    echo "❌ Deployment failed. Please check the errors above."
    # Restore files
    cp -r backup/* src/ 2>/dev/null || true
    exit 1
fi

# Restore files
echo "🔄 Restoring original files..."
cp -r backup/* src/ 2>/dev/null || true
rm -rf backup

echo "✅ Deployment process completed!"
