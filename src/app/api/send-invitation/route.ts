import { NextRequest, NextResponse } from 'next/server';
import { sendInvitationEmail } from '@/lib/email-service';
import { createInvitation } from '@/lib/firebase-invitation-store';
import type { InvitationRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, ...invitationData } = body;
    
    // Create invitation in database
    const invitation = await createInvitation(invitationData, 'admin@corp.com'); // TODO: Get from auth
    
    // Send invitation email
    await sendInvitationEmail(invitation, message);
    
    return NextResponse.json({ 
      success: true, 
      invitationId: invitation.id,
      token: invitation.token 
    });
  } catch (error) {
    console.error('Error sending invitation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}
