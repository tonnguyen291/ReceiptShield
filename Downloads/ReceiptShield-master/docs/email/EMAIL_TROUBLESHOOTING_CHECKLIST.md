# Email Not Received - Troubleshooting Checklist

## 🔍 **Step 1: Verify SendGrid Sender Email**

**MOST COMMON ISSUE**: Your sender email must be verified in SendGrid.

1. Go to SendGrid: [Sender Authentication](https://app.sendgrid.com/settings/sender_auth/senders)
2. Look for `aqallaf76@gmail.com` in the list
3. **Status should show "Verified"** (green checkmark)

❌ If NOT verified:
   - Click "Resend Verification Email"
   - Check your Gmail inbox for verification link
   - Click the link to verify
   - Wait 5 minutes, then try sending again

---

## 🔍 **Step 2: Check SendGrid Activity Dashboard**

This tells you if SendGrid even received the request:

1. Go to: [SendGrid Activity](https://app.sendgrid.com/email_activity)
2. Look for recent email sends
3. Check the status:
   - ✅ **Delivered**: Email was sent successfully (check spam folder)
   - ⚠️ **Processed**: Email was accepted but not yet delivered
   - ❌ **Bounced**: Email address invalid or rejected
   - ❌ **Dropped**: SendGrid blocked it (usually unverified sender)
   - 🔴 **Nothing shows up**: Request never reached SendGrid (app error)

---

## 🔍 **Step 3: Check Your Spam/Junk Folder**

Even if delivered, emails from new senders often go to spam:

1. Check your **Spam** folder
2. Check **Promotions** tab (in Gmail)
3. Check **Social** tab (in Gmail)
4. Search for "ReceiptShield" in your email

---

## 🔍 **Step 4: Check Application Logs**

### For Production:

1. Go to [Google Cloud Console - Logs](https://console.cloud.google.com/logs/query?project=recieptshield)
2. Or use Firebase CLI:
   ```bash
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=receiptshield-backend" --limit 50 --format json --project recieptshield
   ```
3. Look for:
   - "SendGrid" mentions
   - "Email sent successfully"
   - Error messages with "Forbidden", "Unauthorized", etc.

### For Local Development:

Check your terminal where `npm run dev` is running for:
- ✅ "Email sent successfully"
- ❌ "SendGrid authentication failed"
- ❌ "Forbidden" or "403" errors

---

## 🔍 **Step 5: Verify Environment Variables**

### Production:
```bash
# Check that secrets are properly set
firebase apphosting:secrets:list --project recieptshield
```

Should show:
- ✅ SENDGRID_API_KEY
- ✅ SENDGRID_FROM_EMAIL (or it might not be needed as secret)

### Local:
Check your `.env.local` file has:
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxx...
SENDGRID_FROM_EMAIL=aqallaf76@gmail.com
```

---

## 🔍 **Step 6: Test SendGrid API Directly**

Create a test file to verify SendGrid works:

```bash
# Create test file
cat > test-sendgrid.js << 'EOF'
const sgMail = require('@sendgrid/mail');

// Set your API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || 'YOUR_API_KEY_HERE');

const msg = {
  to: 'YOUR_EMAIL@gmail.com', // Change to your email
  from: 'aqallaf76@gmail.com', // Must be verified in SendGrid
  subject: 'SendGrid Test Email',
  text: 'If you receive this, SendGrid is working!',
  html: '<strong>If you receive this, SendGrid is working!</strong>',
};

sgMail
  .send(msg)
  .then(() => {
    console.log('✅ Email sent successfully!');
    console.log('Check your inbox (and spam folder)');
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    if (error.response) {
      console.error('Response:', error.response.body);
    }
  });
EOF

# Run the test (make sure SENDGRID_API_KEY is in .env.local)
node test-sendgrid.js
```

---

## 🔍 **Step 7: Common Issues & Solutions**

### Issue: "403 Forbidden" Error
**Cause**: Sender email not verified in SendGrid  
**Solution**: 
1. Go to SendGrid Sender Authentication
2. Verify your sender email
3. Wait 5 minutes
4. Try again

### Issue: Emails go to Spam
**Cause**: New sender, no domain authentication  
**Solution**:
1. Ask recipient to mark as "Not Spam"
2. Set up Domain Authentication in SendGrid (long-term solution)
3. Add SPF/DKIM records to your domain

### Issue: "Unauthorized" Error  
**Cause**: Invalid API key  
**Solution**:
1. Check API key in `.env.local` (local) or Firebase secrets (production)
2. Create a new API key in SendGrid if needed
3. Update the secret:
   ```bash
   firebase apphosting:secrets:set SENDGRID_API_KEY --project recieptshield
   ```

### Issue: Nothing in SendGrid Activity
**Cause**: Request never reached SendGrid (app error)  
**Solution**:
1. Check application logs for errors
2. Verify `@sendgrid/mail` package is installed
3. Check code is using SendGrid (not nodemailer)
4. Restart your development server

### Issue: Email sent from localhost works, production doesn't
**Cause**: Production secrets not configured or deployment failed  
**Solution**:
1. Check deployment succeeded
2. Verify secrets have access granted:
   ```bash
   firebase apphosting:secrets:grantaccess SENDGRID_API_KEY --backend receiptshield-backend --project recieptshield
   ```
3. Check production logs for errors

---

## 📝 **Quick Diagnostic Commands**

Run these to check your setup:

```bash
# 1. Check secrets exist
firebase apphosting:secrets:list --project recieptshield

# 2. Check backend status
firebase apphosting:backends:list --project recieptshield

# 3. Test SendGrid API key locally
curl -X "POST" "https://api.sendgrid.com/v3/mail/send" \
  -H "Authorization: Bearer $SENDGRID_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "personalizations": [{"to": [{"email": "YOUR_EMAIL@gmail.com"}]}],
    "from": {"email": "aqallaf76@gmail.com"},
    "subject": "Test Email",
    "content": [{"type": "text/plain", "value": "Test"}]
  }'
```

---

## ✅ **Most Likely Causes (in order)**

1. **Sender email not verified in SendGrid** (90% of cases)
2. **Email in spam folder** (5% of cases)
3. **Wrong recipient email address** (2% of cases)
4. **Deployment still in progress** (2% of cases)
5. **API key issues** (1% of cases)

---

## 🆘 **Still Not Working?**

If you've checked everything above and it still doesn't work:

1. Share the error message from:
   - Application logs
   - SendGrid Activity dashboard
   - Browser console (F12 → Console tab)

2. Verify:
   - [ ] Sender email verified in SendGrid?
   - [ ] Anything in SendGrid Activity dashboard?
   - [ ] Checked spam folder?
   - [ ] Deployment succeeded?
   - [ ] Using production or localhost?

3. Try the direct SendGrid API test (Step 6)

---

**Most Important First Step**: Verify your sender email in SendGrid! 🔑

