
'use client';

import type { User, UserRole } from '@/types';
import type { Dispatch, ReactNode, SetStateAction} from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import {
  signUpWithEmail,
  signInWithEmail,
signOutUser,
onAuthStateChange,
} from '@/lib/firebase-auth';
import { getUserData } from '@/lib/firebase-user-store';
import { useRouter } from 'next/navigation';
import { User as FirebaseUser } from 'firebase/auth';

interface AuthResponse {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  createAccount: (name: string, email: string, password: string, role: UserRole, supervisorId?: string) => Promise<AuthResponse>;
  logout: () => void;
  setUser: Dispatch<SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in, fetch their profile from Firestore
        const userData = await getUserData(firebaseUser.uid);
        if (userData) {
          setUser(userData);
        } else {
          // This case might happen if a user is in Auth but not in Firestore.
          // Handle as appropriate, e.g., by logging them out or creating a profile.
          setUser(null);
          await signOutUser();
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const userData = await signInWithEmail(email, password);
      
      if (userData) {
        setUser(userData);
        // Redirect based on role after setting user data
        if (userData.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (userData.role === 'manager') {
          router.push('/manager/dashboard');
        } else {
          router.push('/employee/dashboard');
        }
        return { success: true, message: 'Login successful.' };
      } else {
        // This should not happen in a normal login flow
        await signOutUser();
        return { success: false, message: 'User profile not found.' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let message = 'Login failed. Please try again.';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = 'Invalid email or password.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      } else if (error.message) {
        message = error.message;
      }
      
      return { success: false, message };
    }
  };

  const createAccount = async (name: string, email: string, password: string, role: UserRole, supervisorId?: string): Promise<AuthResponse> => {
    try {
      // Create user in Firebase Auth and Firestore
      const newUser = await signUpWithEmail(email, password, name, role, supervisorId);
      setUser(newUser);
      
      // Redirect based on role
      if (newUser.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (newUser.role === 'manager') {
        router.push('/manager/dashboard');
      } else {
        router.push('/employee/dashboard');
      }
      return { success: true, message: 'Account created successfully.' };
    } catch (error: any) {
      console.error('Create account error:', error);
      let message = 'Failed to create account. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters long.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      } else if (error.message) {
        message = error.message;
      }
      
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await signOutUser();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, createAccount, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
