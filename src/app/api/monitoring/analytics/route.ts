import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, where, Timestamp } from 'firebase/firestore';
import { requireMonitoringAuth, logMonitoringAccess } from '@/lib/monitoring-auth';

export async function GET(request: NextRequest) {
  try {
    // Require authentication for monitoring access
    const user = requireMonitoringAuth(request);
    logMonitoringAccess(user, '/api/monitoring/analytics', 'GET');
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';
    
    // Calculate time range
    let hoursBack = 24;
    if (timeRange === '5m') hoursBack = 5 / 60; // 5 minutes
    else if (timeRange === '15m') hoursBack = 15 / 60; // 15 minutes
    else if (timeRange === '1h') hoursBack = 1;
    else if (timeRange === '6h') hoursBack = 6;
    else if (timeRange === '24h') hoursBack = 24;
    else if (timeRange === '7d') hoursBack = 24 * 7;
    
    const timeAgo = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
    
    // Fetch analytics events from Firestore
    const analyticsQuery = query(
      collection(db, 'analytics_events'),
      where('timestamp', '>=', Timestamp.fromDate(timeAgo)),
      orderBy('timestamp', 'desc'),
      limit(1000)
    );
    
    const analyticsSnapshot = await getDocs(analyticsQuery);
    const events = analyticsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        userId: data.userId || null,
        eventName: data.eventName || null,
        timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    });
    
    // Calculate statistics
    const uniqueUsers = new Set(events.map(event => event.userId).filter(Boolean)).size;
    const totalEvents = events.length;
    const eventTypes = [...new Set(events.map(event => event.eventName).filter(Boolean))];
    
    const statistics = {
      uniqueUsers,
      totalEvents,
      eventTypes,
      timeRange
    };
    
    return NextResponse.json({ 
      events, 
      statistics, 
      timeRange 
    });
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    
    // Check if it's an auth error
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({
        error: 'Unauthorized: Monitoring access required'
      }, { status: 401 });
    }
    
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
