import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';
    
    // Return mock analytics data for static export
    const statistics = {
      uniqueUsers: 0,
      totalEvents: 0,
      eventTypes: [],
      timeRange
    };
    
    return NextResponse.json({ 
      events: [], 
      statistics, 
      timeRange 
    });
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
