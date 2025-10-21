// Placeholder for ML fraud service
export const mlFraudService = null;

// Placeholder functions for ML fraud detection
export const getPredictionFromML = async (receiptData: any) => {
  return {
    is_fraudulent: false,
    fraud_probability: Math.random() * 0.3, // Random low probability
    risk_level: 'LOW' as const,
    confidence: 0.5
  };
};

export const calculateOverallRiskAssessment = (mlPrediction: any, aiDetection: any): 'LOW' | 'MEDIUM' | 'HIGH' => {
  return 'LOW';
};
