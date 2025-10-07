import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Return mock error data for static export
    const errors: any[] = [];
    
    return NextResponse.json({ 
      errors,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch error data:', error);
    return NextResponse.json({ error: 'Failed to fetch error data' }, { status: 500 });
  }
}
