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
import { deleteReceiptImage } from './firebase-storage';

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
 * Delete a receipt from Firestore and its associated image from Storage
 * @param receiptId - The ID of the receipt to delete
 */
export async function deleteReceipt(receiptId: string): Promise<void> {
  try {
    // First, get the receipt to access the storage path
    const receiptRef = doc(db, RECEIPTS_COLLECTION, receiptId);
    const receiptSnap = await getDoc(receiptRef);
    
    if (!receiptSnap.exists()) {
      console.warn('Receipt not found:', receiptId);
      return;
    }
    
    const receiptData = receiptSnap.data();
    
    // Delete the associated image from Firebase Storage if it exists
    if (receiptData.imageStoragePath) {
      try {
        await deleteReceiptImage(receiptData.imageStoragePath);
        console.log('Receipt image deleted from Storage:', receiptData.imageStoragePath);
      } catch (storageError) {
        console.warn('Failed to delete receipt image from Storage:', storageError);
        // Continue with Firestore deletion even if storage deletion fails
      }
    }
    
    // Delete the receipt document from Firestore
    await deleteDoc(receiptRef);
    console.log('Receipt deleted from Firestore:', receiptId);
  } catch (error) {
    console.error('Error deleting receipt:', error);
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
 * @param companyId - The company ID to filter by
 * @returns Promise with array of receipts
 */
export async function getReceiptsByUser(userEmail: string, companyId?: string): Promise<ProcessedReceipt[]> {
  try {
    let q;
    if (companyId) {
      q = query(
        collection(db, RECEIPTS_COLLECTION),
        where('companyId', '==', companyId),
        where('uploadedBy', '==', userEmail),
        orderBy('uploadedAt', 'desc')
      );
    } else {
      q = query(
        collection(db, RECEIPTS_COLLECTION),
        where('uploadedBy', '==', userEmail),
        orderBy('uploadedAt', 'desc')
      );
    }
    
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
    
    return receipts;
  } catch (error) {
    console.error('Error getting receipts by user from Firestore:', error);
    throw new Error(`Failed to get receipts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get all receipts for a supervisor's team
 * @param supervisorId - The ID of the supervisor
 * @param companyId - The company ID to filter by
 * @returns Promise with array of receipts
 */
export async function getReceiptsBySupervisor(supervisorId: string, companyId?: string): Promise<ProcessedReceipt[]> {
  try {
    console.log('getReceiptsBySupervisor called with supervisorId:', supervisorId);
    
    // Try the optimized query first (requires index)
    try {
      let q;
      if (companyId) {
        q = query(
          collection(db, RECEIPTS_COLLECTION),
          where('companyId', '==', companyId),
          where('supervisorId', '==', supervisorId),
          where('status', '!=', 'draft'), // Exclude draft receipts
          orderBy('uploadedAt', 'desc')
        );
      } else {
        q = query(
          collection(db, RECEIPTS_COLLECTION),
          where('supervisorId', '==', supervisorId),
          where('status', '!=', 'draft'), // Exclude draft receipts
          orderBy('uploadedAt', 'desc')
        );
      }
      
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
      
      console.log('getReceiptsBySupervisor returning:', receipts.length, 'receipts (excluding drafts)');
      return receipts;
    } catch (indexError: any) {
      // Fallback: Use simpler query and filter client-side
      console.warn('Index not ready, using fallback query:', indexError.message);
      
      let fallbackQuery;
      if (companyId) {
        fallbackQuery = query(
          collection(db, RECEIPTS_COLLECTION),
          where('companyId', '==', companyId),
          where('supervisorId', '==', supervisorId),
          orderBy('uploadedAt', 'desc')
        );
      } else {
        fallbackQuery = query(
          collection(db, RECEIPTS_COLLECTION),
          where('supervisorId', '==', supervisorId),
          orderBy('uploadedAt', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(fallbackQuery);
      console.log('Fallback query snapshot size:', querySnapshot.size);
      
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
        
        // Filter out drafts client-side
        if (receipt.status !== 'draft') {
          receipts.push(receipt);
        }
      });
      
      console.log('getReceiptsBySupervisor fallback returning:', receipts.length, 'receipts (excluding drafts)');
      return receipts;
    }
  } catch (error) {
    console.error('Error getting receipts by supervisor from Firestore:', error);
    throw new Error(`Failed to get receipts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get all receipts excluding drafts (for managers and non-admin users)
 * @param limitCount - Optional limit on number of receipts to return
 * @param companyId - The company ID to filter by
 * @returns Promise with array of receipts
 */
export async function getAllSubmittedReceipts(limitCount?: number, companyId?: string): Promise<ProcessedReceipt[]> {
  try {
    console.log('getAllSubmittedReceipts called with limitCount:', limitCount);
    
    // Try the optimized query first (requires index)
    try {
      let q;
      if (companyId) {
        q = query(
          collection(db, RECEIPTS_COLLECTION),
          where('companyId', '==', companyId),
          where('status', '!=', 'draft'), // Exclude draft receipts
          orderBy('uploadedAt', 'desc')
        );
      } else {
        q = query(
          collection(db, RECEIPTS_COLLECTION),
          where('status', '!=', 'draft'), // Exclude draft receipts
          orderBy('uploadedAt', 'desc')
        );
      }
      
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(q);
      console.log('getAllSubmittedReceipts query snapshot size:', querySnapshot.size);
      
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
          console.error('Found receipt without ID in getAllSubmittedReceipts:', {
            docId: doc.id,
            data: data,
            receipt: receipt
          });
        }
        
        receipts.push(receipt);
      });
      
      // Debug: Log supervisorId values
      console.log('getAllSubmittedReceipts - supervisorId values:', receipts.map(r => ({
        id: r.id,
        supervisorId: r.supervisorId,
        uploadedBy: r.uploadedBy
      })));
      
      return receipts;
    } catch (indexError: any) {
      // Fallback: Use simpler query and filter client-side
      console.warn('Index not ready, using fallback query:', indexError.message);
      
      let fallbackQuery;
      if (companyId) {
        fallbackQuery = query(
          collection(db, RECEIPTS_COLLECTION),
          where('companyId', '==', companyId),
          orderBy('uploadedAt', 'desc')
        );
      } else {
        fallbackQuery = query(
          collection(db, RECEIPTS_COLLECTION),
          orderBy('uploadedAt', 'desc')
        );
      }
      
      if (limitCount) {
        fallbackQuery = query(fallbackQuery, limit(limitCount * 2)); // Get more to account for filtering
      }
      
      const querySnapshot = await getDocs(fallbackQuery);
      console.log('getAllSubmittedReceipts fallback query snapshot size:', querySnapshot.size);
      
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
        
        // Filter out drafts client-side
        if (receipt.status !== 'draft') {
          receipts.push(receipt);
        }
      });
      
      // Apply limit after filtering if specified
      const finalReceipts = limitCount ? receipts.slice(0, limitCount) : receipts;
      
      console.log('getAllSubmittedReceipts fallback returning:', finalReceipts.length, 'receipts (excluding drafts)');
      return finalReceipts;
    }
  } catch (error) {
    console.error('Error getting all submitted receipts from Firestore:', error);
    throw new Error(`Failed to get receipts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get all receipts (admin function - includes drafts)
 * @param limitCount - Optional limit on number of receipts to return
 * @param companyId - The company ID to filter by
 * @returns Promise with array of receipts
 */
export async function getAllReceipts(limitCount?: number, companyId?: string): Promise<ProcessedReceipt[]> {
  try {
    console.log('getAllReceipts called with limitCount:', limitCount);
    
    let q;
    if (companyId) {
      q = query(
        collection(db, RECEIPTS_COLLECTION),
        where('companyId', '==', companyId),
        orderBy('uploadedAt', 'desc')
      );
    } else {
      q = query(
        collection(db, RECEIPTS_COLLECTION),
        orderBy('uploadedAt', 'desc')
      );
    }
    
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
    
    // Debug: Log supervisorId values
    console.log('getAllReceipts - supervisorId values:', receipts.map(r => ({
      id: r.id,
      supervisorId: r.supervisorId,
      uploadedBy: r.uploadedBy
    })));
    
    return receipts;
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
    const q = query(
      collection(db, RECEIPTS_COLLECTION),
      where('status', '==', status),
      orderBy('uploadedAt', 'desc')
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
    
    return receipts;
  } catch (error) {
    console.error('Error getting receipts by status from Firestore:', error);
    throw new Error(`Failed to get receipts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

