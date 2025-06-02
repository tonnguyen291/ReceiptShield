
'use client';

import type { User, UserRole } from '@/types';
import { useRouter } from 'next/navigation';
import type { Dispatch, ReactNode, SetStateAction} from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, role: UserRole) => void;
  createAccount: (name: string, email: string, role: UserRole) => void;
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
    try {
      const storedUserJSON = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUserJSON) {
        const storedUser = JSON.parse(storedUserJSON);
        // Ensure dob field exists for older stored users
        if (!('dob' in storedUser)) {
          storedUser.dob = '';
        }
        setUser(storedUser);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) { 
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }, [user, isLoading]);

  const login = (email: string, role: UserRole) => {
    // In a real app, you'd authenticate against a backend.
    // Here, we're creating/retrieving a mock user.
    // For simplicity, if user exists in storage, we use that, otherwise create one.
    let existingUser: User | null = null;
    try {
      const storedUserJSON = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUserJSON) {
        const potentialUser = JSON.parse(storedUserJSON);
        if (potentialUser.email === email && potentialUser.role === role) {
          existingUser = potentialUser;
          if (!('dob' in existingUser!)) { // Ensure dob for older entries
            existingUser!.dob = '';
          }
        }
      }
    } catch (e) { /* ignore */ }

    if (!existingUser) {
      existingUser = { 
        id: Date.now().toString(), 
        email, 
        role, 
        name: email.split('@')[0], 
        dob: '' 
      };
    }
    
    setUser(existingUser); // This will trigger the useEffect to save to localStorage
    if (role === 'manager') {
      router.push('/manager/dashboard');
    } else {
      router.push('/employee/dashboard');
    }
  };

  const createAccount = (name: string, email: string, role: UserRole) => {
    const newUser: User = { 
      id: Date.now().toString(), 
      name, 
      email, 
      role, 
      dob: '' // Initialize dob
    };
    setUser(newUser); // This will trigger the useEffect to save to localStorage
    if (role === 'manager') {
      router.push('/manager/dashboard');
    } else {
      router.push('/employee/dashboard');
    }
  };

  const logout = () => {
    setUser(null); // This will trigger the useEffect to remove from localStorage
    router.push('/login');
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
