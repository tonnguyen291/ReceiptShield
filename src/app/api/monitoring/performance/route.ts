import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Return mock performance data for static export
    const averages = {
      responseTime: 93,
      errorRate: 0.1,
      uptime: 99.9
    };
    
    return NextResponse.json({ 
      averages,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch performance data:', error);
    return NextResponse.json({ error: 'Failed to fetch performance data' }, { status: 500 });
  }
}
