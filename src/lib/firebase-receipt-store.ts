import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { ProcessedReceipt } from '@/types';
import { cleanFirestoreData } from './firestore-utils';

const RECEIPTS_COLLECTION = 'receipts';

/**
 * Add a new receipt to Firestore
 * @param receipt - The receipt data to store
 * @returns Promise with the document ID
 */
export async function addReceipt(receipt: Omit<ProcessedReceipt, 'id'>): Promise<string> {
  try {
    // Filter out undefined and null values
    const filteredReceipt = cleanFirestoreData(receipt);

    const receiptData = {
      ...filteredReceipt,
      uploadedAt: Timestamp.fromDate(new Date(receipt.uploadedAt)),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Remove any remaining undefined values
    const finalReceiptData = cleanFirestoreData(receiptData);

    const docRef = await addDoc(collection(db, RECEIPTS_COLLECTION), finalReceiptData);
    console.log('Receipt added to Firestore:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding receipt to Firestore:', error);
    throw new Error(`Failed to add receipt: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update an existing receipt in Firestore
 * @param receiptId - The ID of the receipt to update
 * @param updates - The fields to update
 */
export async function updateReceipt(
  receiptId: string, 
  updates: Partial<ProcessedReceipt>
): Promise<void> {
  try {
    console.log('updateReceipt called with:', {
      receiptId,
      receiptIdType: typeof receiptId,
      receiptIdValue: receiptId,
      updates
    });
    
    if (!receiptId) {
      console.error('Receipt ID validation failed:', {
        receiptId,
        receiptIdType: typeof receiptId,
        receiptIdValue: receiptId
      });
      throw new Error('Receipt ID is required for update');
    }
    
    const receiptRef = doc(db, RECEIPTS_COLLECTION, receiptId);
    
    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    const updateData = {
      ...filteredUpdates,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(receiptRef, updateData);
    console.log('Receipt updated in Firestore:', receiptId);
  } catch (error) {
    console.error('Error updating receipt in Firestore:', error);
    throw new Error(`Failed to update receipt: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a receipt from Firestore
 * @param receiptId - The ID of the receipt to delete
 */
export async function deleteReceipt(receiptId: string): Promise<void> {
  try {
    const receiptRef = doc(db, RECEIPTS_COLLECTION, receiptId);
    await deleteDoc(receiptRef);
    console.log('Receipt deleted from Firestore:', receiptId);
  } catch (error) {
    console.error('Error deleting receipt from Firestore:', error);
    throw new Error(`Failed to delete receipt: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get a single receipt by ID
 * @param receiptId - The ID of the receipt to retrieve
 * @returns Promise with the receipt data or null if not found
 */
export async function getReceipt(receiptId: string): Promise<ProcessedReceipt | null> {
  try {
    const receiptRef = doc(db, RECEIPTS_COLLECTION, receiptId);
    const receiptSnap = await getDoc(receiptRef);
    
    if (!receiptSnap.exists()) {
      return null;
    }

    const data = receiptSnap.data();
    return {
      id: receiptSnap.id,
      ...data,
      uploadedAt: data.uploadedAt instanceof Timestamp 
        ? data.uploadedAt.toDate().toISOString() 
        : data.uploadedAt,
      createdAt: data.createdAt instanceof Timestamp 
        ? data.createdAt.toDate().toISOString() 
        : data.createdAt,
      updatedAt: data.updatedAt instanceof Timestamp 
        ? data.updatedAt.toDate().toISOString() 
        : data.updatedAt,
    } as ProcessedReceipt;
  } catch (error) {
    console.error('Error getting receipt from Firestore:', error);
    throw new Error(`Failed to get receipt: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get all receipts for a specific user
 * @param userEmail - The email of the user
 * @returns Promise with array of receipts
 */
export async function getReceiptsByUser(userEmail: string): Promise<ProcessedReceipt[]> {
  try {
    // Temporary: Remove orderBy until indexes are built
    const q = query(
      collection(db, RECEIPTS_COLLECTION),
      where('uploadedBy', '==', userEmail)
    );
    
    const querySnapshot = await getDocs(q);
    const receipts: ProcessedReceipt[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      receipts.push({
        id: doc.id,
        ...data,
        uploadedAt: data.uploadedAt instanceof Timestamp 
          ? data.uploadedAt.toDate().toISOString() 
          : data.uploadedAt,
        createdAt: data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate().toISOString() 
          : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp 
          ? data.updatedAt.toDate().toISOString() 
          : data.updatedAt,
      } as ProcessedReceipt);
    });
    
    // Manual sorting since we removed orderBy temporarily
    return receipts.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  } catch (error) {
    console.error('Error getting receipts by user from Firestore:', error);
    throw new Error(`Failed to get receipts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get all receipts for a supervisor's team
 * @param supervisorId - The ID of the supervisor
 * @returns Promise with array of receipts
 */
export async function getReceiptsBySupervisor(supervisorId: string): Promise<ProcessedReceipt[]> {
  try {
    console.log('getReceiptsBySupervisor called with supervisorId:', supervisorId);
    
    // Temporary: Remove orderBy until indexes are built
    // TODO: Add back orderBy once indexes are ready
    const q = query(
      collection(db, RECEIPTS_COLLECTION),
      where('supervisorId', '==', supervisorId)
    );
    
    const querySnapshot = await getDocs(q);
    console.log('Query snapshot size:', querySnapshot.size);
    
    const receipts: ProcessedReceipt[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      receipts.push({
        id: doc.id,
        ...data,
        uploadedAt: data.uploadedAt instanceof Timestamp 
          ? data.uploadedAt.toDate().toISOString() 
          : data.uploadedAt,
        createdAt: data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate().toISOString() 
          : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp 
          ? data.updatedAt.toDate().toISOString() 
          : data.updatedAt,
      } as ProcessedReceipt);
    });
    
    // Manual sorting since we removed orderBy temporarily
    const sortedReceipts = receipts.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    console.log('getReceiptsBySupervisor returning:', sortedReceipts.length, 'receipts');
    return sortedReceipts;
  } catch (error) {
    console.error('Error getting receipts by supervisor from Firestore:', error);
    throw new Error(`Failed to get receipts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get all receipts (admin function)
 * @param limitCount - Optional limit on number of receipts to return
 * @returns Promise with array of receipts
 */
export async function getAllReceipts(limitCount?: number): Promise<ProcessedReceipt[]> {
  try {
    console.log('getAllReceipts called with limitCount:', limitCount);
    
    // Temporary: Remove orderBy until indexes are built
    let q = query(
      collection(db, RECEIPTS_COLLECTION)
    );
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    console.log('getAllReceipts query snapshot size:', querySnapshot.size);
    
    const receipts: ProcessedReceipt[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const receipt = {
        id: doc.id,
        ...data,
        uploadedAt: data.uploadedAt instanceof Timestamp 
          ? data.uploadedAt.toDate().toISOString() 
          : data.uploadedAt,
        createdAt: data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate().toISOString() 
          : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp 
          ? data.updatedAt.toDate().toISOString() 
          : data.updatedAt,
      } as ProcessedReceipt;
      
      // Debug: Check for receipts without IDs
      if (!receipt.id) {
        console.error('Found receipt without ID in getAllReceipts:', {
          docId: doc.id,
          data: data,
          receipt: receipt
        });
      }
      
      receipts.push(receipt);
    });
    
    // Manual sorting since we removed orderBy temporarily
    const sortedReceipts = receipts.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    
    // Debug: Log supervisorId values
    console.log('getAllReceipts - supervisorId values:', sortedReceipts.map(r => ({
      id: r.id,
      supervisorId: r.supervisorId,
      uploadedBy: r.uploadedBy
    })));
    
    // Apply limit after sorting if specified
    return limitCount ? sortedReceipts.slice(0, limitCount) : sortedReceipts;
  } catch (error) {
    console.error('Error getting all receipts from Firestore:', error);
    throw new Error(`Failed to get receipts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get receipts by status
 * @param status - The status to filter by
 * @returns Promise with array of receipts
 */
export async function getReceiptsByStatus(status: string): Promise<ProcessedReceipt[]> {
  try {
    // Temporary: Remove orderBy until indexes are built
    const q = query(
      collection(db, RECEIPTS_COLLECTION),
      where('status', '==', status)
    );
    
    const querySnapshot = await getDocs(q);
    const receipts: ProcessedReceipt[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      receipts.push({
        id: doc.id,
        ...data,
        uploadedAt: data.uploadedAt instanceof Timestamp 
          ? data.uploadedAt.toDate().toISOString() 
          : data.uploadedAt,
        createdAt: data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate().toISOString() 
          : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp 
          ? data.updatedAt.toDate().toISOString() 
          : data.updatedAt,
      } as ProcessedReceipt);
    });
    
    // Manual sorting since we removed orderBy temporarily
    return receipts.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  } catch (error) {
    console.error('Error getting receipts by status from Firestore:', error);
    throw new Error(`Failed to get receipts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

