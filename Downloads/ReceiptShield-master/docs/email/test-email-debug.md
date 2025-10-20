# Email Service Debugging

## Issue: Emails not being sent

### Potential Causes:

1. **Gmail credentials not loaded**: Environment variables not available at runtime
2. **SMTP connection issue**: Gmail blocking the connection
3. **API route not being called**: The email service endpoint not reached
4. **Nodemailer error**: SMTP authentication failing

### Debug Steps:

1. **Check if invitation is created** (this should work):
   - Go to Admin Dashboard → Invite User
   - Send invitation
   - Check if invitation appears in Firestore `invitations` collection

2. **Check browser console for errors**:
   - Look for 500 errors from `/api/send-invitation`
   - Check the error message

3. **Check server logs**:
   - Go to Firebase Console → App Hosting → receiptshield-backend
   - Click "Logs" to see server-side errors

### Quick Fix - Test Local Gmail:

Since the production environment might have issues with the secrets, let's verify locally first:

```bash
# Make sure .env.local has:
GMAIL_USER=aqallaf76@gmail.com
GMAIL_APP_PASSWORD=zkflkwxddkbnnyfx
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Run locally
npm run dev

# Test invitation at http://localhost:3000/admin/dashboard
```

### Alternative: Use Console.log for now

We can temporarily add more logging to see exactly what's happening:
- Check if GMAIL_USER and GMAIL_APP_PASSWORD are defined
- Log the nodemailer transporter creation
- Log the email sending attempt

