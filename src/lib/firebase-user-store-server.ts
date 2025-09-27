import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { User } from '@/types';

const USERS_COLLECTION = 'users';

/**
 * Server-side function to add a new user to Firestore
 * @param userData - The user data to add
 * @returns Promise with the new user ID
 */
export async function addUserServer(userData: Omit<User, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, USERS_COLLECTION), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    console.log('User created successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding user to Firestore:', error);
    throw new Error(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Server-side function to get a user by email
 * @param email - The email to search for
 * @returns Promise with the user or null if not found
 */
export async function getUserByEmailServer(email: string): Promise<User | null> {
  try {
    const q = query(collection(db, USERS_COLLECTION), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt instanceof Timestamp 
        ? data.createdAt.toDate().toISOString() 
        : data.createdAt,
      updatedAt: data.updatedAt instanceof Timestamp 
        ? data.updatedAt.toDate().toISOString() 
        : data.updatedAt,
    } as User;
  } catch (error) {
    console.error('Error getting user by email from Firestore:', error);
    throw new Error(`Failed to get user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Server-side function to update a user
 * @param userId - The ID of the user to update
 * @param updates - The fields to update
 * @returns Promise<void>
 */
export async function updateUserServer(userId: string, updates: Partial<User>): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    
    console.log('User updated successfully:', userId);
  } catch (error) {
    console.error('Error updating user in Firestore:', error);
    throw new Error(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Server-side function to get all users
 * @returns Promise with array of users
 */
export async function getAllUsersServer(): Promise<User[]> {
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    const users: User[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate().toISOString() 
          : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp 
          ? data.updatedAt.toDate().toISOString() 
          : data.updatedAt,
      } as User);
    });
    
    return users;
  } catch (error) {
    console.error('Error getting all users from Firestore:', error);
    throw new Error(`Failed to get users: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
