import { summarizeReceipt } from '@/ai/flows/summarize-receipt';
import { storeOCRAnalysis, updateSubmission } from '@/lib/firebase-submission-store';
import { 
  calculateImageHash, 
  calculateBlurScore, 
  extractImageDimensions, 
  getProcessingVersion 
} from '@/lib/submission-utils';
import type { OCRAnalysis, ReceiptDataItem } from '@/types';

export interface EnhancedOCRResult {
  extractedItems: ReceiptDataItem[];
  rawOcrText: string;
  ocrConfidence: number;
  extractionConfidence: number;
  imageHash: string;
  blurScore: number;
  imageDimensions: { width: number; height: number };
  processingTime: number;
  errorLog: string[];
}

/**
 * Enhanced OCR analysis that stores comprehensive results
 * @param imageDataUri - Base64 image data
 * @param submissionId - Submission ID for tracking
 * @param receiptId - Receipt ID for linking
 * @returns Promise with OCR analysis results
 */
export async function performEnhancedOCRAnalysis(
  imageDataUri: string,
  submissionId: string,
  receiptId: string
): Promise<EnhancedOCRResult> {
  const startTime = Date.now();
  const errorLog: string[] = [];
  const processingVersion = getProcessingVersion();

  try {
    // Update submission status to processing
    await updateSubmission(submissionId, { 
      status: 'processing',
      processedAt: new Date().toISOString()
    });

    // Perform image analysis in parallel
    const [imageHash, blurScore, imageDimensions] = await Promise.all([
      calculateImageHash(imageDataUri),
      calculateBlurScore(imageDataUri),
      extractImageDimensions(imageDataUri)
    ]);

    // Perform AI extraction
    let extractedItems: ReceiptDataItem[] = [];
    let extractionConfidence = 0;
    let rawOcrText = '';

    try {
      const summaryResult = await summarizeReceipt({ photoDataUri: imageDataUri });
      
      if (summaryResult && summaryResult.items) {
        extractedItems = summaryResult.items.map((item, index) => ({
          ...item,
          id: `item-${Date.now()}-${index}`,
        }));
        
        // Calculate extraction confidence based on successful extractions
        const criticalFields = ['Vendor', 'Date', 'Total Amount'];
        const foundCriticalFields = criticalFields.filter(field => 
          extractedItems.some(item => 
            item.label.toLowerCase().includes(field.toLowerCase()) && 
            !item.value.toLowerCase().includes('not found') &&
            !item.value.toLowerCase().includes('extraction failed')
          )
        ).length;
        
        extractionConfidence = foundCriticalFields / criticalFields.length;
        
        // Generate raw OCR text from extracted items
        rawOcrText = extractedItems
          .map(item => `${item.label}: ${item.value}`)
          .join('\n');
      } else {
        errorLog.push('AI extraction returned no items');
        extractionConfidence = 0;
      }
    } catch (aiError) {
      const errorMsg = `AI extraction failed: ${aiError instanceof Error ? aiError.message : 'Unknown error'}`;
      errorLog.push(errorMsg);
      console.error(errorMsg, aiError);
      
      // Create fallback items
      extractedItems = [
        { id: 'vendor', label: 'Vendor', value: 'Extraction Failed - Edit me' },
        { id: 'date', label: 'Date', value: 'Extraction Failed - Edit me' },
        { id: 'total-amount', label: 'Total Amount', value: 'Extraction Failed - Edit me' },
        { id: 'note', label: 'Note', value: 'AI extraction failed. Please review and edit manually.' }
      ];
    }

    // Calculate overall OCR confidence
    const ocrConfidence = Math.min(1, Math.max(0, 
      (extractionConfidence * 0.7) + 
      ((1 - blurScore) * 0.3) // Better image quality = higher confidence
    ));

    const processingTime = Date.now() - startTime;

    // Create OCR analysis record
    const ocrAnalysis: Omit<OCRAnalysis, 'submissionId'> = {
      receiptId,
      rawOcrText,
      ocrConfidence,
      ocrProcessingTime: processingTime,
      extractedItems,
      extractionConfidence,
      imageHash,
      blurScore,
      imageDimensions,
      analyzedAt: new Date().toISOString(),
      processingVersion,
      ...(errorLog.length > 0 && { errorLog }),
    };

    // Store OCR analysis
    await storeOCRAnalysis(ocrAnalysis);

    // Update submission status
    await updateSubmission(submissionId, { 
      status: 'ocr_completed',
      processedAt: new Date().toISOString()
    });

    return {
      extractedItems,
      rawOcrText,
      ocrConfidence,
      extractionConfidence,
      imageHash,
      blurScore,
      imageDimensions,
      processingTime,
      errorLog,
    };

  } catch (error) {
    const errorMsg = `OCR analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    errorLog.push(errorMsg);
    console.error(errorMsg, error);

    // Update submission with error status
    await updateSubmission(submissionId, { 
      status: 'uploaded', // Revert to uploaded status
      errorLog: errorLog
    });

    // Return fallback result
    return {
      extractedItems: [
        { id: 'vendor', label: 'Vendor', value: 'System Error - Edit me' },
        { id: 'date', label: 'Date', value: 'System Error - Edit me' },
        { id: 'total-amount', label: 'Total Amount', value: 'System Error - Edit me' },
        { id: 'note', label: 'Note', value: 'System error occurred. Please try again or contact support.' }
      ],
      rawOcrText: 'System error occurred during OCR processing',
      ocrConfidence: 0,
      extractionConfidence: 0,
      imageHash: '',
      blurScore: 1, // Maximum blur (worst quality)
      imageDimensions: { width: 0, height: 0 },
      processingTime: Date.now() - startTime,
      errorLog,
    };
  }
}

/**
 * Get OCR analysis results for a submission
 * @param submissionId - The submission ID
 * @returns Promise with OCR analysis or null if not found
 */
export async function getOCRAnalysisResults(submissionId: string): Promise<OCRAnalysis | null> {
  const { getOCRAnalysis } = await import('@/lib/firebase-submission-store');
  return await getOCRAnalysis(submissionId);
}
