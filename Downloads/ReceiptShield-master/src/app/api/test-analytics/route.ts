import { NextRequest, NextResponse } from 'next/server';
import { monitoring } from '@/lib/monitoring';

export async function POST(request: NextRequest) {
  try {
    const { eventName = 'test_event', userId = 'test-user' } = await request.json();

    // Track a test event
    await monitoring.trackEvent(eventName, {
      userId,
      timestamp: new Date().toISOString(),
      source: 'test_endpoint'
    });

    // Track performance metrics
    await monitoring.trackPerformance('test_response_time', Math.random() * 100 + 50);
    await monitoring.trackPerformance('test_page_load', Math.random() * 200 + 100);

    // Track system health
    await monitoring.trackSystemHealth({
      status: 'healthy',
      responseTime: Math.random() * 50 + 50,
      uptime: 99.9,
      errorRate: 0.1
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Test analytics events tracked successfully',
      eventName,
      userId
    });
  } catch (error) {
    console.error('Failed to track test analytics:', error);
    return NextResponse.json({ error: 'Failed to track test analytics' }, { status: 500 });
  }
}
