# SendGrid Setup Guide for ReceiptShield

This guide will help you set up SendGrid for sending invitation emails in your ReceiptShield application. SendGrid is **recommended for production** as it's more reliable than Gmail SMTP and works better with Firebase App Hosting.

## 🎯 **Why SendGrid?**

✅ **More Reliable**: HTTPS API instead of SMTP (which Firebase App Hosting may block)  
✅ **Better for Production**: Designed for transactional emails  
✅ **Free Tier**: 100 emails/day (same as Gmail)  
✅ **No SMTP Issues**: Works with all hosting platforms including Firebase  
✅ **Better Deliverability**: Higher chance of emails landing in inbox  

---

## 📧 **Step 1: Create a SendGrid Account**

1. Go to [SendGrid](https://sendgrid.com)
2. Click **"Start for Free"** or **"Sign Up"**
3. Fill in your information:
   - Email address
   - Password
   - Company name (or personal name)
4. Verify your email address (check your inbox for verification link)
5. Complete the onboarding questionnaire

**Free Tier Limits:**
- 100 emails per day (forever free)
- No credit card required

---

## 🔑 **Step 2: Create an API Key**

1. Once logged in, go to **Settings** → **API Keys** (in the left sidebar)
   - Direct link: [https://app.sendgrid.com/settings/api_keys](https://app.sendgrid.com/settings/api_keys)

2. Click **"Create API Key"**

3. Configure your API key:
   - **API Key Name**: `ReceiptShield Production` (or any descriptive name)
   - **API Key Permissions**: Select **"Full Access"** (or minimum **"Mail Send"**)

4. Click **"Create & View"**

5. **⚠️ IMPORTANT**: Copy the API key immediately!
   - It looks like: `SG.xxxxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy`
   - You won't be able to see it again after closing the dialog
   - Save it securely (you'll need it for Step 4)

---

## ✉️ **Step 3: Verify Your Sender Email**

SendGrid requires you to verify the email address you'll send from. There are two options:

### Option A: Single Sender Verification (Easier - Recommended for Getting Started)

1. Go to **Settings** → **Sender Authentication** → **Single Sender Verification**
   - Direct link: [https://app.sendgrid.com/settings/sender_auth/senders](https://app.sendgrid.com/settings/sender_auth/senders)

2. Click **"Create New Sender"**

3. Fill in the form:
   - **From Name**: `ReceiptShield` (or your company name)
   - **From Email Address**: `aqallaf76@gmail.com` (or your preferred email)
   - **Reply To**: Same as from email (or a different one if you prefer)
   - **Company Address**: Your address
   - **Nickname**: `ReceiptShield Main` (internal reference)

4. Click **"Create"**

5. **Check your email** for a verification link from SendGrid
   - Click the verification link to confirm

6. ✅ Once verified, you can use this email as your sender address!

### Option B: Domain Authentication (Better for Production)

If you own a domain (like `receiptshield.com`), you can authenticate the entire domain:

1. Go to **Settings** → **Sender Authentication** → **Domain Authentication**
2. Follow the wizard to add DNS records to your domain
3. This allows you to send from any email on your domain (e.g., `noreply@receiptshield.com`)

**Note**: For now, use Option A (Single Sender Verification) to get started quickly.

---

## ⚙️ **Step 4: Configure Environment Variables**

### For Local Development (.env.local):

Create or update your `.env.local` file:

```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
SENDGRID_FROM_EMAIL=aqallaf76@gmail.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note**: Replace with your actual API key and verified email from Steps 2 and 3.

### For Production (Firebase App Hosting):

The API key has already been set as a secret. To verify or update:

```bash
# Check if the secret exists
firebase apphosting:secrets:list --project recieptshield

# If you need to update it
firebase apphosting:secrets:set SENDGRID_API_KEY --project recieptshield
```

The sender email is configured in `apphosting.production.yaml`:
```yaml
- variable: SENDGRID_FROM_EMAIL
  value: aqallaf76@gmail.com
```

**✅ Already Configured**: The production environment has been set up with:
- `SENDGRID_API_KEY` (secret): Your API key
- `SENDGRID_FROM_EMAIL`: aqallaf76@gmail.com

---

## 🧪 **Step 5: Test SendGrid Integration**

### Test Locally:

1. Make sure your `.env.local` has the SendGrid variables
2. Start your development server:
   ```bash
   npm run dev
   ```
3. Go to the Admin Dashboard → User Management
4. Click **"Invite User"**
5. Fill in the invitation form and send
6. Check the recipient's email inbox

### Test in Production:

After deploying:
1. Go to your production site
2. Send a test invitation
3. Check SendGrid Activity:
   - Go to **Activity** in SendGrid dashboard
   - You should see the email in the activity log
   - Check if it was delivered, opened, etc.

---

## 📊 **Step 6: Monitor Email Activity**

SendGrid provides detailed analytics:

1. Go to **Activity** in SendGrid dashboard
   - Direct link: [https://app.sendgrid.com/email_activity](https://app.sendgrid.com/email_activity)

2. You can see:
   - ✉️ Emails sent
   - ✅ Delivered
   - 📖 Opened
   - 🖱️ Clicked
   - ⚠️ Bounced
   - 🚫 Spam reports

3. **Daily Limit Tracking**:
   - SendGrid automatically tracks your usage
   - You get 100 emails/day on the free tier
   - Resets at midnight UTC

---

## ⚠️ **Important Notes**

### Security Best Practices:
- ✅ **Never commit** `.env.local` to Git (it's already in `.gitignore`)
- ✅ **Keep your API key secret** - treat it like a password
- ✅ **Rotate API keys** periodically for security
- ✅ **Use different keys** for development and production

### SendGrid Limits (Free Tier):
- **100 emails per day** (resets at midnight UTC)
- **Unlimited contacts**
- **Email validation** included
- **Email API access**

### Email Best Practices:
- ✅ Always use verified sender emails
- ✅ Include unsubscribe links for marketing emails (not required for transactional)
- ✅ Monitor your sender reputation in SendGrid
- ✅ Keep bounce rates low (< 5%)
- ✅ Avoid spam trigger words

---

## 🔧 **Troubleshooting**

### "Unauthorized" Error:
**Cause**: Invalid or missing API key  
**Solution**: 
1. Check that `SENDGRID_API_KEY` is set correctly
2. Verify the API key in SendGrid dashboard
3. Create a new API key if needed

### "Forbidden" Error:
**Cause**: Sender email not verified  
**Solution**:
1. Go to Settings → Sender Authentication
2. Verify your sender email
3. Check your inbox for the verification link

### Emails Going to Spam:
**Cause**: Poor sender reputation or content issues  
**Solution**:
1. Use a verified domain (Domain Authentication)
2. Avoid spam trigger words
3. Include a physical address in footer
4. Monitor your sender reputation in SendGrid

### Daily Limit Exceeded:
**Cause**: Sent more than 100 emails in 24 hours  
**Solution**:
1. Wait for the daily reset (midnight UTC)
2. Or upgrade to a paid plan:
   - **Essentials**: $19.95/mo for 50,000 emails/month
   - **Pro**: $89.95/mo for 100,000 emails/month

### Emails Not Sending (No Error):
**Cause**: Various issues  
**Solution**:
1. Check SendGrid Activity dashboard
2. Look for bounces or blocks
3. Verify the recipient email is valid
4. Check your application logs for errors

---

## 📈 **Upgrading SendGrid**

If you need more than 100 emails/day:

### Pricing Tiers:
- **Free**: 100 emails/day (forever)
- **Essentials**: $19.95/mo (50,000 emails/month)
- **Pro**: $89.95/mo (100,000 emails/month)
- **Premier**: Custom pricing (custom volume)

### When to Upgrade:
- You have more than 100 users
- You send daily/weekly digest emails
- You need email templates
- You need advanced analytics
- You need dedicated IP addresses

---

## 🚀 **Next Steps**

After setting up SendGrid:

1. ✅ **Test thoroughly** in development
2. ✅ **Deploy to production** and test there too
3. ✅ **Monitor SendGrid Activity** for the first few days
4. ✅ **Set up email templates** (optional - for branded emails)
5. ✅ **Configure webhooks** (optional - for tracking opens/clicks)
6. ✅ **Set up suppressions** (optional - for handling unsubscribes)

---

## 📚 **Additional Resources**

- [SendGrid Documentation](https://docs.sendgrid.com/)
- [SendGrid API Reference](https://docs.sendgrid.com/api-reference)
- [SendGrid Node.js Library](https://github.com/sendgrid/sendgrid-nodejs)
- [Email Best Practices](https://docs.sendgrid.com/ui/sending-email/email-best-practices)
- [Sender Authentication Guide](https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication)

---

## ✅ **Setup Checklist**

- [ ] Create SendGrid account
- [ ] Verify email address
- [ ] Create API key (with "Mail Send" or "Full Access" permissions)
- [ ] Verify sender email (Single Sender Verification)
- [ ] Add `SENDGRID_API_KEY` to `.env.local`
- [ ] Add `SENDGRID_FROM_EMAIL` to `.env.local`
- [ ] Test sending an invitation email locally
- [ ] Verify email received with correct formatting
- [ ] Check SendGrid Activity dashboard
- [ ] Deploy to production
- [ ] Test sending an invitation email in production
- [ ] Monitor SendGrid Activity for production emails

---

## 🆚 **SendGrid vs Gmail SMTP Comparison**

| Feature | SendGrid | Gmail SMTP |
|---------|----------|------------|
| **Setup Difficulty** | Medium | Easy |
| **Free Tier** | 100 emails/day | 100 emails/day |
| **Reliability** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Firebase Compatibility** | ✅ Perfect | ⚠️ May be blocked |
| **Deliverability** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Analytics** | ✅ Detailed | ❌ None |
| **API vs SMTP** | ✅ HTTPS API | SMTP (ports 587/465) |
| **Sender Verification** | Required | Not required |
| **Production Ready** | ✅ Yes | ⚠️ Limited |
| **Scalability** | ⭐⭐⭐⭐⭐ | ⭐⭐ |

**Recommendation**: Use **SendGrid for production**, Gmail SMTP for quick local testing only.

---

**Need help?** 
- Check the [troubleshooting section](#-troubleshooting) above
- Visit [SendGrid Support](https://support.sendgrid.com/)
- Email your team administrator

---

**Current Status**: ✅ SendGrid is configured and ready for production use!

