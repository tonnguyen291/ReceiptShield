# 🚀 Quick Start Guide

Get up and running with ReceiptShield in under 10 minutes!

---

## ⚡ Super Quick Start (2 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/tonnguyen291/ReceiptShield.git
cd ReceiptShield

# 2. Install dependencies
npm install

# 3. Run the development server
npm run dev

# 4. Open your browser
# Visit: http://localhost:9003
```

**That's it!** The app is running locally.

---

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js** 18, 20, or 22 (v20 recommended)
- ✅ **npm** 7+ or **yarn** 1.22+
- ✅ **Git** for version control
- ✅ **Firebase Account** (for full functionality)
- ✅ **Code Editor** (VS Code recommended)

### Check Your Setup

```bash
node --version   # Should be v18, v20, or v22
npm --version    # Should be 7+
git --version    # Any recent version
```

---

## 🎯 Step-by-Step Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/tonnguyen291/ReceiptShield.git
cd ReceiptShield
```

### Step 2: Install Dependencies

This will install all required packages (~1,400 packages).

```bash
npm install
```

**Expected time:** 30-60 seconds

### Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp env.example .env.local
```

Edit `.env.local` with your Firebase credentials:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here

# AI Configuration
GOOGLE_GENAI_API_KEY=your_gemini_api_key_here

# Email (Optional)
SENDGRID_API_KEY=your_sendgrid_key_here
EMAIL_FROM=noreply@yourdomain.com
```

**Don't have Firebase credentials?** See [Firebase Setup Guide](../firebase/FIREBASE_SETUP.md)

### Step 4: Run the Development Server

```bash
npm run dev
```

You should see:

```
✓ Ready in 701ms
○ Local:   http://localhost:9003
○ Network: http://0.0.0.0:9003
```

### Step 5: Open in Browser

Navigate to: **http://localhost:9003**

You should see the ReceiptShield homepage!

---

## 🎨 What You'll See

### Landing Page
- Modern, clean design
- Feature overview
- Login/Signup buttons

### After Login
Depending on your role:

- **Employee**: Receipt upload, personal dashboard
- **Manager**: Team management, approval workflows
- **Admin**: Full system access, user management

---

## 🧪 Test the Application

### 1. Create an Account

1. Click "Sign Up"
2. Enter email and password
3. You'll be logged in as an **Employee** by default

### 2. Upload a Test Receipt

1. Go to dashboard
2. Click "Upload Receipt"
3. Drag & drop a receipt image (JPG, PNG, or PDF)
4. Watch the AI process it!

### 3. Explore the Dashboard

- View receipt history
- Check analytics
- Manage your profile

---

## 🛠️ Development Tools

### VS Code Extensions (Recommended)

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Check for linting errors
npm run lint:fix         # Auto-fix linting issues
npm run typecheck        # TypeScript type checking
npm run format           # Format code with Prettier

# Testing (once set up)
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

---

## 🚨 Troubleshooting

### Server Won't Start

**Error: `next: command not found`**

Solution:
```bash
npm install
```

**Error: Port 9003 already in use**

Solution:
```bash
# Kill the process using port 9003
lsof -ti:9003 | xargs kill
```

Or change the port in `package.json`:
```json
"dev": "next dev --turbopack --port 3000"
```

### Firebase Errors

**Error: `Firebase not configured`**

Solution:
1. Check `.env.local` exists
2. Verify all Firebase variables are set
3. Restart the dev server

See [Firebase Troubleshooting](../firebase/FIREBASE_EMAIL_TROUBLESHOOTING.md)

### Build Errors

**Error: TypeScript errors**

Solution:
```bash
npm run typecheck  # See all errors
```

Fix the TypeScript errors or temporarily skip:
```bash
npm run build -- --no-lint
```

---

## 📚 Next Steps

Now that you're running, here's what to explore next:

### For Users
1. [Upload your first receipt](../features/INVITATION_SYSTEM.md)
2. [Explore the dashboard](#)
3. [Invite team members](#)

### For Developers
1. **[Developer Playbook](../development/DEVELOPER_PLAYBOOK.md)** - Coding standards
2. **[Testing Setup](../testing/SETUP_TESTING.md)** - Set up tests
3. **[Architecture Docs](../architecture/C4_ARCHITECTURE.md)** - Understand the system

### For Admins
1. [Configure Firebase](../firebase/FIREBASE_SETUP.md)
2. [Set up email](../email/SENDGRID_SETUP_GUIDE.md)
3. [Deploy to production](../deployment/DEPLOYMENT_SETUP_GUIDE.md)

---

## 🎓 Learning Resources

### Video Tutorials (Coming Soon)
- Getting Started (5 min)
- First Receipt Upload (3 min)
- Admin Setup (10 min)

### Documentation
- [Full Documentation Index](../README.md)
- [FAQ](#) (Coming Soon)
- [Troubleshooting Guides](../testing/TESTING_GUIDE.md)

### Community
- [GitHub Discussions](https://github.com/tonnguyen291/ReceiptShield/discussions)
- [GitHub Issues](https://github.com/tonnguyen291/ReceiptShield/issues)

---

## ✨ Tips & Tricks

### Hot Reload
Changes to code automatically refresh the browser. No need to restart!

### React DevTools
Install [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) for debugging.

### Keyboard Shortcuts (Coming in v1.0)
- `Ctrl+U` - Upload receipt
- `Ctrl+D` - Go to dashboard
- `Ctrl+/` - Open command palette

### Dark Mode
Toggle dark mode in the user menu (top right).

---

## 🤝 Get Help

### For Questions
1. Check [Documentation](../README.md)
2. Search [GitHub Issues](https://github.com/tonnguyen291/ReceiptShield/issues)
3. Ask in [Discussions](https://github.com/tonnguyen291/ReceiptShield/discussions)

### For Bugs
1. [Report an Issue](https://github.com/tonnguyen291/ReceiptShield/issues/new?template=bug_report.md)
2. Include:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots
   - Browser/OS info

### For Features
1. [Request a Feature](https://github.com/tonnguyen291/ReceiptShield/issues/new?template=feature_request.md)
2. Explain:
   - What problem it solves
   - How you'd use it
   - Any alternatives you've considered

---

## 🎉 You're Ready!

Congratulations! You now have ReceiptShield running locally.

**What's next?**
- Upload your first receipt
- Explore the codebase
- Read the developer docs
- Contribute to the project

---

<div align="center">

**Welcome to the ReceiptShield Community!** 🛡️

[Main README](../../README.md) • [Full Documentation](../README.md) • [Contributing](../../CONTRIBUTING.md)

</div>

