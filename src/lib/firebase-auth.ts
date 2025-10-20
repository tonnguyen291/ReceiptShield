'use client';

import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from './firebase';
import type { User, UserRole } from '@/types';

// Convert Firebase User to our User type
function firebaseUserToUser(firebaseUser: FirebaseUser, userData?: any): User {
  return {
    id: firebaseUser.uid,
    uid: firebaseUser.uid,
    name: userData?.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Unknown',
    email: firebaseUser.email || '',
    role: userData?.role || 'employee',
    status: userData?.status || 'active',
    supervisorId: userData?.supervisorId,
    createdAt: userData?.createdAt?.toDate() || new Date(),
    updatedAt: userData?.updatedAt?.toDate() || new Date(),
  };
}

// Helper function to create user profile if it doesn't exist
async function ensureUserProfile(firebaseUser: FirebaseUser): Promise<User> {
  let userData = await getUserData(firebaseUser.uid);
  
  if (!userData) {
    console.log('User profile not found, creating new profile for:', firebaseUser.email);
    const newUserData = {
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Unknown User',
      email: firebaseUser.email?.toLowerCase() || '',
      role: 'employee' as UserRole,
      status: 'active' as const,
      supervisorId: undefined,
    };
    
    await createUserProfile(firebaseUser.uid, newUserData);
    userData = await getUserData(firebaseUser.uid);
    
    if (!userData) {
      throw new Error('Failed to create user profile');
    }
  }
  
  return userData;
}

// Create user profile in Firestore
async function createUserProfile(userId: string, userData: Partial<User>): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      uid: userId,
      name: userData.name,
      email: userData.email?.toLowerCase(),
      role: userData.role,
      status: 'active',
      supervisorId: userData.supervisorId || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('User profile created in Firestore');
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

// Get user data from Firestore
async function getUserData(userId: string): Promise<User | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        id: userId,
        uid: data.uid || userId,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        supervisorId: data.supervisorId,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}

// Sign up with email and password
export async function signUpWithEmail(
  email: string, 
  password: string, 
  name: string, 
  role: UserRole, 
  supervisorId?: string,
  companyName?: string
): Promise<User> {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update display name
    await updateProfile(firebaseUser, { displayName: name });

    let companyId: string | undefined;
    let isCompanyOwner = false;
    let canManageSubscription = false;

    // If company name is provided, create a new company
    if (companyName && role === 'admin') {
      const { createCompany } = await import('./firebase-company-store');
      companyId = await createCompany(companyName, firebaseUser.uid);
      isCompanyOwner = true;
      canManageSubscription = true;
    }

    // Create user profile in Firestore
    await createUserProfile(firebaseUser.uid, {
      name,
      email,
      role,
      supervisorId,
      companyId,
      isCompanyOwner,
      canManageSubscription,
    });

    // Get the complete user data
    const userData = await getUserData(firebaseUser.uid);
    if (!userData) {
      throw new Error('Failed to create user profile');
    }

    return userData;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}

// Sign in with email and password
export async function signInWithEmail(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Get user data from Firestore, create profile if it doesn't exist
    const userData = await ensureUserProfile(firebaseUser);

    if (userData.status === 'inactive') {
      await signOut(auth);
      throw new Error('Your account has been deactivated. Please contact an administrator.');
    }

    return userData;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

// Sign out
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  try {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      return null;
    }

    const userData = await ensureUserProfile(firebaseUser);
    return userData;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Listen to auth state changes
export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const userData = await ensureUserProfile(firebaseUser);
        callback(userData);
      } catch (error) {
        console.error('Error getting user data on auth state change:', error);
        callback(null);
      }
    } else {
      callback(null);
    }
  });
}

// Get all users (for admin/managers)
export async function getAllUsers(): Promise<User[]> {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users: User[] = [];
    
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        uid: data.uid || doc.id,
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
    console.error('Error getting all users:', error);
    return [];
  }
}

// Get managers
export async function getManagers(): Promise<User[]> {
  try {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'manager'),
      where('status', '==', 'active')
    );
    const querySnapshot = await getDocs(q);
    const managers: User[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      managers.push({
        id: doc.id,
        uid: data.uid || doc.id,
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

// Update user profile
export async function updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Update user email (syncs with Firebase Auth)
export async function updateUserEmail(userId: string, newEmail: string, currentPassword: string): Promise<void> {
  try {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      throw new Error('No authenticated user');
    }

    if (firebaseUser.uid !== userId) {
      throw new Error('User ID mismatch');
    }

    // Re-authenticate user before updating email
    const credential = EmailAuthProvider.credential(firebaseUser.email!, currentPassword);
    await reauthenticateWithCredential(firebaseUser, credential);

    // Update email in Firebase Auth
    await updateEmail(firebaseUser, newEmail);

    // Update email in Firestore
    await updateUserProfile(userId, { email: newEmail.toLowerCase() });

    console.log('Email updated successfully');
  } catch (error) {
    console.error('Error updating email:', error);
    throw error;
  }
}
