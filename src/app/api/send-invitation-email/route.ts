import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { invitation, customMessage } = await request.json();
    
    // Get the base URL from environment or use production domain
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://compensationengine.com';
    const invitationUrl = `${baseUrl}/accept-invitation?token=${invitation.token}`;
    
    console.log('📧 Sending email to:', invitation.email);
    console.log('📧 Invitation URL:', invitationUrl);
    
    // Create Gmail SMTP transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
      },
    });

    // Email HTML template
    const htmlContent = `
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
            
            ${customMessage ? `
              <div class="message-box">
                <strong>Personal Message:</strong><br>
                ${customMessage.replace(/\n/g, '<br>')}
              </div>
            ` : ''}
            
            <div class="expiry-notice">
              <strong>⏰ Important:</strong> This invitation expires in 7 days. Please accept it soon!
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
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
            <p>&copy; 2025 ReceiptShield. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const info = await transporter.sendMail({
      from: `"ReceiptShield" <${process.env.GMAIL_USER}>`,
      to: invitation.email,
      subject: "You're invited to join ReceiptShield",
      html: htmlContent,
      text: `You're Invited to Join ReceiptShield!

Welcome to ReceiptShield, our intelligent expense management platform.

Your Role: ${invitation.role}

${customMessage ? `Personal Message: ${customMessage}\n\n` : ''}

IMPORTANT: This invitation expires in 7 days. Please accept it soon!

To accept your invitation and create your account, visit:
${invitationUrl}

What is ReceiptShield?
ReceiptShield is an intelligent expense management system that helps you:
- Upload receipts with AI-powered data extraction
- Automatic fraud detection and verification  
- Track and manage your expenses efficiently
- Get help from our AI assistant

If you didn't expect this invitation, you can safely ignore this email.

© 2025 ReceiptShield. All rights reserved.`,
    });

    console.log('✅ Email sent successfully:', info.messageId);
    
    return NextResponse.json({ 
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
      invitationUrl: invitationUrl
    });
  } catch (error) {
    console.error('❌ Failed to send invitation email:', error);
    
    let errorMessage = 'Failed to send email';
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Provide helpful error messages
      if (errorMessage.includes('Invalid login')) {
        errorMessage = 'Gmail authentication failed. Please check your Gmail credentials and ensure you are using an App Password.';
      } else if (errorMessage.includes('ECONNREFUSED')) {
        errorMessage = 'Could not connect to Gmail SMTP server. Please check your internet connection.';
      }
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
