import { NextRequest, NextResponse } from 'next/server';
import { getInvitationByToken, updateInvitationStatus } from '@/lib/firebase-invitation-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const invitation = await getInvitationByToken(token);
    
    if (!invitation) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 });
    }

    return NextResponse.json({ invitation });
  } catch (error) {
    console.error('Failed to get invitation:', error);
    return NextResponse.json({ error: 'Failed to get invitation' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token, userData } = await request.json();

    if (!token || !userData) {
      return NextResponse.json({ error: 'Token and user data are required' }, { status: 400 });
    }

    // Get the invitation first
    const invitation = await getInvitationByToken(token);
    
    if (!invitation) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 });
    }

    // Update invitation status to accepted
    await updateInvitationStatus(invitation.id, 'accepted', userData.id);
    
    return NextResponse.json({ success: true, message: 'Invitation accepted successfully' });
  } catch (error) {
    console.error('Failed to accept invitation:', error);
    return NextResponse.json({ error: 'Failed to accept invitation' }, { status: 500 });
  }
}
