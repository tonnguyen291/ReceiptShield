/**
 * Hybrid OCR Service
 * ==================
 * 
 * This service provides OCR functionality using either Tesseract.js or Google AI,
 * with fallback mechanisms and performance comparison.
 */

import { extractTextWithTesseract, TesseractOCRResult } from './tesseract-ocr-service';
import { performEnhancedOCRAnalysis } from './enhanced-ocr-service';
import { ReceiptDataItem } from '@/types';

export interface HybridOCRResult {
  text: string;
  confidence: number;
  items: ReceiptDataItem[];
  processingTime: number;
  errorLog: string[];
  method: 'tesseract' | 'google-ai' | 'fallback';
  fallbackReason?: string;
}

/**
 * Perform OCR analysis using the best available method
 * @param imageDataUri - The image as a data URI
 * @param submissionId - The submission ID for tracking
 * @param receiptId - The receipt ID for tracking
 * @param preferredMethod - Preferred OCR method ('tesseract' | 'google-ai' | 'auto')
 * @returns Promise with OCR results
 */
export async function performHybridOCRAnalysis(
  imageDataUri: string,
  submissionId: string,
  receiptId: string,
  preferredMethod: 'tesseract' | 'google-ai' | 'auto' = 'auto'
): Promise<HybridOCRResult> {
  const startTime = Date.now();
  const errorLog: string[] = [];
  
  console.log('🔄 Starting hybrid OCR analysis...');
  console.log('🎯 Preferred method:', preferredMethod);
  
  try {
    // Determine which method to use
    const method = await determineOCRMethod(preferredMethod);
    console.log('✅ Selected OCR method:', method);
    
    let result: HybridOCRResult;
    
    if (method === 'tesseract') {
      result = await performTesseractOCR(imageDataUri, startTime, errorLog);
    } else {
      result = await performGoogleAIOCR(imageDataUri, submissionId, receiptId, startTime, errorLog);
    }
    
    // If the primary method fails or has low confidence, try fallback
    if (result.confidence < 0.3 && method !== 'tesseract') {
      console.log('⚠️ Low confidence detected, trying Tesseract fallback...');
      const fallbackResult = await performTesseractOCR(imageDataUri, startTime, errorLog);
      
      if (fallbackResult.confidence > result.confidence) {
        result = {
          ...fallbackResult,
          method: 'tesseract',
          fallbackReason: `Low confidence (${(result.confidence * 100).toFixed(1)}%) from ${method}`
        };
        console.log('✅ Fallback to Tesseract successful');
      }
    }
    
    console.log('🎉 Hybrid OCR analysis completed');
    console.log('📊 Final method:', result.method);
    console.log('📊 Final confidence:', (result.confidence * 100).toFixed(1) + '%');
    console.log('📊 Items extracted:', result.items.length);
    
    return result;
    
  } catch (error) {
    const errorMsg = `Hybrid OCR analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    errorLog.push(errorMsg);
    console.error(errorMsg, error);
    
    return {
      text: '',
      confidence: 0,
      items: [],
      processingTime: Date.now() - startTime,
      errorLog,
      method: 'fallback',
      fallbackReason: 'All OCR methods failed'
    };
  }
}

/**
 * Determine which OCR method to use based on preferences and availability
 */
async function determineOCRMethod(preferredMethod: string): Promise<'tesseract' | 'google-ai'> {
  if (preferredMethod === 'tesseract') {
    return 'tesseract';
  }
  
  if (preferredMethod === 'google-ai') {
    // Check if Google AI API key is available
    const hasGoogleAIKey = process.env.GOOGLE_AI_API_KEY && 
                          process.env.GOOGLE_AI_API_KEY !== 'your_google_ai_api_key_here';
    
    if (hasGoogleAIKey) {
      return 'google-ai';
    } else {
      console.log('⚠️ Google AI API key not available, falling back to Tesseract');
      return 'tesseract';
    }
  }
  
  // Auto mode: prefer Google AI if available, otherwise Tesseract
  const hasGoogleAIKey = process.env.GOOGLE_AI_API_KEY && 
                        process.env.GOOGLE_AI_API_KEY !== 'your_google_ai_api_key_here';
  
  return hasGoogleAIKey ? 'google-ai' : 'tesseract';
}

/**
 * Perform OCR using Tesseract
 */
async function performTesseractOCR(
  imageDataUri: string,
  startTime: number,
  errorLog: string[]
): Promise<HybridOCRResult> {
  try {
    console.log('🔍 Using Tesseract OCR...');
    const tesseractResult = await extractTextWithTesseract(imageDataUri);
    
    return {
      text: tesseractResult.text,
      confidence: tesseractResult.confidence,
      items: tesseractResult.items,
      processingTime: Date.now() - startTime,
      errorLog: [...errorLog, ...tesseractResult.errorLog],
      method: 'tesseract'
    };
  } catch (error) {
    const errorMsg = `Tesseract OCR failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    errorLog.push(errorMsg);
    console.error(errorMsg, error);
    
    return {
      text: '',
      confidence: 0,
      items: [],
      processingTime: Date.now() - startTime,
      errorLog,
      method: 'tesseract'
    };
  }
}

/**
 * Perform OCR using Google AI
 */
async function performGoogleAIOCR(
  imageDataUri: string,
  submissionId: string,
  receiptId: string,
  startTime: number,
  errorLog: string[]
): Promise<HybridOCRResult> {
  try {
    console.log('🤖 Using Google AI OCR...');
    const googleResult = await performEnhancedOCRAnalysis(imageDataUri, submissionId, receiptId);
    
    return {
      text: googleResult.rawOcrText,
      confidence: googleResult.ocrConfidence,
      items: googleResult.extractedItems,
      processingTime: Date.now() - startTime,
      errorLog: [...errorLog, ...googleResult.errorLog],
      method: 'google-ai'
    };
  } catch (error) {
    const errorMsg = `Google AI OCR failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    errorLog.push(errorMsg);
    console.error(errorMsg, error);
    
    return {
      text: '',
      confidence: 0,
      items: [],
      processingTime: Date.now() - startTime,
      errorLog,
      method: 'google-ai'
    };
  }
}

/**
 * Get available OCR methods and their status
 */
export function getAvailableOCRMethods() {
  const hasGoogleAIKey = process.env.GOOGLE_AI_API_KEY && 
                        process.env.GOOGLE_AI_API_KEY !== 'your_google_ai_api_key_here';
  
  return {
    tesseract: {
      available: true,
      name: 'Tesseract.js',
      description: 'Open-source OCR engine, always available',
      confidence: 'Medium-High',
      speed: 'Fast'
    },
    'google-ai': {
      available: hasGoogleAIKey,
      name: 'Google AI (Gemini)',
      description: 'AI-powered OCR with advanced text understanding',
      confidence: 'High',
      speed: 'Medium',
      requiresApiKey: true
    }
  };
}

/**
 * Compare OCR methods performance
 */
export async function compareOCRMethods(imageDataUri: string): Promise<{
  tesseract: TesseractOCRResult;
  googleAI?: any;
  comparison: {
    faster: 'tesseract' | 'google-ai';
    moreAccurate: 'tesseract' | 'google-ai';
    moreItems: 'tesseract' | 'google-ai';
  };
}> {
  console.log('⚡ Comparing OCR methods...');
  
  const startTime = Date.now();
  
  // Run Tesseract
  const tesseractResult = await extractTextWithTesseract(imageDataUri);
  
  // Try Google AI if available
  let googleAIResult;
  const hasGoogleAIKey = process.env.GOOGLE_AI_API_KEY && 
                        process.env.GOOGLE_AI_API_KEY !== 'your_google_ai_api_key_here';
  
  if (hasGoogleAIKey) {
    try {
      // Note: This would need proper submission and receipt IDs in a real scenario
      googleAIResult = await performEnhancedOCRAnalysis(imageDataUri, 'test-submission', 'test-receipt');
    } catch (error) {
      console.log('⚠️ Google AI comparison failed:', error);
    }
  }
  
  // Compare results
  const comparison = {
    faster: tesseractResult.processingTime < (googleAIResult?.processingTime || Infinity) ? 'tesseract' : 'google-ai',
    moreAccurate: tesseractResult.confidence > (googleAIResult?.ocrConfidence || 0) ? 'tesseract' : 'google-ai',
    moreItems: tesseractResult.items.length > (googleAIResult?.extractedItems?.length || 0) ? 'tesseract' : 'google-ai'
  };
  
  console.log('📊 OCR Comparison Results:');
  console.log('  Faster:', comparison.faster);
  console.log('  More Accurate:', comparison.moreAccurate);
  console.log('  More Items:', comparison.moreItems);
  
  return {
    tesseract: tesseractResult,
    googleAI: googleAIResult,
    comparison
  };
}
