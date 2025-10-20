
export type UserRole = 'employee' | 'manager' | 'admin';

export type SubscriptionTier = 'trial' | 'basic' | 'professional' | 'enterprise';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired';

export interface Company {
  id: string;
  name: string;
  ownerId: string; // User ID of the company owner
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt?: Date;
  currentPeriodEnd?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  receiptCount: number; // Current month's receipt count
  userCount: number; // Current user count
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanySettings {
  allowAdminsToManageSubscription: boolean;
  maxReceiptsPerMonth: number;
  maxUsers: number;
  features: {
    advancedAnalytics: boolean;
    apiAccess: boolean;
    customIntegrations: boolean;
    prioritySupport: boolean;
  };
}

export interface User {
  id: string;
  uid: string; // Firebase Auth UID
  name: string; // Required for full name
  email: string;
  role: UserRole;
  companyId?: string; // Links user to their company (optional for platform admins)
  isCompanyOwner?: boolean; // Identifies the company creator
  canManageSubscription?: boolean; // Permission flag set by owner
  isPlatformAdmin?: boolean; // Identifies ReceiptShield platform administrators with cross-company access
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
  submissionId?: string; // Primary tracking ID for the entire submission
  fileName: string;
  imageDataUri?: string; // Optional for backward compatibility
  imageUrl?: string; // Firebase Storage URL
  imageStoragePath?: string; // Firebase Storage path for deletion
  items: ReceiptDataItem[];
  
  // Company isolation
  companyId: string; // Isolates receipts by company
  
  // User tracking
  userUid?: string; // Firebase Auth UID of the submitter
  uploadedBy: string; // user email (identifier for the employee)
  supervisorId?: string; // supervisorId of the employee who uploaded
  
  // Legacy fraud detection fields (for backward compatibility)
  isFraudulent: boolean;
  fraudProbability: number;
  explanation: string;
  
  // New comprehensive fraud analysis
  fraud_analysis?: FraudAnalysis;
  
  // Status and workflow
  status?: 'pending_approval' | 'approved' | 'rejected' | 'draft'; // Status for manager workflow
  managerNotes?: string; // Notes from manager during review
  isDraft?: boolean; // Flag to indicate if receipt is in draft state (can be edited by employee)
  
  // Timestamps
  uploadedAt: string; // ISO Date string
  createdAt?: string;
  updatedAt?: string;
}

// Enhanced submission tracking
export interface ReceiptSubmission {
  submissionId: string; // Primary tracking ID
  receiptId: string; // Firestore document ID
  userUid: string; // Firebase Auth UID
  userEmail: string; // User email for display
  supervisorId?: string; // Manager UID
  
  // Timestamps
  submittedAt: string; // ISO timestamp
  processedAt?: string; // When OCR completed
  analyzedAt?: string; // When fraud analysis completed
  
  // Status tracking
  status: 'uploaded' | 'processing' | 'ocr_completed' | 'analysis_completed' | 'verified' | 'approved' | 'rejected';
  
  // File information
  fileName: string;
  fileSize: number;
  fileType: string;
  imageStoragePath: string;
  imageUrl: string;
  
  // Processing metadata
  processingVersion: string; // Version of AI model used
  errorLog?: string[]; // Any errors during processing
}

// Enhanced OCR analysis results
export interface OCRAnalysis {
  submissionId: string; // Links to submission
  receiptId: string; // Links to receipt
  
  // Raw OCR data
  rawOcrText: string; // Full OCR dump
  ocrConfidence: number; // Overall confidence score
  ocrProcessingTime: number; // Time taken for OCR
  
  // AI extraction results
  extractedItems: ReceiptDataItem[];
  extractionConfidence: number; // AI extraction confidence
  
  // Image analysis
  imageHash: string; // Perceptual hash for duplicate detection
  blurScore: number; // Image quality metric
  imageDimensions: { width: number; height: number };
  
  // Metadata
  analyzedAt: string; // ISO timestamp
  processingVersion: string; // Version of AI model used
  errorLog?: string[]; // Any errors during processing
}

// Enhanced fraud analysis with submission tracking
export interface EnhancedFraudAnalysis extends FraudAnalysis {
  submissionId: string;
  receiptId: string;
  
  // Additional analysis data
  duplicateDetection: {
    isDuplicate: boolean;
    similarSubmissions: string[]; // Other submission IDs
    similarityScore: number;
  };
  
  // Risk factors
  riskFactors: {
    imageQuality: 'good' | 'poor' | 'excellent';
    extractionConfidence: 'high' | 'medium' | 'low';
    vendorVerification: 'verified' | 'unknown' | 'suspicious';
    amountReasonableness: 'normal' | 'high' | 'suspicious';
  };
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
  lastSentAt?: Date; // When the invitation was last sent/resent
  acceptedAt?: Date;
  acceptedBy?: string; // User ID of who accepted the invitation
}

export interface InvitationRequest {
  email: string;
  role: UserRole;
  supervisorId?: string;
  message?: string; // Optional custom message from admin
}
