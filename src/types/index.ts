
export type UserRole = 'employee' | 'manager';

export interface User {
  id: string;
  name?: string; // Added for full name
  email: string;
  role: UserRole;
  dob?: string; // Date of Birth
}

export interface ReceiptDataItem {
  id: string; // Client-side unique ID for list rendering
  label: string;
  value: string;
}

// ML Model prediction results
export interface MLFraudPrediction {
  is_fraudulent: boolean;
  fraud_probability: number; // 0-1 probability
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number; // Confidence in the prediction
}

// AI Fraud detection results  
export interface AIFraudDetection {
  fraudulent: boolean;
  fraudProbability: number; // 0-1 probability
  explanation: string; // Detailed explanation with reasoning
}

// Combined fraud analysis results
export interface FraudAnalysis {
  ml_prediction?: MLFraudPrediction; // ML model results
  ai_detection?: AIFraudDetection;   // AI analysis results
  overall_risk_assessment?: 'LOW' | 'MEDIUM' | 'HIGH'; // Combined assessment
  analysis_timestamp?: string; // When the analysis was performed
}

export interface ProcessedReceipt {
  id: string;
  fileName: string;
  imageDataUri: string;
  items: ReceiptDataItem[];
  
  // Legacy fraud detection fields (for backward compatibility)
  isFraudulent: boolean;
  fraudProbability: number;
  explanation: string;
  
  // New comprehensive fraud analysis
  fraud_analysis?: FraudAnalysis;
  
  uploadedAt: string; // ISO Date string
  uploadedBy: string; // user email (identifier for the employee)
  status?: 'pending_approval' | 'approved' | 'rejected'; // Status for manager workflow
  managerNotes?: string; // Notes from manager during review
}

// API Response types for ML server
export interface MLServerResponse {
  success: boolean;
  prediction?: MLFraudPrediction;
  model_info?: {
    version: string;
    auc_score: number;
  };
  receipt_data?: any; // Echo of processed receipt data
  error?: string;
  message?: string;
}
