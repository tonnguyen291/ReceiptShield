import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, where, Timestamp } from 'firebase/firestore';
import { requireMonitoringAuth, logMonitoringAccess } from '@/lib/monitoring-auth';

export async function GET(request: NextRequest) {
  try {
    // Require authentication for monitoring access
    const user = requireMonitoringAuth(request);
    logMonitoringAccess(user, '/api/monitoring/health', 'GET');
    const startTime = Date.now();
    
    // Calculate real uptime based on health checks in last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const healthQuery = query(
      collection(db, 'system_health'),
      where('timestamp', '>=', Timestamp.fromDate(twentyFourHoursAgo)),
      orderBy('timestamp', 'desc'),
      limit(100)
    );
    
    const healthSnapshot = await getDocs(healthQuery);
    const healthChecks = healthSnapshot.docs.map(doc => doc.data());
    
    // Calculate uptime percentage
    const totalChecks = healthChecks.length;
    const successfulChecks = healthChecks.filter(check => check.status === 'healthy').length;
    const uptime = totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 99.9;
    
    // Calculate average response time
    const responseTimes = healthChecks.map(check => check.responseTime || 0).filter(rt => rt > 0);
    const avgResponseTime = responseTimes.length > 0 
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 93;
    
    // Calculate error rate
    const errorChecks = healthChecks.filter(check => check.status === 'critical' || check.status === 'warning').length;
    const errorRate = totalChecks > 0 ? (errorChecks / totalChecks) * 100 : 0.1;
    
    // Get current active users (last 5 minutes for real-time tracking)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const analyticsQuery = query(
      collection(db, 'analytics_events'),
      where('timestamp', '>=', Timestamp.fromDate(fiveMinutesAgo))
    );
    
    const analyticsSnapshot = await getDocs(analyticsQuery);
    const uniqueUsers = new Set(analyticsSnapshot.docs.map(doc => doc.data().userId).filter(Boolean)).size;
    
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: uptime > 95 ? 'healthy' : uptime > 80 ? 'warning' : 'critical',
      responseTime,
      uptime: Math.round(uptime * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      activeUsers: uniqueUsers,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    // Check if it's an auth error
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({
        error: 'Unauthorized: Monitoring access required'
      }, { status: 401 });
    }
    
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
