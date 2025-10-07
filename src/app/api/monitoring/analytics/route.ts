import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('eventType');
    const timeRange = searchParams.get('timeRange') || '24h';
    const limitCount = parseInt(searchParams.get('limit') || '50');
    
    let analyticsQuery = query(
      collection(db, 'analytics_events'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    if (eventType) {
      analyticsQuery = query(
        collection(db, 'analytics_events'),
        where('eventName', '==', eventType),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
    }
    
    const snapshot = await getDocs(analyticsQuery);
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Calculate statistics
    const uniqueUsers = new Set(events.map(event => event.userId || 'anonymous')).size;
    const totalEvents = events.length;
    const eventTypes = [...new Set(events.map(event => event.eventName))];
    
    const statistics = {
      uniqueUsers,
      totalEvents,
      eventTypes,
      timeRange
    };
    
    return NextResponse.json({ events, statistics, timeRange });
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const analyticsData = await request.json();
    
    await addDoc(collection(db, 'analytics_events'), {
      ...analyticsData,
      timestamp: serverTimestamp()
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to log analytics event:', error);
    return NextResponse.json({ error: 'Failed to log analytics event' }, { status: 500 });
  }
}
