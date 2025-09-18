import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Upload a receipt image to Firebase Storage
 * @param file - The image file to upload
 * @param userId - The ID of the user uploading the receipt
 * @param receiptId - The unique ID of the receipt
 * @returns Promise with download URL and storage path
 */
export async function uploadReceiptImage(
  file: File, 
  userId: string, 
  receiptId: string
): Promise<UploadResult> {
  try {
    // Debug: Log storage configuration
    console.log('Firebase Storage Configuration:', {
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      defaultBucket: 'recieptshield.firebasestorage.app'
    });
    
    // Create a unique path for the receipt image
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `receipt-${receiptId}.${fileExtension}`;
    const storagePath = `receipts/${userId}/${fileName}`;
    
    console.log('Uploading to path:', storagePath);
    
    // Create a reference to the file location
    const storageRef = ref(storage, storagePath);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('Receipt image uploaded successfully:', {
      path: storagePath,
      url: downloadURL,
      size: file.size
    });
    
    return {
      url: downloadURL,
      path: storagePath
    };
  } catch (error) {
    console.error('Error uploading receipt image:', error);
    console.error('Storage bucket being used:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
    throw new Error(`Failed to upload receipt image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a receipt image from Firebase Storage
 * @param storagePath - The storage path of the image to delete
 */
export async function deleteReceiptImage(storagePath: string): Promise<void> {
  try {
    const imageRef = ref(storage, storagePath);
    await deleteObject(imageRef);
    console.log('Receipt image deleted successfully:', storagePath);
  } catch (error) {
    console.error('Error deleting receipt image:', error);
    throw new Error(`Failed to delete receipt image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert a File to a data URI for preview purposes
 * @param file - The file to convert
 * @returns Promise with data URI string
 */
export function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

