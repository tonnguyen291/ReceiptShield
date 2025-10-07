import { NextRequest, NextResponse } from 'next/server';
import { createInvitation } from '@/lib/firebase-invitation-store';
import { generateInvitationEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const invitationData = await request.json();

    // For now, use a mock invitedBy user ID
    // In a real app, this would come from authentication
    const invitedBy = 'system-admin';

    // Create invitation in database
    const invitation = await createInvitation(invitationData, invitedBy);

    // Generate email content
    const { subject, html, text } = generateInvitationEmail(invitation, invitationData.message);

    // In a real application, you would integrate with an email service like SendGrid, Mailgun, or AWS SES here.
    // For this mock implementation, we'll just log the email content.
    console.log('--- MOCK EMAIL SERVICE ---');
    console.log('To:', invitation.email);
    console.log('Subject:', subject);
    console.log('HTML Body:', html);
    console.log('Text Body:', text);
    console.log('--------------------------');

    return NextResponse.json({ 
      success: true, 
      token: invitation.token,
      message: 'Invitation created and email sent successfully.' 
    });
  } catch (error) {
    console.error('Failed to create invitation:', error);
    return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
  }
}
