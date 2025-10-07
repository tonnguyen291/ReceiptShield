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
    const severity = searchParams.get('severity');
    const limitCount = parseInt(searchParams.get('limit') || '50');
    
    // Build query
    let errorQuery = query(
      collection(db, 'error_logs'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    if (severity) {
      errorQuery = query(
        collection(db, 'error_logs'),
        where('severity', '==', severity),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
    }
    
    const errorSnapshot = await getDocs(errorQuery);
    const errorData = errorSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Calculate error statistics
    const totalErrors = errorData.length;
    const criticalErrors = errorData.filter(error => error.severity === 'error').length;
    const warningErrors = errorData.filter(error => error.severity === 'warning').length;
    
    return NextResponse.json({
      errors: errorData,
      statistics: {
        total: totalErrors,
        critical: criticalErrors,
        warnings: warningErrors,
        errorRate: totalErrors > 0 ? (criticalErrors / totalErrors) * 100 : 0
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Failed to fetch error logs:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch error logs',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      message, 
      stack, 
      context = {}, 
      severity = 'error',
      userAgent,
      url,
      userId
    } = body;
    
    // Log error
    await addDoc(collection(db, 'error_logs'), {
      message,
      stack,
      context,
      severity,
      userAgent: userAgent || (typeof window !== 'undefined' ? window.navigator.userAgent : 'server'),
      url: url || (typeof window !== 'undefined' ? window.location.href : 'server'),
      userId,
      timestamp: serverTimestamp(),
      environment: process.env.NODE_ENV || 'production'
    });
    
    // Check if this is a critical error that needs alerting
    if (severity === 'error') {
      await checkForCriticalErrorAlert(message, context);
    }
    
    return NextResponse.json({
      message: 'Error logged successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Failed to log error:', error);
    
    return NextResponse.json({
      error: 'Failed to log error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

async function checkForCriticalErrorAlert(message: string, context: any) {
  try {
    // Check recent critical errors
    const recentErrorsQuery = query(
      collection(db, 'error_logs'),
      where('severity', '==', 'error'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    
    const recentErrorsSnapshot = await getDocs(recentErrorsQuery);
    const recentErrors = recentErrorsSnapshot.docs.map(doc => doc.data());
    
    // If we have more than 5 critical errors in the last hour, send alert
    if (recentErrors.length >= 5) {
      await addDoc(collection(db, 'alerts'), {
        type: 'critical_error_spike',
        message: `High number of critical errors detected: ${recentErrors.length} errors`,
        context: {
          errorCount: recentErrors.length,
          latestError: message,
          latestContext: context
        },
        timestamp: serverTimestamp(),
        environment: process.env.NODE_ENV || 'production'
      });
    }
  } catch (alertError) {
    console.error('Failed to check for critical error alert:', alertError);
  }
}
