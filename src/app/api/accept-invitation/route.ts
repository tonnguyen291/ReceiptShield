import { NextRequest, NextResponse } from 'next/server';
import { getInvitationByToken, updateInvitationStatus, isInvitationExpired } from '@/lib/firebase-invitation-store';
import { addUser } from '@/lib/firebase-user-store';
import { sendWelcomeEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { token, name, password } = await request.json();

    if (!token || !name || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: token, name, and password are required' },
        { status: 400 }
      );
    }

    // Get the invitation
    const invitation = await getInvitationByToken(token);
    
    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 404 }
      );
    }

    // Check invitation status
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: `Invitation has already been ${invitation.status}` },
        { status: 400 }
      );
    }

    // Check if invitation is expired
    if (isInvitationExpired(invitation)) {
      await updateInvitationStatus(invitation.id, 'expired');
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      );
    }

    // Create the user
    const userId = await addUser({
      name: name.trim(),
      email: invitation.email,
      role: invitation.role,
      supervisorId: invitation.supervisorId,
      status: 'active',
    });

    // Update invitation status
    await updateInvitationStatus(invitation.id, 'accepted', userId);

    // Send welcome email
    try {
      await sendWelcomeEmail(invitation.email, name);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      userId,
    });

  } catch (error) {
    console.error('Error accepting invitation:', error);
    
    if (error instanceof Error) {
      // Handle specific Firebase errors
      if (error.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'A user with this email already exists' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}
