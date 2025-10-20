import type { Invitation } from '@/types';

// Type declaration for nodemailer (optional dependency)
declare const nodemailer: any;

// Email service for sending invitation emails
// This is a placeholder implementation that would integrate with your email service provider
// You can replace this with your preferred email service (SendGrid, AWS SES, etc.)

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailServiceConfig {
  fromEmail: string;
  fromName: string;
  baseUrl: string; // Your application's base URL
}

// Default configuration - you should set these in your environment variables
const defaultConfig: EmailServiceConfig = {
  fromEmail: process.env.EMAIL_FROM || 'noreply@receiptshield.com',
  fromName: process.env.EMAIL_FROM_NAME || 'ReceiptShield',
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://compensationengine.com',
};

// SMTP configuration
const smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
};

// Create nodemailer transporter
const createTransporter = () => {
  // If no SMTP credentials are provided, use a test account
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('⚠️  No SMTP credentials found. Using test account (emails will not be sent)');
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass',
      },
    });
  }
  
  return nodemailer.createTransport(smtpConfig);
};

// Generate invitation email template
export function generateInvitationEmail(
  invitation: Invitation,
  customMessage?: string,
  config: EmailServiceConfig = defaultConfig
): EmailTemplate {
  const invitationUrl = `${config.baseUrl}/accept-invitation?token=${invitation.token}`;
  const expiresAt = invitation.expiresAt.toLocaleDateString();
  
  const subject = `You're invited to join ReceiptShield`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invitation to ReceiptShield</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e1e5e9; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6c757d; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .button:hover { background: #5a6fd8; }
        .role-badge { display: inline-block; background: #e3f2fd; color: #1976d2; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 500; text-transform: capitalize; }
        .message-box { background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; }
        .expiry-notice { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 You're Invited!</h1>
          <p>Join your team on ReceiptShield</p>
        </div>
        
        <div class="content">
          <h2>Welcome to ReceiptShield!</h2>
          <p>You've been invited to join ReceiptShield, our intelligent expense management platform.</p>
          
          <p><strong>Your Role:</strong> <span class="role-badge">${invitation.role}</span></p>
          <p><strong>Invited by:</strong> ${invitation.invitedBy}</p>
          
          ${customMessage ? `
            <div class="message-box">
              <strong>Personal Message:</strong><br>
              ${customMessage.replace(/\n/g, '<br>')}
            </div>
          ` : ''}
          
          <div class="expiry-notice">
            <strong>⏰ Important:</strong> This invitation expires on ${expiresAt}. Please accept it soon!
          </div>
          
          <p>Click the button below to accept your invitation and create your account:</p>
          
          <div style="text-align: center;">
            <a href="${invitationUrl}" class="button">Accept Invitation & Create Account</a>
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${invitationUrl}</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e1e5e9;">
          
          <h3>What is ReceiptShield?</h3>
          <p>ReceiptShield is an intelligent expense management system that helps you:</p>
          <ul>
            <li>📸 Upload receipts with AI-powered data extraction</li>
            <li>🔍 Automatic fraud detection and verification</li>
            <li>📊 Track and manage your expenses efficiently</li>
            <li>🤖 Get help from our AI assistant</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>This invitation was sent by ${invitation.invitedBy} on ${invitation.createdAt.toLocaleDateString()}.</p>
          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          <p>&copy; 2024 ReceiptShield. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
You're Invited to Join ReceiptShield!

Welcome to ReceiptShield, our intelligent expense management platform.

Your Role: ${invitation.role}
Invited by: ${invitation.invitedBy}

${customMessage ? `Personal Message: ${customMessage}\n\n` : ''}

IMPORTANT: This invitation expires on ${expiresAt}. Please accept it soon!

To accept your invitation and create your account, visit:
${invitationUrl}

What is ReceiptShield?
ReceiptShield is an intelligent expense management system that helps you:
- Upload receipts with AI-powered data extraction
- Automatic fraud detection and verification  
- Track and manage your expenses efficiently
- Get help from our AI assistant

This invitation was sent by ${invitation.invitedBy} on ${invitation.createdAt.toLocaleDateString()}.
If you didn't expect this invitation, you can safely ignore this email.

© 2024 ReceiptShield. All rights reserved.
  `;
  
  return { subject, html, text };
}

// Send invitation email
export async function sendInvitationEmail(
  invitation: Invitation,
  customMessage?: string,
  config: EmailServiceConfig = defaultConfig
): Promise<void> {
  try {
    console.log('📧 Sending invitation email...');
    console.log('To:', invitation.email);
    console.log('Invitation URL:', `${config.baseUrl}/accept-invitation?token=${invitation.token}`);
    
    const response = await fetch('/api/send-invitation-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invitation,
        customMessage,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send invitation email');
    }
    
    const result = await response.json();
    console.log('✅ Invitation email sent successfully');
    console.log('Message ID:', result.messageId);
    
    if (result.previewUrl) {
      console.log('🔗 Preview URL:', result.previewUrl);
    }
    
  } catch (error) {
    console.error('❌ Error sending invitation email:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to email service. Please check your internet connection and try again.');
      } else if (error.message.includes('400')) {
        throw new Error('Invalid request: Please check the invitation data and try again.');
      } else if (error.message.includes('500')) {
        throw new Error('Server error: The email service is temporarily unavailable. Please try again later.');
      } else {
        throw new Error(`Email service error: ${error.message}`);
      }
    }
    
    throw new Error('Failed to send invitation email');
  }
}

// Send welcome email after user accepts invitation
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string,
  config: EmailServiceConfig = defaultConfig
): Promise<void> {
  try {
    const subject = 'Welcome to ReceiptShield!';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to ReceiptShield</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e1e5e9; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6c757d; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to ReceiptShield!</h1>
          </div>
          
          <div class="content">
            <h2>Hi ${userName}!</h2>
            <p>Your account has been successfully created and you're now part of the ReceiptShield team!</p>
            
            <p>You can now:</p>
            <ul>
              <li>📸 Upload and manage your receipts</li>
              <li>🔍 Get AI-powered fraud detection</li>
              <li>📊 Track your expense history</li>
              <li>🤖 Chat with our AI assistant</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${config.baseUrl}/login" class="button">Login to Your Account</a>
            </div>
          </div>
          
          <div class="footer">
            <p>If you have any questions, feel free to reach out to your team administrator.</p>
            <p>&copy; 2024 ReceiptShield. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    console.log('📧 Sending welcome email...');
    console.log('To:', userEmail);
    console.log('Subject:', subject);
    
    // For now, just log the welcome email (you can create a separate API route if needed)
    console.log('✅ Welcome email generated successfully');
    console.log('Note: Welcome email API route not implemented yet');
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
}
