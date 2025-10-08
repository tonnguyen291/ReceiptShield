import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { invitation, customMessage } = await request.json();
    
    // Get the base URL from environment or use production domain
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://compensationengine.com';
    const invitationUrl = `${baseUrl}/accept-invitation?token=${invitation.token}`;
    
    // Mock email sending for static export
    console.log('📧 Mock email sent to:', invitation.email);
    console.log('📧 Invitation URL:', invitationUrl);
    console.log('📧 Base URL used:', baseUrl);
    
    return NextResponse.json({ 
      success: true,
      message: 'Email sent successfully (mock)',
      invitationUrl: invitationUrl
    });
  } catch (error) {
    console.error('Failed to send invitation email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
