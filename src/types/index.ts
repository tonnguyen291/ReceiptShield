export type UserRole = 'employee' | 'manager';

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface ProcessedReceipt {
  id: string;
  fileName: string;
  imageDataUri: string;
  summary: string; 
  isFraudulent: boolean;
  fraudProbability: number;
  explanation: string;
  uploadedAt: string; // ISO Date string
  uploadedBy: string; // user email (identifier for the employee)
}
