# Gmail SMTP Setup Guide for ReceiptShield

This guide will help you set up Gmail SMTP to send invitation emails from your ReceiptShield application.

## 📧 **Step 1: Enable 2-Step Verification**

1. Go to your [Google Account Security Settings](https://myaccount.google.com/security)
2. Click on **"2-Step Verification"**
3. Follow the prompts to enable it (you'll need your phone)

## 🔑 **Step 2: Create an App Password**

1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select **"Mail"** from the "Select app" dropdown
3. Select **"Other (Custom name)"** from the "Select device" dropdown
4. Enter **"ReceiptShield"** as the name
5. Click **"Generate"**
6. **Copy the 16-character password** (you'll need this!)

## ⚙️ **Step 3: Configure Environment Variables**

### For Local Development:

Create or update your `.env.local` file:

```bash
# Gmail SMTP Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password

# App URL (optional)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### For Production (Firebase/Vercel):

Add these environment variables to your deployment platform:

**Firebase App Hosting:**
```bash
firebase apphosting:secrets:set GMAIL_USER
firebase apphosting:secrets:set GMAIL_APP_PASSWORD
```

**Or manually in Firebase Console:**
1. Go to Firebase Console → App Hosting
2. Go to Settings → Environment Variables
3. Add:
   - `GMAIL_USER`: your-email@gmail.com
   - `GMAIL_APP_PASSWORD`: your-16-character-app-password

## 🧪 **Step 4: Test the Email Service**

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to the Admin Dashboard → User Management
3. Click **"Invite User"**
4. Fill in the invitation form and send
5. Check your recipient's email inbox

## ⚠️ **Important Notes**

### Gmail Sending Limits:
- **100 emails per day** (free Gmail account)
- **500 recipients per day** (free Gmail account)
- **2000 emails per day** (Google Workspace account)

### Security Best Practices:
- ✅ **Never commit** `.env.local` to Git
- ✅ **Use App Passwords**, not your regular Gmail password
- ✅ **Keep your App Password secret**
- ✅ **Revoke App Passwords** you're no longer using

### Troubleshooting:

**"Invalid login" error:**
- Make sure you're using an **App Password**, not your regular Gmail password
- Check that 2-Step Verification is enabled
- Verify the email and password are correct

**"Connection refused" error:**
- Check your internet connection
- Gmail SMTP might be blocked by your firewall
- Try using port 465 instead of 587

**"Daily limit exceeded" error:**
- You've sent more than 100 emails in 24 hours
- Wait 24 hours or upgrade to Google Workspace

## 📝 **Alternative SMTP Settings**

If you need to manually configure SMTP settings:

```javascript
{
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // use TLS
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
}
```

Or for SSL:
```javascript
{
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
}
```

## 🚀 **Next Steps**

After setting up Gmail SMTP:

1. **Test thoroughly** in development
2. **Monitor your Gmail daily sending limit**
3. **Consider upgrading** to SendGrid or AWS SES for production
4. **Set up email templates** for different types of notifications

## 📚 **Additional Resources**

- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [Create App Passwords](https://support.google.com/accounts/answer/185833)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Google Workspace Limits](https://support.google.com/a/answer/166852)

## ✅ **Checklist**

- [ ] Enable 2-Step Verification on Gmail
- [ ] Create App Password
- [ ] Add GMAIL_USER to environment variables
- [ ] Add GMAIL_APP_PASSWORD to environment variables
- [ ] Test sending an invitation email
- [ ] Verify email received with correct formatting
- [ ] Check invitation link works correctly

---

**Need help?** Contact support or check the [troubleshooting section](#troubleshooting) above.

