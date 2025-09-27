# Invitation System Documentation

## Overview

The ReceiptShield invitation system allows administrators to invite new users to join the organization. The system includes email invitations, secure token-based acceptance, and comprehensive management features.

## Features

### For Administrators
- **Send Invitations**: Create and send invitations to new users with custom roles and supervisor assignments
- **Invitation Management**: View, cancel, and delete invitations
- **Status Tracking**: Monitor invitation status (pending, accepted, expired, cancelled)
- **Expiry Management**: Automatic expiration after 7 days with visual indicators

### For Invited Users
- **Secure Acceptance**: Token-based invitation links for security
- **Account Creation**: Streamlined signup process with pre-filled role information
- **Welcome Emails**: Automatic welcome emails upon account creation
- **Expiry Notifications**: Clear indication of invitation expiration

## System Architecture

### Database Schema

#### Invitations Collection (`invitations`)
```typescript
interface Invitation {
  id: string;
  email: string;
  role: UserRole;
  supervisorId?: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  token: string;
  expiresAt: Date;
  createdAt: Date;
  acceptedAt?: Date;
  acceptedBy?: string;
}
```

### Key Components

1. **Invitation Storage** (`src/lib/firebase-invitation-store.ts`)
   - CRUD operations for invitations
   - Token generation and validation
   - Expiry management

2. **Email Service** (`src/lib/email-service.ts`)
   - HTML email templates
   - Invitation and welcome emails
   - Configurable email providers

3. **Admin Interface**
   - Invite User Dialog (`src/components/admin/invite-user-dialog.tsx`)
   - Invitation Management Table (`src/components/admin/invitation-management-table.tsx`)

4. **User Acceptance**
   - Invitation Acceptance Page (`src/app/accept-invitation/page.tsx`)
   - API Route (`src/app/api/accept-invitation/route.ts`)

## Usage Guide

### Sending an Invitation

1. **Admin Dashboard**: Navigate to the Admin Dashboard
2. **Invite Button**: Click "Invite New User" button
3. **Fill Form**: Complete the invitation form:
   - Email address
   - Role (Employee, Manager, Admin)
   - Supervisor (for employees)
   - Optional personal message
4. **Send**: Click "Send Invitation"

### Managing Invitations

1. **View Invitations**: Check the "Invitation Management" section
2. **Status Monitoring**: See real-time status updates
3. **Actions Available**:
   - Cancel pending invitations
   - Delete expired/cancelled invitations
   - View expiry dates and status

### Accepting an Invitation

1. **Email Link**: Click the invitation link in the email
2. **Account Setup**: Fill in name and password
3. **Account Creation**: System creates account with assigned role
4. **Login**: Redirected to login page to access the system

## Configuration

### Environment Variables

Add these to your `.env.local` file:

```env
# Email Service Configuration
NEXT_PUBLIC_EMAIL_FROM=noreply@yourcompany.com
NEXT_PUBLIC_EMAIL_FROM_NAME=Your Company Name
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Email Service Integration

The system includes a placeholder email service that logs emails in development. For production, integrate with your preferred email provider:

#### SendGrid Integration
```typescript
// In src/lib/email-service.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendInvitationEmail(invitation: Invitation, customMessage?: string) {
  const emailTemplate = generateInvitationEmail(invitation, customMessage);
  
  await sgMail.send({
    to: invitation.email,
    from: config.fromEmail,
    subject: emailTemplate.subject,
    html: emailTemplate.html,
    text: emailTemplate.text,
  });
}
```

#### AWS SES Integration
```typescript
// In src/lib/email-service.ts
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({ region: 'us-east-1' });

export async function sendInvitationEmail(invitation: Invitation, customMessage?: string) {
  const emailTemplate = generateInvitationEmail(invitation, customMessage);
  
  const command = new SendEmailCommand({
    Destination: { ToAddresses: [invitation.email] },
    Message: {
      Subject: { Data: emailTemplate.subject },
      Body: {
        Html: { Data: emailTemplate.html },
        Text: { Data: emailTemplate.text },
      },
    },
    Source: config.fromEmail,
  });
  
  await sesClient.send(command);
}
```

## Security Features

### Token Security
- Unique tokens generated for each invitation
- Tokens are not predictable or sequential
- Tokens expire after 7 days

### Validation
- Email format validation
- Duplicate invitation prevention
- User existence checks
- Invitation status validation

### Access Control
- Only admins can send invitations
- Only pending invitations can be accepted
- Expired invitations are automatically marked as expired

## API Endpoints

### POST `/api/accept-invitation`
Accepts an invitation and creates a user account.

**Request Body:**
```json
{
  "token": "invitation_token",
  "name": "User Name",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "userId": "user_id"
}
```

## Error Handling

### Common Error Scenarios
1. **Invalid Token**: Token doesn't exist or is malformed
2. **Expired Invitation**: Invitation has passed its expiry date
3. **Already Accepted**: Invitation has already been accepted
4. **User Exists**: Email already has an account
5. **Email Service Failure**: Email sending fails (non-blocking)

### Error Messages
- Clear, user-friendly error messages
- Appropriate HTTP status codes
- Detailed logging for debugging

## Maintenance

### Cleanup Tasks
- Expired invitations are automatically marked as expired
- Consider implementing a cleanup job to remove old expired invitations
- Monitor email delivery rates and bounce handling

### Monitoring
- Track invitation acceptance rates
- Monitor email delivery success
- Log invitation-related activities for audit trails

## Future Enhancements

### Potential Improvements
1. **Bulk Invitations**: Send multiple invitations at once
2. **Invitation Templates**: Customizable email templates
3. **Resend Functionality**: Resend expired invitations
4. **Analytics**: Detailed invitation analytics and reporting
5. **Custom Expiry**: Configurable invitation expiry periods
6. **Role-based Invitations**: Different invitation flows for different roles

### Integration Opportunities
1. **SSO Integration**: Support for single sign-on providers
2. **Directory Sync**: Integration with Active Directory or similar
3. **Advanced Email**: Rich email templates with company branding
4. **Mobile Support**: Mobile-optimized invitation acceptance

## Troubleshooting

### Common Issues

1. **Invitations Not Sending**
   - Check email service configuration
   - Verify environment variables
   - Check email service provider limits

2. **Invitation Links Not Working**
   - Verify `NEXT_PUBLIC_APP_URL` is correct
   - Check if invitation has expired
   - Ensure token is not corrupted

3. **Account Creation Fails**
   - Check Firebase permissions
   - Verify user doesn't already exist
   - Check database connection

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
```

This will log detailed information about invitation processing and email sending.
