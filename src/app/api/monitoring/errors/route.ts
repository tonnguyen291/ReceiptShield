import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity');
    const limitCount = parseInt(searchParams.get('limit') || '10');
    
    let errorsQuery = query(
      collection(db, 'error_logs'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    if (severity) {
      errorsQuery = query(
        collection(db, 'error_logs'),
        where('severity', '==', severity),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
    }
    
    const snapshot = await getDocs(errorsQuery);
    const errors = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return NextResponse.json({ errors });
  } catch (error) {
    console.error('Failed to fetch errors:', error);
    return NextResponse.json({ error: 'Failed to fetch errors' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const errorData = await request.json();
    
    await addDoc(collection(db, 'error_logs'), {
      ...errorData,
      timestamp: serverTimestamp(),
      severity: errorData.severity || 'error'
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to log error:', error);
    return NextResponse.json({ error: 'Failed to log error' }, { status: 500 });
  }
}
