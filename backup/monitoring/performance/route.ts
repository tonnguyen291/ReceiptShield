import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';
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
    // Get recent performance metrics
    const performanceQuery = query(
      collection(db, 'performance_metrics'),
      orderBy('timestamp', 'desc'),
      limit(100)
    );
    
    const performanceSnapshot = await getDocs(performanceQuery);
    const performanceData = performanceSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Calculate average metrics
    const avgResponseTime = performanceData.reduce((sum, metric) => 
      sum + (metric.responseTime || 0), 0) / performanceData.length || 0;
    
    const avgPageLoadTime = performanceData.reduce((sum, metric) => 
      sum + (metric.pageLoadTime || 0), 0) / performanceData.length || 0;
    
    const errorRate = performanceData.filter(metric => metric.error).length / performanceData.length || 0;
    
    return NextResponse.json({
      metrics: performanceData,
      averages: {
        responseTime: Math.round(avgResponseTime),
        pageLoadTime: Math.round(avgPageLoadTime),
        errorRate: Math.round(errorRate * 100) / 100
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Failed to fetch performance metrics:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch performance metrics',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      metricName, 
      value, 
      unit = 'ms', 
      context = {},
      pageName,
      apiEndpoint,
      responseTime,
      pageLoadTime,
      error
    } = body;
    
    // Log performance metric
    await addDoc(collection(db, 'performance_metrics'), {
      metricName,
      value,
      unit,
      context,
      pageName,
      apiEndpoint,
      responseTime,
      pageLoadTime,
      error: error || false,
      timestamp: serverTimestamp(),
      environment: process.env.NODE_ENV || 'production'
    });
    
    return NextResponse.json({
      message: 'Performance metric logged',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Failed to log performance metric:', error);
    
    return NextResponse.json({
      error: 'Failed to log performance metric',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
