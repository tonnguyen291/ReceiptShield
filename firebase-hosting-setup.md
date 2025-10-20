# 🔥 Firebase Hosting Setup Guide

## Option 1: Traditional Firebase Hosting (Recommended)

### Step 1: Update firebase.json for Hosting
```json
{
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "firestore": {
    "database": "(default)",
    "location": "nam5",
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

### Step 2: Update next.config.ts for Static Export
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
```

### Step 3: Build and Deploy
```bash
npm run build
firebase deploy --only hosting
```

## Option 2: Firebase Hosting with Next.js (Advanced)

### Step 1: Install Firebase Functions
```bash
npm install firebase-functions
```

### Step 2: Configure for Next.js SSR
```json
{
  "hosting": {
    "public": "out",
    "rewrites": [
      {
        "source": "**",
        "function": "nextjsFunc"
      }
    ]
  },
  "functions": {
    "source": ".",
    "runtime": "nodejs18"
  }
}
```

## Option 3: Fix Firebase SDK Issues

### Update package.json Firebase version
```json
{
  "dependencies": {
    "firebase": "^10.7.1",
    "firebase-admin": "^12.0.0"
  }
}
```

### Use Firebase v9+ modular imports correctly
```typescript
// Instead of:
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Use:
import { getFirestore } from 'firebase/firestore';
import { collection, addDoc } from 'firebase/firestore';
```

## Benefits of Firebase Hosting:
- ✅ Free tier available
- ✅ Global CDN
- ✅ SSL certificates
- ✅ Custom domains
- ✅ Easy deployment
- ✅ Firebase integration
