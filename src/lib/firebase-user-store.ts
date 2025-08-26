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
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { User } from '@/types';

const USERS_COLLECTION = 'users';

// Initialize default users in Firestore
export async function initializeDefaultUsers(): Promise<void> {
  try {
    const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
    
    // Only initialize if no users exist
    if (usersSnapshot.empty) {
      const defaultUsers: Omit<User, 'id'>[] = [
        {
          name: 'Alex Admin',
          email: 'admin@corp.com',
          role: 'admin',
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        {
          name: 'Bob Manager',
          email: 'manager@example.com',
          role: 'manager',
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        {
          name: 'Charlie Employee',
          email: 'employee@example.com',
          role: 'employee',
          supervisorId: 'manager-001',
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        {
          name: 'Dana Employee',
          email: 'employee2@example.com',
          role: 'employee',
          supervisorId: 'manager-001',
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
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
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      });
    });
    
    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
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
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
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
    const userData = {
      ...user,
      email: user.email.toLowerCase(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, USERS_COLLECTION), userData);
    console.log('User added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
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
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
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
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
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
      updatedAt: serverTimestamp(),
    });
    console.log('User supervisor updated successfully');
  } catch (error) {
    console.error('Error updating user supervisor:', error);
    throw error;
  }
}

// Real-time listener for users
export function subscribeToUsers(callback: (users: User[]) => void): () => void {
  const unsubscribe = onSnapshot(collection(db, USERS_COLLECTION), (snapshot) => {
    const users: User[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        supervisorId: data.supervisorId,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      });
    });
    callback(users);
  });
  
  return unsubscribe;
}
