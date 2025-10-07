import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, where, Timestamp } from 'firebase/firestore';
import { requireMonitoringAuth, logMonitoringAccess } from '@/lib/monitoring-auth';

export async function GET(request: NextRequest) {
  try {
    // Require authentication for monitoring access
    const user = requireMonitoringAuth(request);
    logMonitoringAccess(user, '/api/monitoring/errors', 'GET');
    // Fetch error logs from last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const errorsQuery = query(
      collection(db, 'error_logs'),
      where('timestamp', '>=', Timestamp.fromDate(twentyFourHoursAgo)),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    
    const errorsSnapshot = await getDocs(errorsQuery);
    const errors = errorsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || new Date().toISOString()
    }));
    
    return NextResponse.json({ 
      errors,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch error data:', error);
    
    // Check if it's an auth error
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({
        error: 'Unauthorized: Monitoring access required'
      }, { status: 401 });
    }
    
    return NextResponse.json({ error: 'Failed to fetch error data' }, { status: 500 });
  }
}
