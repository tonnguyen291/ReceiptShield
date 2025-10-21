// Placeholder for ML fraud service
export const mlFraudService = null;

// Placeholder functions for ML fraud detection
export const getPredictionFromML = async (receiptData: any) => {
  // This function is deprecated - use the actual ML API instead
  console.warn('⚠️ Using deprecated ML fraud service. Use /api/ml-predict instead.');
  return {
    is_fraudulent: false,
    fraud_probability: 0.1, // Fixed low probability (no random)
    risk_level: 'LOW' as const,
    confidence: 0.5
  };
};

export const calculateOverallRiskAssessment = (mlPrediction: any, aiDetection: any): 'LOW' | 'MEDIUM' | 'HIGH' => {
  return 'LOW';
};
