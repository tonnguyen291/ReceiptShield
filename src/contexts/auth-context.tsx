
'use client';

import type { User, UserRole } from '@/types';
import type { Dispatch, ReactNode, SetStateAction} from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signUpWithEmail, 
  signInWithEmail, 
  signOutUser, 
  onAuthStateChange, 
  getManagers 
} from '@/lib/firebase-auth';
import { useRouter } from 'next/navigation';

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

const AUTH_STORAGE_KEY = 'receiptShieldUser';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Listen to Firebase Auth state changes
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Remove localStorage usage since Firebase Auth handles persistence

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const user = await signInWithEmail(email, password);
      setUser(user);
      
      // Let the AppLayout's useEffect handle redirection based on role
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'manager') {
        router.push('/manager/dashboard');
      } else {
        router.push('/employee/dashboard');
      }
      return { success: true, message: 'Login successful.' };
    } catch (error: any) {
      console.error('Login error:', error);
      let message = 'Login failed. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      } else if (error.message) {
        message = error.message;
      }
      
      return { success: false, message };
    }
  };

  const createAccount = async (name: string, email: string, password: string, role: UserRole, supervisorId?: string, companyName?: string): Promise<AuthResponse> => {
    try {
      // Clear any existing session data before creating a new account
      logout();

      const user = await signUpWithEmail(email, password, name, role, supervisorId, companyName);
      setUser(user);
      
      // Let the AppLayout's useEffect handle redirection based on role
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else if (role === 'manager') {
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