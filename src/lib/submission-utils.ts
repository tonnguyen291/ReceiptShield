/**
 * Utility functions for generating and managing submission IDs
 */

/**
 * Generate a unique submission ID for tracking receipt submissions
 * Format: sub_{userUidPrefix}_{timestamp}_{random}
 * @param userUid - Firebase Auth UID of the user
 * @returns Unique submission ID
 */
export function generateSubmissionId(userUid: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const userPrefix = userUid.substring(0, 8);
  return `sub_${userPrefix}_${timestamp}_${random}`;
}

/**
 * Generate a unique receipt ID for Firestore documents
 * Format: rec_{timestamp}_{random}
 * @returns Unique receipt ID
 */
export function generateReceiptId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `rec_${timestamp}_${random}`;
}

/**
 * Extract user UID from submission ID
 * @param submissionId - The submission ID
 * @returns User UID prefix or null if invalid format
 */
export function extractUserUidFromSubmissionId(submissionId: string): string | null {
  const match = submissionId.match(/^sub_([a-zA-Z0-9]+)_/);
  return match ? match[1] : null;
}

/**
 * Validate submission ID format
 * @param submissionId - The submission ID to validate
 * @returns True if valid format
 */
export function isValidSubmissionId(submissionId: string): boolean {
  return /^sub_[a-zA-Z0-9]+_\d+_[a-zA-Z0-9]+$/.test(submissionId);
}

/**
 * Generate a processing version string
 * @returns Current processing version
 */
export function getProcessingVersion(): string {
  return 'v1.0.0'; // Update this when AI models or processing logic changes
}

/**
 * Calculate image hash for duplicate detection
 * This is a simplified version - in production, you'd use a proper perceptual hashing library
 * @param imageData - Base64 image data or file buffer
 * @returns Hash string
 */
export async function calculateImageHash(imageData: string | ArrayBuffer): Promise<string> {
  // For now, we'll use a simple hash based on the data length and some characters
  // In production, you'd use libraries like 'blockhash' or 'pHash' for perceptual hashing
  const data = typeof imageData === 'string' ? imageData : new TextDecoder().decode(imageData);
  const hash = data.length.toString(36) + data.substring(0, 10).replace(/[^a-zA-Z0-9]/g, '');
  return hash.substring(0, 16);
}

/**
 * Calculate blur score for image quality assessment
 * This is a simplified version - in production, you'd use proper image processing
 * @param imageData - Base64 image data
 * @returns Blur score (0-1, higher = more blurry)
 */
export async function calculateBlurScore(imageData: string): Promise<number> {
  // Simplified blur detection based on data characteristics
  // In production, you'd use libraries like 'sharp' with Laplacian variance
  const dataLength = imageData.length;
  const compressionRatio = dataLength / 100000; // Rough compression estimate
  return Math.min(1, Math.max(0, 1 - compressionRatio));
}

/**
 * Extract image dimensions from base64 data
 * @param imageData - Base64 image data
 * @returns Image dimensions or default values
 */
export async function extractImageDimensions(imageData: string): Promise<{ width: number; height: number }> {
  // This is a simplified version - in production, you'd parse the actual image headers
  // For now, return default dimensions
  return { width: 800, height: 600 };
}
