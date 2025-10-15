import { NextRequest, NextResponse } from 'next/server';
import { getInvitationByToken, updateInvitationStatus } from '@/lib/firebase-invitation-store';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://compensationengine.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400, headers: corsHeaders });
    }

    const invitation = await getInvitationByToken(token);
    
    if (!invitation) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json({ invitation }, { headers: corsHeaders });
  } catch (error) {
    console.error('Failed to get invitation:', error);
    return NextResponse.json({ error: 'Failed to get invitation' }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token, name, password } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400, headers: corsHeaders });
    }

    if (!name || !password) {
      return NextResponse.json({ error: 'Name and password are required' }, { status: 400, headers: corsHeaders });
    }

    // Get the invitation first
    const invitation = await getInvitationByToken(token);
    
    if (!invitation) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404, headers: corsHeaders });
    }

    // Check if invitation is still pending
    if (invitation.status !== 'pending') {
      return NextResponse.json({ error: 'Invitation has already been used or is no longer valid' }, { status: 400, headers: corsHeaders });
    }

    // Validate the invitation hasn't expired
    const createdAt = invitation.createdAt instanceof Date 
      ? invitation.createdAt 
      : new Date(invitation.createdAt);
    const expiresAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    if (new Date() > expiresAt) {
      await updateInvitationStatus(invitation.id, 'expired');
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 400, headers: corsHeaders });
    }
    
    // Return success - the actual user creation happens on the client side
    // The client will call updateInvitationStatus after creating the Firebase user
    return NextResponse.json({ 
      success: true, 
      message: 'Invitation validated successfully',
      invitation: {
        email: invitation.email,
        role: invitation.role,
        supervisorId: invitation.supervisorId,
      }
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Failed to accept invitation:', error);
    return NextResponse.json({ error: 'Failed to accept invitation' }, { status: 500, headers: corsHeaders });
  }
}
