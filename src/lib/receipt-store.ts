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
}

export function addReceipt(receipt: ProcessedReceipt): void {
  const receipts = getStoredReceipts();
  setStoredReceipts([receipt, ...receipts]);
}

export function getFlaggedReceiptsForManager(): ProcessedReceipt[] {
  const receipts = getStoredReceipts();
  // Managers see receipts that are flagged as fraudulent
  return receipts.filter(receipt => receipt.isFraudulent);
}

export function getAllReceiptsForUser(userEmail: string): ProcessedReceipt[] {
    const receipts = getStoredReceipts();
    return receipts.filter(receipt => receipt.uploadedBy === userEmail);
}

export function getReceiptById(id: string): ProcessedReceipt | undefined {
  const receipts = getStoredReceipts();
  return receipts.find(receipt => receipt.id === id);
}
