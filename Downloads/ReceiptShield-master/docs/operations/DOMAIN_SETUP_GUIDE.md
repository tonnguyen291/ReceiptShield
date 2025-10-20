# ReceiptShield Domain Setup Guide

This guide will walk you through setting up your custom domain with Firebase App Hosting and configuring DNS records on Porkbun.

## Prerequisites

- Firebase project with App Hosting enabled
- Domain registered on Porkbun
- Firebase CLI installed and authenticated

## Step 1: Configure Firebase App Hosting

### 1.1 Enable App Hosting
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize App Hosting (if not already done)
firebase apphosting:backends:create
```

### 1.2 Deploy your app to App Hosting
```bash
# Build and deploy
npm run deploy:production
```

## Step 2: Add Custom Domain in Firebase Console

### 2.1 Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **App Hosting** in the left sidebar
4. Click on your backend

### 2.2 Add Custom Domain
1. Click **"Add custom domain"**
2. Enter your domain (e.g., `receiptshield.com` or `app.receiptshield.com`)
3. Firebase will provide you with DNS records to configure

## Step 3: Configure DNS Records on Porkbun

### 3.1 Access Porkbun DNS Management
1. Log in to your Porkbun account
2. Go to your domain management
3. Click on **"DNS"** for your domain

### 3.2 Add Required DNS Records

Firebase will provide you with specific records, but typically you'll need:

#### Option A: Apex Domain (receiptshield.com)
```
Type: A
Name: @
Value: [Firebase provided IP addresses]
TTL: 300 (or default)
```

#### Option B: Subdomain (app.receiptshield.com)
```
Type: CNAME
Name: app
Value: [Firebase provided hostname]
TTL: 300 (or default)
```

### 3.3 Additional Records (if needed)
```
Type: TXT
Name: @
Value: [Firebase domain verification token]
TTL: 300
```

## Step 4: SSL Certificate Configuration

### 4.1 Automatic SSL
Firebase App Hosting automatically provisions SSL certificates for custom domains. This process typically takes:
- **Domain verification**: 5-15 minutes
- **SSL certificate provisioning**: 15-60 minutes

### 4.2 Verify SSL Certificate
Once configured, your domain should be accessible via HTTPS:
- `https://yourdomain.com`
- SSL certificate should be valid and trusted

## Step 5: Update Environment Variables

### 5.1 Update Production Environment
Update your `.env.production` file:
```bash
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 5.2 Update Firebase Auth Domain
In Firebase Console > Authentication > Settings:
1. Add your custom domain to **Authorized domains**
2. Update **Authorized redirect URIs** if needed

## Step 6: Test Your Setup

### 6.1 DNS Propagation Check
```bash
# Check if DNS is propagated
nslookup yourdomain.com
dig yourdomain.com
```

### 6.2 SSL Certificate Check
```bash
# Check SSL certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

### 6.3 Application Testing
1. Visit `https://yourdomain.com`
2. Test all major functionality:
   - User authentication
   - Receipt upload
   - Dashboard access
   - All user roles (employee, manager, admin)

## Troubleshooting

### Common Issues

#### DNS Not Propagating
- Wait 24-48 hours for full propagation
- Check with different DNS servers: `8.8.8.8`, `1.1.1.1`
- Clear your local DNS cache

#### SSL Certificate Issues
- Ensure domain is properly verified in Firebase Console
- Check that all DNS records are correctly configured
- Wait for certificate provisioning (can take up to 1 hour)

#### App Not Loading
- Verify Firebase App Hosting is deployed
- Check Firebase Console for deployment status
- Ensure all environment variables are set correctly

### Verification Commands

```bash
# Check Firebase deployment status
firebase apphosting:backends:list

# Check domain configuration
firebase apphosting:backends:get [BACKEND_ID]

# Redeploy if needed
npm run deploy:production
```

## Security Considerations

### 1. HTTPS Enforcement
Firebase App Hosting automatically enforces HTTPS for custom domains.

### 2. Security Headers
The `firebase.json` configuration includes security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### 3. CORS Configuration
Ensure your Firebase Auth and Firestore rules are configured for your custom domain.

## Next Steps

After successful domain setup:
1. Update all documentation with your production URL
2. Configure monitoring and analytics
3. Set up backup and disaster recovery procedures
4. Implement performance monitoring

## Support

If you encounter issues:
1. Check Firebase Console for error messages
2. Verify DNS configuration with online tools
3. Contact Firebase Support for App Hosting issues
4. Contact Porkbun Support for DNS issues
