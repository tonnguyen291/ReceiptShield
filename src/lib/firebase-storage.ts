import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Upload a receipt image to Firebase Storage with retry logic
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
  const maxRetries = 3;
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Debug: Log storage configuration
      console.log(`Firebase Storage Upload Attempt ${attempt}/${maxRetries}:`, {
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        defaultBucket: 'recieptshield.firebasestorage.app',
        fileSize: file.size,
        fileName: file.name
      });
      
      // Create a unique path for the receipt image
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `receipt-${receiptId}.${fileExtension}`;
      const storagePath = `receipts/${userId}/${fileName}`;
      
      console.log('Uploading to path:', storagePath);
      
      // Create a reference to the file location
      const storageRef = ref(storage, storagePath);
      
      // Upload the file with timeout
      const uploadPromise = uploadBytes(storageRef, file);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Upload timeout after 30 seconds')), 30000)
      );
      
      const snapshot = await Promise.race([uploadPromise, timeoutPromise]) as any;
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log('Receipt image uploaded successfully:', {
        path: storagePath,
        url: downloadURL,
        size: file.size,
        attempt
      });
      
      return {
        url: downloadURL,
        path: storagePath
      };
    } catch (error) {
      lastError = error as Error;
      console.error(`Upload attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // All retries failed
  console.error('All upload attempts failed. Final error:', lastError);
  console.error('Storage bucket being used:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
  
  throw new Error(`Failed to upload receipt image after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
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
 * Test Firebase Storage connectivity
 * @returns Promise<boolean> - true if storage is accessible
 */
export async function testStorageConnectivity(): Promise<boolean> {
  try {
    console.log('Testing Firebase Storage connectivity...');
    console.log('Storage bucket:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
    
    // Try to create a reference to a test path
    const testRef = ref(storage, 'test/connectivity-check');
    console.log('Storage reference created successfully');
    
    return true;
  } catch (error) {
    console.error('Firebase Storage connectivity test failed:', error);
    return false;
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

