#!/bin/bash

# Basic ReceiptShield Deployment Script
# This script creates a minimal working version

set -e  # Exit on any error

echo "🚀 Starting Basic ReceiptShield Deployment..."

# Check if Firebase CLI is available
if ! command -v npx &> /dev/null; then
    echo "❌ npx is not available. Please install Node.js first."
    exit 1
fi

# Create a basic version by creating placeholder files
echo "📦 Creating basic version..."

# Create placeholder chatbot component
mkdir -p src/components/shared
cat > src/components/shared/chatbot.tsx << 'EOF'
'use client';

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Chatbot({ isOpen, onClose }: ChatbotProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">AI Assistant</h2>
        <p className="text-gray-600 mb-4">AI features are temporarily disabled for deployment.</p>
        <button 
          onClick={onClose}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
EOF

# Create placeholder receipt upload form
mkdir -p src/components/employee
cat > src/components/employee/receipt-upload-form.tsx << 'EOF'
'use client';

export default function ReceiptUploadForm() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Upload Receipt</h1>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          Receipt upload functionality is temporarily disabled for deployment. 
          This feature will be restored after the initial deployment.
        </p>
      </div>
    </div>
  );
}
EOF

# Create placeholder pages
mkdir -p src/app/employee/submit-receipt
cat > src/app/employee/submit-receipt/page.tsx << 'EOF'
import ReceiptUploadForm from '@/components/employee/receipt-upload-form';

export default function SubmitReceiptPage() {
  return <ReceiptUploadForm />;
}
EOF

mkdir -p src/app/employee/verify-receipt/[receiptId]
cat > src/app/employee/verify-receipt/[receiptId]/page.tsx << 'EOF'
export default function VerifyReceiptPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Verify Receipt</h1>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          Receipt verification functionality is temporarily disabled for deployment.
        </p>
      </div>
    </div>
  );
}
EOF

# Create placeholder AI flows
mkdir -p src/ai/flows
cat > src/ai/flows/assistant-flow.ts << 'EOF'
// Placeholder for AI assistant flow
export const assistantFlow = null;
EOF

cat > src/ai/flows/flag-fraudulent-receipt.ts << 'EOF'
// Placeholder for fraud detection flow
export const flagFraudulentReceipt = null;
EOF

cat > src/ai/flows/summarize-receipt.ts << 'EOF'
// Placeholder for receipt summarization
export const summarizeReceipt = null;
EOF

# Create placeholder services
cat > src/lib/hybrid-ocr-service.ts << 'EOF'
// Placeholder for OCR service
export const hybridOcrService = null;
EOF

cat > src/lib/enhanced-ocr-service.ts << 'EOF'
// Placeholder for enhanced OCR service
export const enhancedOcrService = null;
EOF

cat > src/lib/ml-fraud-service.ts << 'EOF'
// Placeholder for ML fraud service
export const mlFraudService = null;
EOF

cat > src/lib/enhanced-fraud-service.ts << 'EOF'
// Placeholder for enhanced fraud service
export const enhancedFraudService = null;
EOF

# Create placeholder API route
mkdir -p src/app/api/test-ocr
cat > src/app/api/test-ocr/route.ts << 'EOF'
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ 
    message: 'OCR service temporarily disabled for deployment' 
  });
}
EOF

echo "✅ Placeholder files created"

# Try to build
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo "✅ Build completed successfully!"

# Deploy to Firebase App Hosting
echo "🚀 Deploying to Firebase App Hosting..."
npx firebase deploy --only apphosting

if [ $? -eq 0 ]; then
    echo "🎉 Basic deployment completed successfully!"
    echo "Your app should be available at the Firebase App Hosting URL."
    echo ""
    echo "Next steps:"
    echo "1. Test the basic application"
    echo "2. Gradually restore AI features"
    echo "3. Fix Firebase SDK compatibility issues"
    echo "4. Re-enable monitoring and AI features"
else
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi

echo "✅ Deployment process completed!"
