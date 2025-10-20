#!/bin/bash

# ReceiptShield GitHub Deployment Script
# This script prepares the application for GitHub deployment

set -e  # Exit on any error

echo "🚀 Preparing ReceiptShield for GitHub Deployment..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: ReceiptShield application"
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a Git repository. Please run this from the project root."
    exit 1
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Next.js
.next/
out/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Firebase
.firebase/
firebase-debug.log
firebase-debug.*.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# ML models and data
ml/venv/
ml/*.pkl
ml/*.png
ml/receipts/
ml/*.csv

# Backup files
backup/
*.backup

# Temporary files
tmp/
temp/
EOF
fi

# Add all files to git
echo "📦 Adding files to Git..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "✅ No changes to commit."
else
    echo "💾 Committing changes..."
    git commit -m "feat: restore monitoring system and prepare for deployment

- Re-enabled monitoring system with API endpoints
- Restored AI features and flows
- Added GitHub Actions workflow for deployment
- Updated deployment configuration"
fi

# Check if remote origin exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Please add a GitHub remote repository:"
    echo "   git remote add origin https://github.com/yourusername/receiptshield.git"
    echo "   git push -u origin main"
    exit 1
fi

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

echo "✅ GitHub deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Set up GitHub repository secrets:"
echo "   - FIREBASE_TOKEN"
echo "   - NEXT_PUBLIC_FIREBASE_API_KEY"
echo "   - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
echo "   - NEXT_PUBLIC_FIREBASE_PROJECT_ID"
echo "   - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
echo "   - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
echo "   - NEXT_PUBLIC_FIREBASE_APP_ID"
echo "   - GOOGLE_AI_API_KEY"
echo "   - NEXT_PUBLIC_EMAIL_FROM"
echo "   - NEXT_PUBLIC_EMAIL_FROM_NAME"
echo "   - NEXT_PUBLIC_APP_URL"
echo ""
echo "2. The GitHub Actions workflow will automatically deploy on push to main"
echo "3. Monitor the deployment in the Actions tab of your GitHub repository"
