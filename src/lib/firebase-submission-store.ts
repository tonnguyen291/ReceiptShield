import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { ReceiptSubmission, OCRAnalysis, EnhancedFraudAnalysis } from '@/types';
import { cleanFirestoreData } from './firestore-utils';

const SUBMISSIONS_COLLECTION = 'receipt_submissions';
const OCR_ANALYSES_COLLECTION = 'ocr_analyses';
const FRAUD_ANALYSES_COLLECTION = 'fraud_analyses';

// ==================== SUBMISSION MANAGEMENT ====================

/**
 * Create a new receipt submission
 * @param submission - The submission data to store
 * @returns Promise with the document ID
 */
export async function createSubmission(submission: Omit<ReceiptSubmission, 'submissionId'>): Promise<string> {
  try {
    // Filter out undefined and null values
    const filteredSubmission = cleanFirestoreData(submission);

    const submissionData = {
      ...filteredSubmission,
      submittedAt: Timestamp.fromDate(new Date(submission.submittedAt)),
      processedAt: submission.processedAt ? Timestamp.fromDate(new Date(submission.processedAt)) : null,
      analyzedAt: submission.analyzedAt ? Timestamp.fromDate(new Date(submission.analyzedAt)) : null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Remove any remaining undefined values
    const finalSubmissionData = cleanFirestoreData(submissionData);

    const docRef = await addDoc(collection(db, SUBMISSIONS_COLLECTION), finalSubmissionData);
    console.log('Submission created:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating submission:', error);
    throw new Error(`Failed to create submission: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update a submission
 * @param submissionId - The ID of the submission to update
 * @param updates - The fields to update
 */
export async function updateSubmission(
  submissionId: string, 
  updates: Partial<ReceiptSubmission>
): Promise<void> {
  try {
    const submissionRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(submissionRef, updateData);
    console.log('Submission updated:', submissionId);
  } catch (error) {
    console.error('Error updating submission:', error);
    throw new Error(`Failed to update submission: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get a submission by ID
 * @param submissionId - The ID of the submission to retrieve
 * @returns Promise with the submission data or null if not found
 */
export async function getSubmission(submissionId: string): Promise<ReceiptSubmission | null> {
  try {
    const submissionRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
    const submissionSnap = await getDoc(submissionRef);
    
    if (!submissionSnap.exists()) {
      return null;
    }

    const data = submissionSnap.data();
    return {
      submissionId: submissionSnap.id,
      ...data,
      submittedAt: data.submittedAt instanceof Timestamp 
        ? data.submittedAt.toDate().toISOString() 
        : data.submittedAt,
      processedAt: data.processedAt instanceof Timestamp 
        ? data.processedAt.toDate().toISOString() 
        : data.processedAt,
      analyzedAt: data.analyzedAt instanceof Timestamp 
        ? data.analyzedAt.toDate().toISOString() 
        : data.analyzedAt,
    } as ReceiptSubmission;
  } catch (error) {
    console.error('Error getting submission:', error);
    throw new Error(`Failed to get submission: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get all submissions for a user
 * @param userUid - The UID of the user
 * @returns Promise with array of submissions
 */
export async function getSubmissionsByUser(userUid: string): Promise<ReceiptSubmission[]> {
  try {
    const q = query(
      collection(db, SUBMISSIONS_COLLECTION),
      where('userUid', '==', userUid),
      orderBy('submittedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const submissions: ReceiptSubmission[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      submissions.push({
        submissionId: doc.id,
        ...data,
        submittedAt: data.submittedAt instanceof Timestamp 
          ? data.submittedAt.toDate().toISOString() 
          : data.submittedAt,
        processedAt: data.processedAt instanceof Timestamp 
          ? data.processedAt.toDate().toISOString() 
          : data.processedAt,
        analyzedAt: data.analyzedAt instanceof Timestamp 
          ? data.analyzedAt.toDate().toISOString() 
          : data.analyzedAt,
      } as ReceiptSubmission);
    });
    
    return submissions;
  } catch (error) {
    console.error('Error getting submissions by user:', error);
    throw new Error(`Failed to get submissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ==================== OCR ANALYSIS MANAGEMENT ====================

/**
 * Store OCR analysis results
 * @param analysis - The OCR analysis data to store
 * @returns Promise with the document ID
 */
export async function storeOCRAnalysis(analysis: Omit<OCRAnalysis, 'submissionId'>): Promise<string> {
  try {
    // Filter out undefined and null values
    const filteredAnalysis = cleanFirestoreData(analysis);

    const analysisData = {
      ...filteredAnalysis,
      analyzedAt: Timestamp.fromDate(new Date(analysis.analyzedAt)),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Remove any remaining undefined values
    const finalAnalysisData = cleanFirestoreData(analysisData);

    const docRef = await addDoc(collection(db, OCR_ANALYSES_COLLECTION), finalAnalysisData);
    console.log('OCR analysis stored:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error storing OCR analysis:', error);
    throw new Error(`Failed to store OCR analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get OCR analysis by submission ID
 * @param submissionId - The submission ID
 * @returns Promise with the OCR analysis or null if not found
 */
export async function getOCRAnalysis(submissionId: string): Promise<OCRAnalysis | null> {
  try {
    const q = query(
      collection(db, OCR_ANALYSES_COLLECTION),
      where('submissionId', '==', submissionId),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      submissionId: data.submissionId,
      receiptId: data.receiptId,
      rawOcrText: data.rawOcrText,
      ocrConfidence: data.ocrConfidence,
      ocrProcessingTime: data.ocrProcessingTime,
      extractedItems: data.extractedItems,
      extractionConfidence: data.extractionConfidence,
      imageHash: data.imageHash,
      blurScore: data.blurScore,
      imageDimensions: data.imageDimensions,
      analyzedAt: data.analyzedAt instanceof Timestamp 
        ? data.analyzedAt.toDate().toISOString() 
        : data.analyzedAt,
      processingVersion: data.processingVersion,
      errorLog: data.errorLog,
    } as OCRAnalysis;
  } catch (error) {
    console.error('Error getting OCR analysis:', error);
    throw new Error(`Failed to get OCR analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ==================== FRAUD ANALYSIS MANAGEMENT ====================

/**
 * Store enhanced fraud analysis results
 * @param analysis - The fraud analysis data to store
 * @returns Promise with the document ID
 */
export async function storeFraudAnalysis(analysis: Omit<EnhancedFraudAnalysis, 'submissionId' | 'receiptId'>): Promise<string> {
  try {
    // Filter out undefined and null values
    const filteredAnalysis = cleanFirestoreData(analysis);

    const analysisData = {
      ...filteredAnalysis,
      analysis_timestamp: analysis.analysis_timestamp ? Timestamp.fromDate(new Date(analysis.analysis_timestamp)) : undefined,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Remove undefined values from the final object
    const finalAnalysisData = cleanFirestoreData(analysisData);

    const docRef = await addDoc(collection(db, FRAUD_ANALYSES_COLLECTION), finalAnalysisData);
    console.log('Fraud analysis stored:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error storing fraud analysis:', error);
    throw new Error(`Failed to store fraud analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get fraud analysis by submission ID
 * @param submissionId - The submission ID
 * @returns Promise with the fraud analysis or null if not found
 */
export async function getFraudAnalysis(submissionId: string): Promise<EnhancedFraudAnalysis | null> {
  try {
    const q = query(
      collection(db, FRAUD_ANALYSES_COLLECTION),
      where('submissionId', '==', submissionId),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      submissionId: data.submissionId,
      receiptId: data.receiptId,
      ml_prediction: data.ml_prediction,
      ai_detection: data.ai_detection,
      overall_risk_assessment: data.overall_risk_assessment,
      analysis_timestamp: data.analysis_timestamp instanceof Timestamp 
        ? data.analysis_timestamp.toDate().toISOString() 
        : data.analysis_timestamp,
      duplicateDetection: data.duplicateDetection,
      riskFactors: data.riskFactors,
    } as EnhancedFraudAnalysis;
  } catch (error) {
    console.error('Error getting fraud analysis:', error);
    throw new Error(`Failed to get fraud analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get all data for a submission (submission + OCR + fraud analysis)
 * @param submissionId - The submission ID
 * @returns Promise with complete submission data
 */
export async function getCompleteSubmissionData(submissionId: string): Promise<{
  submission: ReceiptSubmission | null;
  ocrAnalysis: OCRAnalysis | null;
  fraudAnalysis: EnhancedFraudAnalysis | null;
}> {
  try {
    const [submission, ocrAnalysis, fraudAnalysis] = await Promise.all([
      getSubmission(submissionId),
      getOCRAnalysis(submissionId),
      getFraudAnalysis(submissionId),
    ]);

    return {
      submission,
      ocrAnalysis,
      fraudAnalysis,
    };
  } catch (error) {
    console.error('Error getting complete submission data:', error);
    throw new Error(`Failed to get complete submission data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
