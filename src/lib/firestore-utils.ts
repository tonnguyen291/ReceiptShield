/**
 * Firestore Utility Functions
 * ===========================
 * 
 * Utility functions to help with Firestore operations and prevent common issues.
 */

/**
 * Remove undefined and null values from an object
 * This prevents Firestore errors when trying to store undefined values
 * 
 * @param obj - The object to clean
 * @returns A new object with undefined and null values removed
 */
export function cleanFirestoreData<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined && value !== null)
  ) as Partial<T>;
}

/**
 * Safely prepare data for Firestore storage
 * Removes undefined values and ensures all required fields are present
 * 
 * @param data - The data to prepare
 * @param requiredFields - Array of required field names
 * @returns Cleaned data ready for Firestore
 */
export function prepareFirestoreData<T extends Record<string, any>>(
  data: T, 
  requiredFields: (keyof T)[] = []
): Partial<T> {
  const cleaned = cleanFirestoreData(data);
  
  // Check for required fields
  const missingFields = requiredFields.filter(field => !(field in cleaned));
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  return cleaned;
}

/**
 * Validate that a value is not undefined before storing in Firestore
 * 
 * @param value - The value to validate
 * @param fieldName - The name of the field (for error messages)
 * @returns The value if valid, throws error if undefined
 */
export function validateFirestoreValue<T>(value: T | undefined, fieldName: string): T {
  if (value === undefined) {
    throw new Error(`Field '${fieldName}' cannot be undefined for Firestore storage`);
  }
  return value;
}

/**
 * Create a safe object for Firestore storage with optional fields
 * Only includes fields that have valid values
 * 
 * @param data - The data object
 * @param optionalFields - Array of field names that are optional
 * @returns Object with only valid fields
 */
export function createSafeFirestoreObject<T extends Record<string, any>>(
  data: T,
  optionalFields: (keyof T)[] = []
): Partial<T> {
  const result: Partial<T> = {};
  
  for (const [key, value] of Object.entries(data)) {
    // Always include non-optional fields (even if null/undefined, they should be handled)
    if (!optionalFields.includes(key as keyof T)) {
      result[key as keyof T] = value;
    } else if (value !== undefined && value !== null) {
      // Only include optional fields if they have valid values
      result[key as keyof T] = value;
    }
  }
  
  return result;
}
