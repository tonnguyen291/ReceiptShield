# Email Not Sending - Debug Steps

## Issue
Invitations are created in Firestore (count increases) but emails are not being sent.

## What We Know
1. ✅ Backend API works (curl test succeeded)
2. ✅ SendGrid secrets configured correctly
3. ✅ Invitation created in Firestore (count: 5 → 6)
4. ❌ No email-related console logs
5. ❌ Nothing in SendGrid Activity dashboard

## Debug Steps to Try

### 1. Check Network Tab (Most Important!)
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Click "Send Invitation"
4. Look for API calls:
   - `send-invitation` (should be POST)
   - `send-invitation-email` (should be POST)

**What to check:**
- Do these API calls appear?
- What's the status code? (200 = success, 4xx/5xx = error)
- Click on the request → **Response** tab → What does it say?
- Click on the request → **Preview** tab → Any error messages?

### 2. Check Console Tab for API Logs
Look for these console messages:
```
📧 Send invitation API called
📧 Creating invitation in database...
📧 Sending invitation email...
📧 Email sent successfully
```

If you DON'T see these, the API isn't being called.

### 3. Check for CORS or Fetch Errors
In Console tab, look for errors like:
- `Failed to fetch`
- `CORS error`
- `Network error`
- `TypeError`

### 4. Test the API Directly
From the same browser where you're logged in:

1. Open DevTools Console
2. Paste and run:
```javascript
fetch('/api/send-invitation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    role: 'employee',
    message: 'Test invitation'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

3. Check what gets logged

## Possible Causes

### A. Frontend Not Calling API
- Check Network tab - no API calls appear
- Fix: Check the invite dialog submission code

### B. API Call Failing Silently
- Check Network tab - API calls show errors
- Check response/preview for error details

### C. Email Service Called But Failing
- API returns success but email doesn't send
- Check production logs in Firebase/Cloud Run

### D. Deployment Issue
- Old code still running
- Solution: Wait for deployment or force refresh (Ctrl+Shift+R)

## Next Steps

1. **Open Network tab and try sending invitation**
2. **Share screenshot or copy the response from the network request**
3. **Check console for any error messages**

## Quick Test Command

Test email API directly from command line:
```bash
curl -X POST "https://receiptshield-backend--recieptshield.us-central1.hosted.app/api/send-invitation" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","role":"employee","message":"Test"}'
```

This should return the invitation token and status.

