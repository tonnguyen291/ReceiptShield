
export type UserRole = 'employee' | 'manager' | 'admin';

export interface User {
  id: string;
  name: string; // Required for full name
  email: string;
  role: UserRole;
  dob?: string; // Date of Birth
  supervisorId?: string; // ID of the user's manager
  status: 'active' | 'inactive';
  createdAt?: Date;
  updatedAt?: Date;
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
  supervisorId?: string; // supervisorId of the employee who uploaded
  status?: 'pending_approval' | 'approved' | 'rejected' | 'draft'; // Status for manager workflow
  managerNotes?: string; // Notes from manager during review
  isDraft?: boolean; // Flag to indicate if receipt is in draft state (can be edited by employee)
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

// Invitation system types
export interface Invitation {
  id: string;
  email: string;
  role: UserRole;
  supervisorId?: string; // For employees, who their manager will be
  invitedBy: string; // Email of the admin who sent the invitation
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  token: string; // Unique token for invitation link
  expiresAt: Date;
  createdAt: Date;
  acceptedAt?: Date;
  acceptedBy?: string; // User ID of who accepted the invitation
}

export interface InvitationRequest {
  email: string;
  role: UserRole;
  supervisorId?: string;
  message?: string; // Optional custom message from admin
}
