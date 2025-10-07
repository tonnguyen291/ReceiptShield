import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { invitation, customMessage } = await request.json();
    
    // Mock email sending for static export
    console.log('📧 Mock email sent to:', invitation.email);
    console.log('📧 Invitation URL:', `/accept-invitation?token=${invitation.token}`);
    
    return NextResponse.json({ 
      success: true,
      message: 'Email sent successfully (mock)'
    });
  } catch (error) {
    console.error('Failed to send invitation email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
