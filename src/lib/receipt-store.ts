
'use client';

import type { ProcessedReceipt } from '@/types';

const RECEIPTS_STORAGE_KEY = 'receiptShieldReceipts';

function getStoredReceipts(): ProcessedReceipt[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const storedReceipts = localStorage.getItem(RECEIPTS_STORAGE_KEY);
    return storedReceipts ? JSON.parse(storedReceipts) : [];
  } catch (error) {
    console.error("Failed to parse receipts from localStorage", error);
    localStorage.removeItem(RECEIPTS_STORAGE_KEY);
    return [];
  }
}

function setStoredReceipts(receipts: ProcessedReceipt[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(RECEIPTS_STORAGE_KEY, JSON.stringify(receipts));
  // Dispatch a storage event so other tabs/components can update
  window.dispatchEvent(new Event('storage'));
}

export function addReceipt(receipt: ProcessedReceipt): void {
  const receipts = getStoredReceipts();
  setStoredReceipts([receipt, ...receipts]);
}

export function updateReceipt(updatedReceipt: ProcessedReceipt): void {
  let receipts = getStoredReceipts();
  receipts = receipts.map(receipt =>
    receipt.id === updatedReceipt.id ? updatedReceipt : receipt
  );
  setStoredReceipts(receipts);
}

export function deleteReceipt(id: string): void {
  let receipts = getStoredReceipts();
  receipts = receipts.filter(receipt => receipt.id !== id);
  setStoredReceipts(receipts);
}

export function getFlaggedReceiptsForManager(managerId: string): ProcessedReceipt[] {
  const receipts = getStoredReceipts();
  // Managers see receipts from their team that are flagged and pending approval.
  return receipts.filter(receipt => receipt.supervisorId === managerId && receipt.isFraudulent && receipt.status === 'pending_approval')
                 .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}

export function approveReceipt(receiptId: string): void {
  const receipts = getStoredReceipts();
  const updatedReceipts = receipts.map(r => 
    r.id === receiptId ? { ...r, status: 'approved', managerNotes: 'Approved by manager.' } : r
  );
  setStoredReceipts(updatedReceipts);
}

export function rejectReceipt(receiptId: string, notes?: string): void {
  const receipts = getStoredReceipts();
  const updatedReceipts = receipts.map(r => 
    r.id === receiptId ? { ...r, status: 'rejected', managerNotes: notes || 'Rejected by manager.' } : r
  );
  setStoredReceipts(updatedReceipts);
}

export function getReceiptsForManager(managerId: string): ProcessedReceipt[] {
    const receipts = getStoredReceipts();
    return receipts.filter(receipt => receipt.supervisorId === managerId);
}

export function getAllReceipts(): ProcessedReceipt[] {
    return getStoredReceipts();
}

export function getAllReceiptsForUser(userEmail: string): ProcessedReceipt[] {
    const receipts = getStoredReceipts();
    return receipts.filter(receipt => receipt.uploadedBy === userEmail).sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}

export function getReceiptById(id: string): ProcessedReceipt | undefined {
  const receipts = getStoredReceipts();
  return receipts.find(receipt => receipt.id === id);
}
