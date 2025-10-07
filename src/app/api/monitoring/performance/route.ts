import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitCount = parseInt(searchParams.get('limit') || '10');
    
    // Get recent performance metrics
    const performanceQuery = query(
      collection(db, 'performance_metrics'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(performanceQuery);
    const metrics = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return NextResponse.json({ metrics });
  } catch (error) {
    console.error('Failed to fetch performance metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch performance metrics' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const performanceData = await request.json();
    
    await addDoc(collection(db, 'performance_metrics'), {
      ...performanceData,
      timestamp: serverTimestamp()
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to log performance data:', error);
    return NextResponse.json({ error: 'Failed to log performance data' }, { status: 500 });
  }
}
