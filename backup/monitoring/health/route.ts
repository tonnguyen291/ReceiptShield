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
    const startTime = Date.now();
    
    // Check system health
    const healthChecks = await Promise.allSettled([
      checkDatabaseHealth(),
      checkApiHealth(),
      checkSystemResources()
    ]);
    
    const responseTime = Date.now() - startTime;
    
    // Determine overall health status
    const hasErrors = healthChecks.some(check => check.status === 'rejected');
    const status = hasErrors ? 'warning' : 'healthy';
    
    // Log health check
    await logHealthCheck({
      status,
      responseTime,
      checks: healthChecks.map((check, index) => ({
        name: ['database', 'api', 'system'][index],
        status: check.status,
        error: check.status === 'rejected' ? check.reason : null
      })),
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({
      status,
      timestamp: new Date().toISOString(),
      responseTime,
      checks: {
        database: healthChecks[0].status === 'fulfilled' ? 'healthy' : 'error',
        api: healthChecks[1].status === 'fulfilled' ? 'healthy' : 'error',
        system: healthChecks[2].status === 'fulfilled' ? 'healthy' : 'error'
      },
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    });
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'critical',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      uptime: process.uptime()
    }, { status: 500 });
  }
}

async function checkDatabaseHealth() {
  try {
    // Test database connection by querying a collection
    const testQuery = query(collection(db, 'health_checks'), limit(1));
    await getDocs(testQuery);
    return { status: 'healthy', message: 'Database connection successful' };
  } catch (error) {
    throw new Error(`Database health check failed: ${error}`);
  }
}

async function checkApiHealth() {
  try {
    // Test API endpoints
    const endpoints = [
      '/api/auth/status',
      '/api/receipts/status'
    ];
    
    const results = await Promise.allSettled(
      endpoints.map(endpoint => 
        fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://compensationengine.com'}${endpoint}`)
      )
    );
    
    const failedEndpoints = results.filter(result => result.status === 'rejected').length;
    
    if (failedEndpoints > 0) {
      throw new Error(`${failedEndpoints} API endpoints failed health check`);
    }
    
    return { status: 'healthy', message: 'All API endpoints responding' };
  } catch (error) {
    throw new Error(`API health check failed: ${error}`);
  }
}

async function checkSystemResources() {
  try {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    // Check memory usage (alert if > 80%)
    const memoryUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    if (memoryUsagePercent > 80) {
      throw new Error(`High memory usage: ${memoryUsagePercent.toFixed(2)}%`);
    }
    
    return { 
      status: 'healthy', 
      message: 'System resources within normal limits',
      memoryUsage: memoryUsagePercent,
      cpuUsage: cpuUsage.user + cpuUsage.system
    };
  } catch (error) {
    throw new Error(`System resources check failed: ${error}`);
  }
}

async function logHealthCheck(healthData: any) {
  try {
    await addDoc(collection(db, 'health_checks'), {
      ...healthData,
      timestamp: serverTimestamp(),
      environment: process.env.NODE_ENV || 'production'
    });
  } catch (error) {
    console.error('Failed to log health check:', error);
  }
}

// POST endpoint for manual health checks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { checkType, details } = body;
    
    // Log manual health check
    await addDoc(collection(db, 'manual_health_checks'), {
      checkType,
      details,
      timestamp: serverTimestamp(),
      environment: process.env.NODE_ENV || 'production'
    });
    
    return NextResponse.json({
      message: 'Manual health check logged',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Manual health check failed:', error);
    
    return NextResponse.json({
      error: 'Failed to log manual health check',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
