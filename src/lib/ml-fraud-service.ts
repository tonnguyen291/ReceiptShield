// Placeholder for ML fraud service
export const mlFraudService = null;

// Placeholder functions for ML fraud detection
export const getPredictionFromML = async (receiptData: any) => {
  return {
    fraudProbability: Math.random() * 0.3, // Random low probability
    confidence: 0.5,
    riskLevel: 'LOW'
  };
};

export const calculateOverallRiskAssessment = (mlPrediction: any, aiDetection: any) => {
  return 'LOW';
};
