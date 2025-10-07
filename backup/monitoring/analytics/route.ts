import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

// Initialize Firebase
const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

const db = getFirestore(app);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('eventType');
    const timeRange = searchParams.get('timeRange') || '24h';
    
    // Calculate time range
    const now = new Date();
    const timeRangeMs = timeRange === '1h' ? 60 * 60 * 1000 :
                      timeRange === '24h' ? 24 * 60 * 60 * 1000 :
                      timeRange === '7d' ? 7 * 24 * 60 * 60 * 1000 :
                      24 * 60 * 60 * 1000; // default to 24h
    
    const startTime = new Date(now.getTime() - timeRangeMs);
    
    // Build query
    let analyticsQuery = query(
      collection(db, 'analytics_events'),
      where('timestamp', '>=', startTime),
      orderBy('timestamp', 'desc'),
      limit(1000)
    );
    
    if (eventType) {
      analyticsQuery = query(
        collection(db, 'analytics_events'),
        where('timestamp', '>=', startTime),
        where('eventType', '==', eventType),
        orderBy('timestamp', 'desc'),
        limit(1000)
      );
    }
    
    const analyticsSnapshot = await getDocs(analyticsQuery);
    const analyticsData = analyticsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Calculate analytics statistics
    const eventTypes = [...new Set(analyticsData.map(event => event.eventType))];
    const eventCounts = eventTypes.reduce((acc, eventType) => {
      acc[eventType] = analyticsData.filter(event => event.eventType === eventType).length;
      return acc;
    }, {} as Record<string, number>);
    
    const uniqueUsers = new Set(analyticsData.map(event => event.userId).filter(Boolean)).size;
    
    return NextResponse.json({
      events: analyticsData,
      statistics: {
        totalEvents: analyticsData.length,
        uniqueUsers,
        eventTypes,
        eventCounts,
        timeRange
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Failed to fetch analytics data:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch analytics data',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      eventType, 
      eventName, 
      userId, 
      sessionId,
      properties = {},
      value,
      pageName,
      userAgent,
      url
    } = body;
    
    // Log analytics event
    await addDoc(collection(db, 'analytics_events'), {
      eventType,
      eventName,
      userId,
      sessionId,
      properties,
      value,
      pageName,
      userAgent: userAgent || (typeof window !== 'undefined' ? window.navigator.userAgent : 'server'),
      url: url || (typeof window !== 'undefined' ? window.location.href : 'server'),
      timestamp: serverTimestamp(),
      environment: process.env.NODE_ENV || 'production'
    });
    
    return NextResponse.json({
      message: 'Analytics event logged',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Failed to log analytics event:', error);
    
    return NextResponse.json({
      error: 'Failed to log analytics event',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
