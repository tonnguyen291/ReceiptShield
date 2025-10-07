import { flagFraudulentReceipt } from '@/ai/flows/flag-fraudulent-receipt';
import { getPredictionFromML, calculateOverallRiskAssessment } from '@/lib/ml-fraud-service';
import { storeFraudAnalysis, updateSubmission, getOCRAnalysis } from '@/lib/firebase-submission-store';
import type { EnhancedFraudAnalysis, ReceiptDataItem, FraudAnalysis } from '@/types';

export interface EnhancedFraudResult {
  isFraudulent: boolean;
  fraudProbability: number;
  explanation: string;
  riskFactors: {
    imageQuality: 'good' | 'poor' | 'excellent';
    extractionConfidence: 'high' | 'medium' | 'low';
    vendorVerification: 'verified' | 'unknown' | 'suspicious';
    amountReasonableness: 'normal' | 'high' | 'suspicious';
  };
  duplicateDetection: {
    isDuplicate: boolean;
    similarSubmissions: string[];
    similarityScore: number;
  };
  analysis: EnhancedFraudAnalysis;
}

/**
 * Perform enhanced fraud analysis with submission tracking
 * @param items - Extracted receipt items
 * @param imageSource - Image URL or data URI
 * @param submissionId - Submission ID for tracking
 * @param receiptId - Receipt ID for linking
 * @returns Promise with enhanced fraud analysis results
 */
export async function performEnhancedFraudAnalysis(
  items: ReceiptDataItem[],
  imageSource: string,
  submissionId: string,
  receiptId: string
): Promise<EnhancedFraudResult> {
  try {
    // Update submission status to analysis
    await updateSubmission(submissionId, { 
      status: 'analysis_completed',
      analyzedAt: new Date().toISOString()
    });

    // Get OCR analysis for additional context
    const ocrAnalysis = await getOCRAnalysis(submissionId);
    
    // Step 1: Get ML prediction
    let mlPrediction = null;
    try {
      mlPrediction = await getPredictionFromML(items);
    } catch (mlError) {
      console.warn('ML prediction failed:', mlError);
    }

    // Step 2: Get AI fraud detection
    let aiFraudResult = null;
    try {
      aiFraudResult = await flagFraudulentReceipt({
        items,
        receiptImage: imageSource,
      });
    } catch (aiError) {
      console.warn('AI fraud detection failed:', aiError);
      // Create fallback result
      aiFraudResult = {
        fraudulent: false,
        fraudProbability: 0,
        explanation: 'AI analysis failed - manual review required'
      };
    }

    // Step 3: Check for missing critical information
    const hasMissingCriticalInfo = items.some(item =>
      (item.label.toLowerCase().includes('date') || 
       item.label.toLowerCase().includes('total') || 
       item.label.toLowerCase().includes('amount')) &&
      (item.value.trim() === '' || 
       item.value.toLowerCase() === 'not found' || 
       item.value.toLowerCase().includes("extraction failed") || 
       item.value.toLowerCase().includes("not found - edit me"))
    );

    // Step 4: Assess risk factors
    const riskFactors = assessRiskFactors(items, ocrAnalysis);

    // Step 5: Check for duplicates (simplified version)
    const duplicateDetection = await checkForDuplicates(submissionId, ocrAnalysis?.imageHash);

    // Step 6: Create comprehensive fraud analysis
    const fraudAnalysis: FraudAnalysis = {
      ml_prediction: mlPrediction || undefined,
      ai_detection: aiFraudResult ? {
        fraudulent: aiFraudResult.fraudulent,
        fraudProbability: aiFraudResult.fraudProbability,
        explanation: aiFraudResult.explanation
      } : undefined,
      overall_risk_assessment: calculateOverallRiskAssessment(
        mlPrediction?.risk_level,
        aiFraudResult?.fraudProbability
      ),
      analysis_timestamp: new Date().toISOString()
    };

    // Step 7: Determine final fraud status
    const mlSaysFraud = mlPrediction?.is_fraudulent || false;
    const aiSaysFraud = aiFraudResult?.fraudulent || false;
    const isActuallyFraudulent = mlSaysFraud || aiSaysFraud || hasMissingCriticalInfo || duplicateDetection.isDuplicate;

    // Step 8: Calculate final fraud probability
    let finalFraudProbability = aiFraudResult?.fraudProbability || 0;
    if (mlPrediction) {
      finalFraudProbability = (mlPrediction.fraud_probability * 0.6) + ((aiFraudResult?.fraudProbability || 0) * 0.4);
    }
    if (hasMissingCriticalInfo) {
      finalFraudProbability = Math.max(finalFraudProbability, 0.75);
    }
    if (duplicateDetection.isDuplicate) {
      finalFraudProbability = Math.max(finalFraudProbability, 0.8);
    }

    // Step 9: Generate explanation
    let explanation = '';
    if (hasMissingCriticalInfo) {
      explanation += `Flagged due to missing/problematic critical information. `;
    }
    if (duplicateDetection.isDuplicate) {
      explanation += `Potential duplicate receipt detected. `;
    }
    if (mlPrediction) {
      explanation += `ML Model: ${mlPrediction.risk_level} risk (${(mlPrediction.fraud_probability * 100).toFixed(1)}% fraud probability). `;
    }
    if (aiFraudResult) {
      explanation += `AI Analysis: ${aiFraudResult.explanation}`;
    }

    // Step 10: Create enhanced fraud analysis
    const enhancedAnalysis: Omit<EnhancedFraudAnalysis, 'submissionId' | 'receiptId'> = {
      ml_prediction: fraudAnalysis.ml_prediction || null,
      ai_detection: fraudAnalysis.ai_detection || null,
      overall_risk_assessment: fraudAnalysis.overall_risk_assessment || null,
      analysis_timestamp: fraudAnalysis.analysis_timestamp || null,
      duplicateDetection,
      riskFactors,
    };

    // Store fraud analysis
    await storeFraudAnalysis(enhancedAnalysis);

    // Update submission status
    await updateSubmission(submissionId, { 
      status: 'analysis_completed',
      analyzedAt: new Date().toISOString()
    });

    return {
      isFraudulent: isActuallyFraudulent,
      fraudProbability: finalFraudProbability,
      explanation,
      riskFactors,
      duplicateDetection,
      analysis: {
        ...enhancedAnalysis,
        submissionId,
        receiptId,
      }
    };

  } catch (error) {
    console.error('Enhanced fraud analysis failed:', error);
    
    // Update submission with error status
    await updateSubmission(submissionId, { 
      status: 'ocr_completed', // Revert to previous status
      errorLog: [`Fraud analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
    });

    // Return fallback result
    return {
      isFraudulent: false,
      fraudProbability: 0,
      explanation: 'Fraud analysis failed - manual review required',
      riskFactors: {
        imageQuality: 'poor',
        extractionConfidence: 'low',
        vendorVerification: 'unknown',
        amountReasonableness: 'normal',
      },
      duplicateDetection: {
        isDuplicate: false,
        similarSubmissions: [],
        similarityScore: 0,
      },
      analysis: {
        submissionId,
        receiptId,
        overall_risk_assessment: 'LOW',
        analysis_timestamp: new Date().toISOString(),
        duplicateDetection: {
          isDuplicate: false,
          similarSubmissions: [],
          similarityScore: 0,
        },
        riskFactors: {
          imageQuality: 'poor',
          extractionConfidence: 'low',
          vendorVerification: 'unknown',
          amountReasonableness: 'normal',
        },
      }
    };
  }
}

/**
 * Assess risk factors based on receipt data and OCR analysis
 */
function assessRiskFactors(items: ReceiptDataItem[], ocrAnalysis: any): {
  imageQuality: 'good' | 'poor' | 'excellent';
  extractionConfidence: 'high' | 'medium' | 'low';
  vendorVerification: 'verified' | 'unknown' | 'suspicious';
  amountReasonableness: 'normal' | 'high' | 'suspicious';
} {
  // Image quality assessment
  let imageQuality: 'good' | 'poor' | 'excellent' = 'good';
  if (ocrAnalysis) {
    if (ocrAnalysis.blurScore < 0.3) imageQuality = 'excellent';
    else if (ocrAnalysis.blurScore > 0.7) imageQuality = 'poor';
  }

  // Extraction confidence assessment
  let extractionConfidence: 'high' | 'medium' | 'low' = 'medium';
  if (ocrAnalysis) {
    if (ocrAnalysis.extractionConfidence > 0.8) extractionConfidence = 'high';
    else if (ocrAnalysis.extractionConfidence < 0.5) extractionConfidence = 'low';
  }

  // Vendor verification (simplified)
  const vendorItem = items.find(item => item.label.toLowerCase().includes('vendor'));
  let vendorVerification: 'verified' | 'unknown' | 'suspicious' = 'unknown';
  if (vendorItem && vendorItem.value && !vendorItem.value.toLowerCase().includes('not found')) {
    // In a real system, you'd check against a database of known vendors
    vendorVerification = 'verified';
  }

  // Amount reasonableness (simplified)
  const totalItem = items.find(item => 
    item.label.toLowerCase().includes('total') && 
    item.label.toLowerCase().includes('amount')
  );
  let amountReasonableness: 'normal' | 'high' | 'suspicious' = 'normal';
  if (totalItem && totalItem.value) {
    const amount = parseFloat(totalItem.value.replace(/[^0-9.-]/g, ''));
    if (amount > 1000) amountReasonableness = 'high';
    if (amount > 5000) amountReasonableness = 'suspicious';
  }

  return {
    imageQuality,
    extractionConfidence,
    vendorVerification,
    amountReasonableness,
  };
}

/**
 * Check for duplicate receipts (simplified version)
 */
async function checkForDuplicates(submissionId: string, imageHash?: string): Promise<{
  isDuplicate: boolean;
  similarSubmissions: string[];
  similarityScore: number;
}> {
  // In a real implementation, you would:
  // 1. Query the database for receipts with similar image hashes
  // 2. Compare vendor names and amounts
  // 3. Check submission dates for suspicious patterns
  
  // For now, return a simplified result
  return {
    isDuplicate: false,
    similarSubmissions: [],
    similarityScore: 0,
  };
}
