'use client';

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { User } from '@/types';

const USERS_COLLECTION = 'users';

// Test Firebase connection
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    console.log('Testing Firebase connection...');
    // Use a simpler test - just try to get the users collection
    const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
    console.log('Firebase connection successful, users collection accessible');
    return true;
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return false;
  }
}

// Initialize default users in Firestore
export async function initializeDefaultUsers(): Promise<void> {
  try {
    const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
    
    // Only initialize if no users exist
    if (usersSnapshot.empty) {
      const now = new Date();
      const defaultUsers = [
        {
          name: 'Alex Admin',
          email: 'admin@corp.com',
          role: 'admin',
          status: 'active',
          createdAt: now,
          updatedAt: now,
        },
        {
          name: 'Bob Manager',
          email: 'manager@example.com',
          role: 'manager',
          status: 'active',
          createdAt: now,
          updatedAt: now,
        },
        {
          name: 'Charlie Employee',
          email: 'employee@example.com',
          role: 'employee',
          supervisorId: 'manager-001',
          status: 'active',
          createdAt: now,
          updatedAt: now,
        },
        {
          name: 'Dana Employee',
          email: 'employee2@example.com',
          role: 'employee',
          supervisorId: 'manager-001',
          status: 'active',
          createdAt: now,
          updatedAt: now,
        }
      ];

      for (const user of defaultUsers) {
        await addDoc(collection(db, USERS_COLLECTION), user);
      }
      console.log('Default users initialized in Firestore');
    }
  } catch (error) {
    console.error('Error initializing default users:', error);
  }
}

export async function getUsers(): Promise<User[]> {
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    const users: User[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        supervisorId: data.supervisorId,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
      });
    });
    
    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
}

export async function getUserData(userId: string): Promise<User | null> {
  try {
    // --- DIAGNOSTIC LOGGING ---
    console.log('Attempting to get user data for userId:', userId);
    console.log('Is the db object available?', db);
    // --- END DIAGNOSTIC LOGGING ---

    const userRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        supervisorId: data.supervisorId,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
      };
    } else {
      console.log("No such user document!");
      return null;
    }
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('email', '==', email.toLowerCase())
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        supervisorId: data.supervisorId,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
      };
    }
    return undefined;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return undefined;
  }
}

export async function addUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    // Validate required fields
    if (!user.name || !user.email || !user.role) {
      throw new Error('Missing required fields: name, email, and role are required');
    }

    // Clean and validate the data
    const now = new Date();
    const userData = {
      name: user.name.trim(),
      email: user.email.toLowerCase().trim(),
      role: user.role,
      status: user.status || 'active',
      supervisorId: user.supervisorId || null,
      createdAt: now,
      updatedAt: now,
    };

    // Remove any undefined or null values that might cause issues
    const cleanUserData = Object.fromEntries(
      Object.entries(userData).filter(([_, value]) => value !== undefined && value !== null)
    );
    
    console.log('Adding user to Firestore...');
    
    const docRef = await addDoc(collection(db, USERS_COLLECTION), cleanUserData);
    console.log('User added successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding user to Firestore:', error);
    console.error('User data that caused error:', user);
    throw error;
  }
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date(),
    });
    console.log('User updated successfully');
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function getManagers(): Promise<User[]> {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('role', '==', 'manager'),
      where('status', '==', 'active')
    );
    const querySnapshot = await getDocs(q);
    const managers: User[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      managers.push({
        id: doc.id,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        supervisorId: data.supervisorId,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
      });
    });
    
    return managers;
  } catch (error) {
    console.error('Error getting managers:', error);
    return [];
  }
}

export async function getEmployeesForManager(managerId: string): Promise<User[]> {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('role', '==', 'employee'),
      where('supervisorId', '==', managerId),
      where('status', '==', 'active')
    );
    const querySnapshot = await getDocs(q);
    const employees: User[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      employees.push({
        id: doc.id,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        supervisorId: data.supervisorId,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
      });
    });
    
    return employees;
  } catch (error) {
    console.error('Error getting employees for manager:', error);
    return [];
  }
}

export async function updateUserSupervisor(userId: string, newSupervisorId: string): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      supervisorId: newSupervisorId,
      updatedAt: new Date(),
    });
    console.log('User supervisor updated successfully');
  } catch (error) {
    console.error('Error updating user supervisor:', error);
    throw error;
  }
}

// Real-time listener for users (disabled for now to avoid errors)
export function subscribeToUsers(callback: (users: User[]) => void): () => void {
  // For now, just return a no-op function to avoid real-time listener errors
  // We can re-enable this later when we have better error handling
  console.log('Real-time listener disabled to avoid Firestore errors');
  return () => {};
}
