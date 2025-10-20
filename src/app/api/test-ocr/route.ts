import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { imageData } = await request.json();

    if (!imageData) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    // Mock OCR response
    const ocrResult = {
      text: "Mock OCR Result - Receipt data extracted",
      confidence: 0.85,
      items: [
        { id: '1', name: 'Coffee', price: 4.50, quantity: 1 },
        { id: '2', name: 'Sandwich', price: 8.99, quantity: 1 }
      ],
      merchant: "Mock Coffee Shop",
      total: 13.49,
      date: new Date().toISOString(),
      processingTime: 150
    };

    return NextResponse.json({ ocrResult });
  } catch (error) {
    console.error('Failed to process OCR:', error);
    return NextResponse.json({ error: 'Failed to process OCR' }, { status: 500 });
  }
}
