
export type UserRole = 'employee' | 'manager' | 'admin';

export interface User {
  id: string;
  name?: string; // Added for full name
  email: string;
  role: UserRole;
  dob?: string; // Date of Birth
  supervisorId?: string; // ID of the user's manager
  status?: 'active' | 'inactive';
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
  supervisorId?: string; // supervisorId of the employee who uploaded
  status?: 'pending_approval' | 'approved' | 'rejected'; // Status for manager workflow
  managerNotes?: string; // Notes from manager during review
}
