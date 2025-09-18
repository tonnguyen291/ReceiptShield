import { NextRequest, NextResponse } from 'next/server';
import { getAvailableOCRMethods, compareOCRMethods } from '@/lib/hybrid-ocr-service';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing OCR methods...');
    
    // Get available OCR methods
    const availableMethods = getAvailableOCRMethods();
    
    return NextResponse.json({
      success: true,
      availableMethods,
      message: 'OCR methods status retrieved successfully'
    });
    
  } catch (error) {
    console.error('❌ OCR test error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to test OCR methods',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing OCR comparison...');
    
    const body = await request.json();
    const { imageDataUri } = body;
    
    if (!imageDataUri) {
      return NextResponse.json({
        success: false,
        error: 'imageDataUri is required'
      }, { status: 400 });
    }
    
    // Compare OCR methods
    const comparison = await compareOCRMethods(imageDataUri);
    
    return NextResponse.json({
      success: true,
      comparison,
      message: 'OCR comparison completed successfully'
    });
    
  } catch (error) {
    console.error('❌ OCR comparison error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to compare OCR methods',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
