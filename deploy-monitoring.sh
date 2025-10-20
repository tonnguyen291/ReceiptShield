#!/bin/bash

echo "🚀 Deploying monitoring configuration..."

# Deploy Firestore rules
echo "📋 Deploying Firestore monitoring rules..."
firebase deploy --only firestore:rules

# Deploy monitoring API
echo "🔌 Deploying monitoring API..."
npm run build
firebase deploy --only apphosting

echo "✅ Monitoring deployment complete!"
echo "📊 Access your monitoring dashboard at: https://compensationengine.com/admin/monitoring"
