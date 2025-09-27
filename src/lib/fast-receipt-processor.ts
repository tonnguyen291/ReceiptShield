/**
 * Fast Receipt Processor
 * =====================
 * 
 * Optimized receipt processing with timeouts and parallel processing
 */

import { withTimeout, retryWithBackoff } from './performance-utils';
import { summarizeReceipt } from '@/ai/flows/summarize-receipt';
import { flagFraudulentReceipt } from '@/ai/flows/flag-fraudulent-receipt';
import { getPredictionFromML } from './ml-fraud-service';
import type { ProcessedReceipt, ReceiptDataItem } from '@/types';

export interface FastProcessingResult {
  items: ReceiptDataItem[];
  isFraudulent: boolean;
  fraudProbability: number;
  explanation: string;
  processingTime: number;
  method: 'fast' | 'fallback';
}

/**
 * Fast receipt processing with optimized timeouts
 */
export async function processReceiptFast(
  imageDataUri: string,
  items?: ReceiptDataItem[]
): Promise<FastProcessingResult> {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Starting fast receipt processing...');
    
    // If items are already provided, skip AI extraction
    if (items && items.length > 0) {
      console.log('📋 Using provided items, skipping AI extraction');
      return await processWithExistingItems(items, startTime);
    }
    
    // Fast AI extraction with timeout
    const extractionResult = await withTimeout(
      summarizeReceipt({ photoDataUri: imageDataUri }),
      10000, // 10 second timeout
      'AI extraction timeout'
    );
    
    const extractedItems = extractionResult.items || [];
    console.log('✅ AI extraction completed:', extractedItems.length, 'items');
    
    // Process with extracted items
    return await processWithExistingItems(extractedItems, startTime);
    
  } catch (error) {
    console.error('❌ Fast processing failed:', error);
    
    // Return fallback result
    return {
      items: [
        { id: '1', label: 'Vendor', value: 'Processing Failed - Edit me' },
        { id: '2', label: 'Date', value: 'Processing Failed - Edit me' },
        { id: '3', label: 'Total Amount', value: 'Processing Failed - Edit me' },
        { id: '4', label: 'Note', value: 'AI processing failed. Please fill in the details manually.' }
      ],
      isFraudulent: true,
      fraudProbability: 0.8,
      explanation: 'Processing failed - manual review required',
      processingTime: Date.now() - startTime,
      method: 'fallback'
    };
  }
}

/**
 * Process receipt with existing items
 */
async function processWithExistingItems(
  items: ReceiptDataItem[],
  startTime: number
): Promise<FastProcessingResult> {
  
  // Run fraud detection and ML prediction in parallel
  const [fraudResult, mlResult] = await Promise.allSettled([
    // AI fraud detection with timeout
    withTimeout(
      flagFraudulentReceipt({ 
        items, 
        receiptImage: 'processed' 
      }),
      8000, // 8 second timeout
      'AI fraud detection timeout'
    ),
    
    // ML prediction with timeout
    withTimeout(
      getPredictionFromML(items),
      5000, // 5 second timeout
      'ML prediction timeout'
    )
  ]);
  
  // Process results
  const aiFraudResult = fraudResult.status === 'fulfilled' ? fraudResult.value : null;
  const mlPrediction = mlResult.status === 'fulfilled' ? mlResult.value : null;
  
  // Determine final fraud status
  const isFraudulent = aiFraudResult?.fraudulent || mlPrediction?.is_fraudulent || false;
  const fraudProbability = Math.max(
    aiFraudResult?.fraudProbability || 0,
    mlPrediction?.fraud_probability || 0
  );
  
  const explanation = aiFraudResult?.explanation || 
    (mlPrediction ? `ML prediction: ${mlPrediction.risk_level} risk` : 'Analysis incomplete');
  
  console.log('✅ Fast processing completed in', Date.now() - startTime, 'ms');
  
  return {
    items,
    isFraudulent,
    fraudProbability,
    explanation,
    processingTime: Date.now() - startTime,
    method: 'fast'
  };
}

/**
 * Ultra-fast processing for simple receipts
 */
export async function processReceiptUltraFast(
  imageDataUri: string
): Promise<FastProcessingResult> {
  const startTime = Date.now();
  
  try {
    // Quick AI extraction with shorter timeout
    const extractionResult = await withTimeout(
      summarizeReceipt({ photoDataUri: imageDataUri }),
      5000, // 5 second timeout
      'Ultra-fast processing timeout'
    );
    
    const items = extractionResult.items || [];
    
    // Skip fraud detection for ultra-fast mode
    return {
      items,
      isFraudulent: false,
      fraudProbability: 0,
      explanation: 'Ultra-fast processing - fraud detection skipped',
      processingTime: Date.now() - startTime,
      method: 'fast'
    };
    
  } catch (error) {
    console.error('❌ Ultra-fast processing failed:', error);
    
    return {
      items: [
        { id: '1', label: 'Vendor', value: 'Quick Processing Failed - Edit me' },
        { id: '2', label: 'Date', value: 'Quick Processing Failed - Edit me' },
        { id: '3', label: 'Total Amount', value: 'Quick Processing Failed - Edit me' }
      ],
      isFraudulent: false,
      fraudProbability: 0,
      explanation: 'Quick processing failed - manual entry required',
      processingTime: Date.now() - startTime,
      method: 'fallback'
    };
  }
}
