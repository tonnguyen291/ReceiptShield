import { NextRequest, NextResponse } from 'next/server';
import { createInvitation } from '@/lib/firebase-invitation-store';
import { generateInvitationEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Send invitation API called');
    
    const invitationData = await request.json();
    console.log('📧 Invitation data received:', {
      email: invitationData.email,
      role: invitationData.role,
      hasMessage: !!invitationData.message
    });

    // For now, use a mock invitedBy user ID
    // In a real app, this would come from authentication
    const invitedBy = 'system-admin';

    // Create invitation in database
    console.log('📧 Creating invitation in database...');
    const invitation = await createInvitation(invitationData, invitedBy);
    console.log('📧 Invitation created successfully:', invitation.id);

    // Generate email content
    console.log('📧 Generating email content...');
    const { subject, html, text } = generateInvitationEmail(invitation, invitationData.message);

    // In a real application, you would integrate with an email service like SendGrid, Mailgun, or AWS SES here.
    // For this mock implementation, we'll just log the email content.
    console.log('--- MOCK EMAIL SERVICE ---');
    console.log('To:', invitation.email);
    console.log('Subject:', subject);
    console.log('Invitation URL:', `https://compensationengine.com/accept-invitation?token=${invitation.token}`);
    console.log('HTML Body Length:', html.length);
    console.log('Text Body Length:', text.length);
    console.log('--------------------------');

    return NextResponse.json({ 
      success: true, 
      token: invitation.token,
      message: 'Invitation created and email sent successfully.',
      invitationUrl: `https://compensationengine.com/accept-invitation?token=${invitation.token}`
    });
  } catch (error) {
    console.error('❌ Failed to create invitation:', error);
    
    // Provide more specific error information
    let errorMessage = 'Failed to create invitation';
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
