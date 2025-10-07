import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Get recent health data
    const healthQuery = query(
      collection(db, 'system_health'),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
    
    const healthSnapshot = await getDocs(healthQuery);
    const latestHealth = healthSnapshot.docs[0]?.data();
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Log this health check
    await addDoc(collection(db, 'system_health'), {
      status: 'healthy',
      responseTime,
      timestamp: serverTimestamp(),
      environment: process.env.NODE_ENV || 'production'
    });
    
    return NextResponse.json({
      status: 'healthy',
      responseTime,
      uptime: latestHealth?.uptime || 99.9,
      errorRate: latestHealth?.errorRate || 0.1,
      activeUsers: latestHealth?.activeUsers || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const healthData = await request.json();
    
    await addDoc(collection(db, 'system_health'), {
      ...healthData,
      timestamp: serverTimestamp(),
      environment: process.env.NODE_ENV || 'production'
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to log health data:', error);
    return NextResponse.json({ error: 'Failed to log health data' }, { status: 500 });
  }
}
