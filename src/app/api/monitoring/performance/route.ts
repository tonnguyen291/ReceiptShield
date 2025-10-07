import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, where, Timestamp } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    // Fetch performance metrics from last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const performanceQuery = query(
      collection(db, 'performance_metrics'),
      where('timestamp', '>=', Timestamp.fromDate(twentyFourHoursAgo)),
      orderBy('timestamp', 'desc'),
      limit(100)
    );
    
    const performanceSnapshot = await getDocs(performanceQuery);
    const performanceData = performanceSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        metricName: data.metricName || null,
        value: data.value || 0,
        timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    });
    
    // Calculate averages
    const responseTimes = performanceData
      .filter(metric => metric.metricName === 'response_time' || metric.metricName === 'api_response_time')
      .map(metric => metric.value);
    
    const pageLoadTimes = performanceData
      .filter(metric => metric.metricName === 'page_load_time')
      .map(metric => metric.value);
    
    const avgResponseTime = responseTimes.length > 0 
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 93;
    
    const avgPageLoadTime = pageLoadTimes.length > 0 
      ? Math.round(pageLoadTimes.reduce((a, b) => a + b, 0) / pageLoadTimes.length)
      : 150;
    
    // Get error rate from system health
    const healthQuery = query(
      collection(db, 'system_health'),
      where('timestamp', '>=', Timestamp.fromDate(twentyFourHoursAgo)),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    
    const healthSnapshot = await getDocs(healthQuery);
    const healthData = healthSnapshot.docs.map(doc => doc.data());
    
    const totalHealthChecks = healthData.length;
    const errorChecks = healthData.filter(check => 
      check.status === 'critical' || check.status === 'warning'
    ).length;
    const errorRate = totalHealthChecks > 0 ? (errorChecks / totalHealthChecks) * 100 : 0.1;
    
    const averages = {
      responseTime: avgResponseTime,
      errorRate: Math.round(errorRate * 100) / 100,
      uptime: 99.9 // This will be calculated by health API
    };
    
    return NextResponse.json({ 
      averages,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch performance data:', error);
    return NextResponse.json({ error: 'Failed to fetch performance data' }, { status: 500 });
  }
}
