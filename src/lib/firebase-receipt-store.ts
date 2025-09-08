
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Receipt } from '@/types';

const RECEIPTS_COLLECTION = 'receipts';

/**
 * Uploads a receipt image to Firebase Storage and saves the receipt data to Firestore.
 *
 * @param userId - The ID of the user uploading the receipt.
 * @param receiptData - The receipt data to save (excluding the image file).
 * @param imageFile - The receipt image file to upload.
 * @returns The ID of the newly created receipt document.
 */
export async function uploadReceipt(
  userId: string,
  receiptData: Omit<Receipt, 'id' | 'imageUrl' | 'userId'>,
  imageFile: File
): Promise<string> {
  if (!userId) {
    throw new Error('User is not authenticated.');
  }
  if (!imageFile) {
    throw new Error('Image file is missing.');
  }

  // 1. Upload image to Cloud Storage
  const filePath = `receipts/${userId}/${Date.now()}_${imageFile.name}`;
  const storageRef = ref(storage, filePath);
  const uploadResult = await uploadBytes(storageRef, imageFile);
  const imageUrl = await getDownloadURL(uploadResult.ref);

  // 2. Save receipt data to Firestore
  const newReceiptData = {
    ...receiptData,
    userId,
    imageUrl,
    status: 'pending' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const docRef = await addDoc(collection(db, RECEIPTS_COLLECTION), newReceiptData);
  return docRef.id;
}

/**
 * Fetches all receipts for a specific user.
 *
 * @param userId - The ID of the user.
 * @returns A promise that resolves to an array of receipts.
 */
export async function getReceiptsByUserId(userId: string): Promise<Receipt[]> {
  const q = query(collection(db, RECEIPTS_COLLECTION), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Receipt)
  );
}

/**
 * Fetches a single receipt by its ID.
 *
 * @param receiptId - The ID of the receipt.
 * @returns A promise that resolves to the receipt data, or null if not found.
 */
export async function getReceiptById(receiptId: string): Promise<Receipt | null> {
  const docRef = doc(db, RECEIPTS_COLLECTION, receiptId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Receipt;
  } else {
    return null;
  }
}

// TODO: Add functions for updating and deleting receipts as needed for managers/admins.
