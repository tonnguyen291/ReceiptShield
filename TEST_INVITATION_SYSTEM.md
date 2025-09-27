# Testing the Invitation System

## 🧪 Test Plan

The invitation system is now ready for testing! Here's a comprehensive test plan to verify all functionality.

## 📋 Prerequisites

1. **Development Server Running**: Make sure `npm run dev` is running
2. **Admin Access**: You need to be logged in as an admin user
3. **Firebase Setup**: Ensure your Firebase project is configured

## 🚀 Test Scenarios

### 1. **Admin Dashboard - Invitation Button**

**Steps:**
1. Navigate to `http://localhost:3000/admin/dashboard`
2. Look for the "Invite New User" button (should be enabled now)
3. Click the button

**Expected Result:**
- Invitation dialog opens
- Form fields are present (email, role, supervisor, message)
- Form validation works

### 2. **Send Employee Invitation**

**Steps:**
1. In the invitation dialog:
   - Email: `test.employee@example.com`
   - Role: `Employee`
   - Supervisor: Select a manager from dropdown
   - Message: `Welcome to our team!`
2. Click "Send Invitation"

**Expected Result:**
- Success toast appears
- Dialog closes
- Invitation appears in "Invitation Management" table
- Status shows as "Pending"
- Email is logged in console (check browser dev tools)

### 3. **Send Manager Invitation**

**Steps:**
1. Send another invitation:
   - Email: `test.manager@example.com`
   - Role: `Manager`
   - Message: `You'll be managing our team`
2. Click "Send Invitation"

**Expected Result:**
- Success toast appears
- New invitation appears in management table
- No supervisor field shown (managers don't need supervisors)

### 4. **Send Admin Invitation**

**Steps:**
1. Send another invitation:
   - Email: `test.admin@example.com`
   - Role: `Admin`
   - Message: `Full admin access granted`
2. Click "Send Invitation"

**Expected Result:**
- Success toast appears
- New invitation appears in management table

### 5. **Test Duplicate Email Prevention**

**Steps:**
1. Try to send another invitation to `test.employee@example.com`
2. Click "Send Invitation"

**Expected Result:**
- Error toast appears: "A pending invitation already exists for this email"

### 6. **Test Invitation Management**

**Steps:**
1. In the "Invitation Management" section:
2. Click the "..." menu on a pending invitation
3. Try "Cancel Invitation"

**Expected Result:**
- Confirmation dialog appears
- After confirming, status changes to "Cancelled"
- Success toast appears

### 7. **Test Invitation Acceptance**

**Steps:**
1. Copy the invitation URL from console logs (or construct it manually)
2. Open the URL in a new browser tab/incognito window
3. URL format: `http://localhost:3000/accept-invitation?token=INVITATION_TOKEN`

**Expected Result:**
- Invitation acceptance page loads
- Shows invitation details (email, role, invited by)
- Form for name and password is present

### 8. **Complete Account Creation**

**Steps:**
1. On the acceptance page:
   - Name: `Test Employee`
   - Password: `password123`
   - Confirm Password: `password123`
2. Click "Create Account & Accept Invitation"

**Expected Result:**
- Success toast appears
- Redirected to login page
- Invitation status changes to "Accepted" in admin dashboard

### 9. **Test Login with New Account**

**Steps:**
1. On login page, use:
   - Email: `test.employee@example.com`
   - Password: `password123`
2. Click "Sign In"

**Expected Result:**
- Successfully logged in
- Redirected to appropriate dashboard based on role
- User appears in "User Management" table

### 10. **Test Expired Invitation**

**Steps:**
1. Wait 7 days (or manually set expiry date in Firebase)
2. Try to access the invitation URL

**Expected Result:**
- Error message: "This invitation has expired"
- Cannot create account

## 🔍 Console Logs to Check

Open browser dev tools and check the console for:

1. **Email Generation Logs:**
   ```
   📧 Invitation Email Generated:
   To: test.employee@example.com
   Subject: You're invited to join ReceiptShield
   Invitation URL: http://localhost:3000/accept-invitation?token=...
   ✅ Invitation email sent successfully
   ```

2. **Welcome Email Logs:**
   ```
   📧 Welcome Email Generated for: test.employee@example.com
   Subject: Welcome to ReceiptShield!
   ✅ Welcome email sent successfully
   ```

## 🐛 Common Issues & Solutions

### Issue: "Invalid invitation link"
**Solution:** Check that the token in the URL matches what's in the database

### Issue: "Failed to create account"
**Solution:** Check Firebase permissions and ensure the user doesn't already exist

### Issue: Invitation dialog doesn't open
**Solution:** Check browser console for JavaScript errors

### Issue: Email not sending
**Solution:** Check the email service configuration in `src/lib/email-service.ts`

## 📊 Database Verification

Check your Firebase Firestore for:

1. **Invitations Collection:**
   - New documents created with invitation data
   - Status updates (pending → accepted)
   - Proper expiry dates set

2. **Users Collection:**
   - New user documents created
   - Correct role and supervisor assignments
   - Status set to "active"

## 🎯 Success Criteria

The invitation system is working correctly if:

- ✅ Admin can send invitations for all roles
- ✅ Invitations appear in management table
- ✅ Email templates are generated (logged in console)
- ✅ Invitation links work and show correct information
- ✅ Users can create accounts through invitation links
- ✅ New users can log in with created accounts
- ✅ Invitation status updates correctly
- ✅ Duplicate invitations are prevented
- ✅ Expired invitations are handled properly

## 🚀 Next Steps

Once testing is complete:

1. **Configure Email Service**: Set up real email provider (SendGrid, AWS SES, etc.)
2. **Customize Templates**: Update email templates with your company branding
3. **Set Environment Variables**: Configure email settings in production
4. **Monitor Usage**: Track invitation acceptance rates and user onboarding

## 📝 Test Data

Use these test emails for consistent testing:
- `test.employee@example.com` - Employee role
- `test.manager@example.com` - Manager role  
- `test.admin@example.com` - Admin role

Remember to clean up test data after testing is complete!

