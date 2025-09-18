'use client';

// This file now serves as a compatibility layer for the old localStorage-based receipt store
// All functions now delegate to the new Firebase-based receipt store
import { 
  addReceipt as addReceiptToFirestore,
  updateReceipt as updateReceiptInFirestore,
  deleteReceipt as deleteReceiptFromFirestore,
  getReceipt as getReceiptFromFirestore,
  getAllReceipts as getAllReceiptsFromFirestore,
  getReceiptsByUser as getReceiptsByUserFromFirestore,
  getReceiptsBySupervisor as getReceiptsBySupervisorFromFirestore,
  getReceiptsByStatus
} from './firebase-receipt-store';
import type { ProcessedReceipt } from '@/types';

// Legacy compatibility functions that delegate to Firebase
export async function addReceipt(receipt: ProcessedReceipt): Promise<string> {
  const { id, ...receiptData } = receipt;
  return await addReceiptToFirestore(receiptData);
}

export async function updateReceipt(updatedReceipt: ProcessedReceipt): Promise<void> {
  const { id, ...receiptData } = updatedReceipt;
  return await updateReceiptInFirestore(id, receiptData);
}

export async function deleteReceipt(id: string): Promise<void> {
  return await deleteReceiptFromFirestore(id);
}

export async function getReceiptById(id: string): Promise<ProcessedReceipt | undefined> {
  const receipt = await getReceiptFromFirestore(id);
  return receipt || undefined;
}

export async function getAllReceipts(): Promise<ProcessedReceipt[]> {
  return await getAllReceiptsFromFirestore();
}

export async function getAllReceiptsForUser(userEmail: string): Promise<ProcessedReceipt[]> {
  return await getReceiptsByUserFromFirestore(userEmail);
}

export async function getReceiptsForManager(managerId: string): Promise<ProcessedReceipt[]> {
  return await getReceiptsBySupervisorFromFirestore(managerId);
}

export async function getFlaggedReceiptsForManager(managerId: string): Promise<ProcessedReceipt[]> {
  // Get receipts for the manager that are flagged and pending approval
  const allReceipts = await getReceiptsBySupervisorFromFirestore(managerId);
  return allReceipts
    .filter(receipt => receipt.isFraudulent && receipt.status === 'pending_approval')
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}

export async function approveReceipt(receiptId: string): Promise<void> {
  return await updateReceiptInFirestore(receiptId, {
    status: 'approved',
    managerNotes: 'Approved by manager.',
    isDraft: false
  });
}

export async function rejectReceipt(receiptId: string, notes?: string): Promise<void> {
  return await updateReceiptInFirestore(receiptId, {
    status: 'rejected',
    isDraft: false,
    managerNotes: notes || 'Rejected by manager.'
  });
}

export async function resubmitDraftReceipt(receiptId: string): Promise<void> {
  return await updateReceiptInFirestore(receiptId, {
    status: 'pending_approval',
    isDraft: false,
    managerNotes: undefined
  });
}