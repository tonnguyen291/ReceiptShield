/**
 * ML Fraud Detection Service
 * 
 * Client-side service for communicating with the ML fraud detection server.
 * Handles API calls to get ML-based fraud predictions.
 */

import type { MLServerResponse, MLFraudPrediction, ReceiptDataItem } from '@/types';

const ML_API_URL = '/api/ml-predict'; // Using Next.js API route instead of external server

/**
 * Check if ML server is healthy and available
 */
export async function checkMLServerHealth(): Promise<boolean> {
  try {
    // For Next.js API routes, we'll do a simple test prediction to check health
    const testItems = [{ id: 'test', label: 'Total Amount', value: '10.00' }];
    const response = await fetch(ML_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items: testItems }),
    });

    return response.ok;
  } catch (error) {
    console.error('ML server health check failed:', error);
    return false;
  }
}

/**
 * Get ML fraud prediction for a receipt
 */
export async function getPredictionFromML(
  receiptItems: ReceiptDataItem[]
): Promise<MLFraudPrediction | null> {
  try {
    // Check if server is available first
    const isHealthy = await checkMLServerHealth();
    if (!isHealthy) {
      console.warn('ML server is not available or healthy');
      return null;
    }

    const response = await fetch(ML_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: receiptItems
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('ML prediction request failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      return null;
    }

    const data: MLServerResponse = await response.json();

    if (!data.success || !data.prediction) {
      console.error('ML prediction failed:', data.error || data.message);
      return null;
    }

    return data.prediction;
  } catch (error) {
    console.error('Error calling ML fraud detection service:', error);
    return null;
  }
}

/**
 * Get detailed ML server information
 */
export async function getMLServerInfo(): Promise<{
  version: string;
  auc_score: number;
  available: boolean;
} | null> {
  try {
    // For Next.js API routes, we'll use a simple health check
    return checkMLServerHealth().then(healthy => ({
      version: 'Next.js API Route',
      auc_score: 1.0, // From metadata
      available: healthy
    }));
  } catch (error) {
    console.error('Failed to get ML server info:', error);
    return null;
  }
}

/**
 * Combine ML and AI risk assessments into overall assessment
 */
export function calculateOverallRiskAssessment(
  mlRiskLevel?: 'LOW' | 'MEDIUM' | 'HIGH',
  aiProbability?: number
): 'LOW' | 'MEDIUM' | 'HIGH' {
  // If we don't have both assessments, use whichever we have
  if (!mlRiskLevel && !aiProbability) {
    return 'MEDIUM'; // Default to medium if no data
  }

  if (!mlRiskLevel) {
    // Use AI probability to determine risk
    if (aiProbability && aiProbability >= 0.8) return 'HIGH';
    if (aiProbability && aiProbability >= 0.5) return 'MEDIUM';
    return 'LOW';
  }

  if (!aiProbability) {
    // Use ML risk level
    return mlRiskLevel;
  }

  // Combine both assessments
  const mlRiskScore = mlRiskLevel === 'HIGH' ? 3 : mlRiskLevel === 'MEDIUM' ? 2 : 1;
  const aiRiskScore = aiProbability >= 0.8 ? 3 : aiProbability >= 0.5 ? 2 : 1;
  
  // Take the higher risk assessment
  const maxScore = Math.max(mlRiskScore, aiRiskScore);
  
  if (maxScore >= 3) return 'HIGH';
  if (maxScore >= 2) return 'MEDIUM';
  return 'LOW';
} 