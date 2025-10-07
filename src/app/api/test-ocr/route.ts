import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ 
    message: 'OCR service temporarily disabled for deployment' 
  });
}
