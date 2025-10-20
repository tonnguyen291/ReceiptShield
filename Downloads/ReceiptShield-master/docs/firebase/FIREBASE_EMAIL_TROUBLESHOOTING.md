# Firebase Email Sending Troubleshooting Guide

## Problem
Emails are not sending from Firebase App Hosting (production), but work locally.

## Root Causes

### 1. **Network Restrictions** ⚠️
Firebase App Hosting may block outbound SMTP connections (port 587/465) by default for security reasons.

### 2. **Secret Configuration** 🔑
The `GMAIL_APP_PASSWORD` secret may not be properly configured or accessible.

### 3. **Environment Variables** 📝
Runtime environment variables may not be properly loaded.

---

## Solutions

### Option 1: Use Firebase Functions (Recommended) ✅

Firebase Functions have better network access and are designed for backend operations like sending emails.

#### Steps:
1. Move email sending logic to a Firebase Function
2. Call the function from your Next.js API route
3. Use Firebase Admin SDK for authentication

### Option 2: Use SendGrid/Mailgun API (Alternative) 📧

Instead of SMTP, use an email service API that works over HTTPS.

#### SendGrid Setup:
```bash
# Install SendGrid
npm install @sendgrid/mail

# Set up secret
firebase apphosting:secrets:set SENDGRID_API_KEY
```

#### Mailgun Setup:
```bash
# Install Mailgun
npm install mailgun.js form-data

# Set up secret
firebase apphosting:secrets:set MAILGUN_API_KEY
```

### Option 3: Fix Gmail SMTP Configuration 🔧

If you must use Gmail SMTP, ensure:

1. **Check Secret Access**:
```bash
# List all secrets
firebase apphosting:secrets:list

# Grant access to the secret
firebase apphosting:secrets:access GMAIL_APP_PASSWORD --project recieptshield
```

2. **Verify Environment Variables**:
```bash
# Check if variables are set in App Hosting
firebase apphosting:backends:get --project recieptshield
```

3. **Enable Network Access** (if possible):
   - Firebase App Hosting may require contacting Firebase support for SMTP access
   - Or use Cloud Run which has fewer network restrictions

---

## Recommended Solution: Implement SendGrid

SendGrid is more reliable for production email sending and works well with Firebase.

### Implementation Steps:

1. **Sign up for SendGrid** (free tier: 100 emails/day)
   - Go to https://sendgrid.com
   - Create an account and verify your email
   - Generate an API key

2. **Update environment configuration**:
```yaml
# apphosting.production.yaml
env:
  - variable: SENDGRID_API_KEY
    secret: SENDGRID_API_KEY
    availability:
      - RUNTIME
      
  - variable: SENDGRID_FROM_EMAIL
    value: noreply@compensationengine.com
    availability:
      - RUNTIME
```

3. **Set the secret**:
```bash
firebase apphosting:secrets:set SENDGRID_API_KEY --project recieptshield
# Paste your SendGrid API key when prompted
```

4. **Update the email service** to use SendGrid API instead of SMTP

---

## Quick Fix: Check Current Configuration

Run these commands to diagnose:

```bash
# 1. Check if secret exists
firebase apphosting:secrets:list --project recieptshield

# 2. Check backend configuration
firebase apphosting:backends:list --project recieptshield

# 3. View logs for errors
firebase apphosting:rollouts:list --project recieptshield
```

---

## Alternative: Use Firestore Triggers + Cloud Functions

Instead of sending emails directly from the API route:

1. Store invitation in Firestore with `emailSent: false`
2. Cloud Function listens for new invitations
3. Function sends email and updates `emailSent: true`
4. This separates email sending from the request/response cycle

---

## Next Steps

Choose one of these paths:

1. ✅ **Recommended**: Implement SendGrid (most reliable)
2. 🔧 **Advanced**: Move to Firebase Functions
3. 🔍 **Debug**: Check secret configuration and network access
4. 🔄 **Alternative**: Use Firestore triggers

Let me know which approach you'd like to take, and I'll help implement it!

