import { NextRequest, NextResponse } from 'next/server';
import type { Invitation } from '@/types';

// Import nodemailer using dynamic import for better compatibility
const nodemailer = require('nodemailer');

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

// Email configuration
const emailConfig = {
  fromEmail: process.env.EMAIL_FROM || 'noreply@receiptshield.com',
  fromName: process.env.EMAIL_FROM_NAME || 'ReceiptShield',
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9003',
};

// Create nodemailer transporter
const createTransporter = () => {
  // If no SMTP credentials are provided, use a mock transporter
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('⚠️  No SMTP credentials found. Using mock email service (emails will be logged only)');
    return {
      sendMail: async (options: any) => {
        console.log('📧 Mock Email Sent:');
        console.log('  From:', options.from);
        console.log('  To:', options.to);
        console.log('  Subject:', options.subject);
        console.log('  HTML Length:', options.html?.length || 0);
        console.log('  Text Length:', options.text?.length || 0);
        
        return {
          messageId: 'mock-message-id-' + Date.now(),
          response: 'Mock email sent successfully'
        };
      }
    };
  }
  
  return nodemailer.createTransport(smtpConfig);
};

// Generate invitation email template
function generateInvitationEmail(
  invitation: Invitation,
  customMessage?: string
) {
  const invitationUrl = `${emailConfig.baseUrl}/accept-invitation?token=${invitation.token}`;
  const expiresAt = new Date(invitation.expiresAt).toLocaleDateString();
  
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
          <p>This invitation was sent by ${invitation.invitedBy} on ${new Date(invitation.createdAt).toLocaleDateString()}.</p>
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

This invitation was sent by ${invitation.invitedBy} on ${new Date(invitation.createdAt).toLocaleDateString()}.
If you didn't expect this invitation, you can safely ignore this email.

© 2024 ReceiptShield. All rights reserved.
  `;
  
  return { subject, html, text };
}

export async function POST(request: NextRequest) {
  try {
    console.log('📧 API: Received invitation email request');
    const { invitation, customMessage } = await request.json();
    
    console.log('📧 API: Invitation data:', invitation);
    
    if (!invitation || !invitation.email) {
      console.log('❌ API: Invalid invitation data');
      return NextResponse.json(
        { error: 'Invalid invitation data' },
        { status: 400 }
      );
    }

    const emailTemplate = generateInvitationEmail(invitation, customMessage);
    const transporter = createTransporter();
    
    console.log('📧 Sending invitation email...');
    console.log('To:', invitation.email);
    console.log('Subject:', emailTemplate.subject);
    console.log('Invitation URL:', `${emailConfig.baseUrl}/accept-invitation?token=${invitation.token}`);
    
    // Send the email
    const info = await transporter.sendMail({
      from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
      to: invitation.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    });
    
    console.log('✅ Invitation email sent successfully');
    console.log('Message ID:', info.messageId);
    
    return NextResponse.json({ 
      success: true, 
      messageId: info.messageId,
      previewUrl: null // Mock service doesn't provide preview URLs
    });
    
  } catch (error) {
    console.error('❌ API: Error sending invitation email:', error);
    console.error('❌ API: Error details:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Failed to send invitation email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
