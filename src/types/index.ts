
export type UserRole = 'employee' | 'manager';

export interface User {
  id: string;
  name?: string; // Added for full name
  email: string;
  role: UserRole;
}

export interface ReceiptDataItem {
  id: string; // Client-side unique ID for list rendering
  label: string;
  value: string;
}

export interface ProcessedReceipt {
  id: string;
  fileName: string;
  imageDataUri: string;
  items: ReceiptDataItem[]; 
  isFraudulent: boolean;
  fraudProbability: number;
  explanation: string;
  uploadedAt: string; // ISO Date string
  uploadedBy: string; // user email (identifier for the employee)
}
