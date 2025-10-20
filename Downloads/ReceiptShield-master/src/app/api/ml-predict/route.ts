import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const receiptData = await request.json();

    // Mock ML prediction response
    const prediction = {
      is_fraudulent: false,
      fraud_probability: Math.random() * 0.3, // Random low probability
      risk_level: 'LOW' as const,
      confidence: 0.5,
      features: {
        amount: receiptData.amount || 0,
        merchant: receiptData.merchant || '',
        category: receiptData.category || '',
        time_of_day: new Date().getHours(),
        day_of_week: new Date().getDay()
      }
    };

    return NextResponse.json({ prediction });
  } catch (error) {
    console.error('Failed to get ML prediction:', error);
    return NextResponse.json({ error: 'Failed to get ML prediction' }, { status: 500 });
  }
}
