
'use client';

import type { User, UserRole } from '@/types';
import type { Dispatch, ReactNode, SetStateAction} from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { getUserByEmail, addUser as addUserToDB, getUsers } from '@/lib/user-store';
import { useRouter } from 'next/navigation';

interface AuthResponse {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, role: UserRole) => AuthResponse;
  createAccount: (name: string, email: string, role: UserRole, supervisorId?: string) => AuthResponse;
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
    // Initialize users DB on load
    getUsers(); 
    try {
      const storedUserJSON = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUserJSON) {
        const storedUser: User = JSON.parse(storedUserJSON);
        // Ensure user is still valid and active on load
        const freshUser = getUserByEmail(storedUser.email);
        if (freshUser && freshUser.status === 'active') {
          setUser(storedUser);
        } else {
          // If user doesn't exist or is inactive, clear from storage
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // This effect runs only when the user state changes *after* initial loading
    if (!isLoading) { 
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }, [user, isLoading]);

  const login = (email: string, role: UserRole): AuthResponse => {
    const foundUser = getUserByEmail(email);

    if (foundUser && foundUser.role === role) {
      if (foundUser.status === 'inactive') {
        return { success: false, message: 'Your account has been deactivated. Please contact an administrator.' };
      }
      setUser(foundUser);
      // Let the AppLayout's useEffect handle redirection based on role
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else if (role === 'manager') {
        router.push('/manager/dashboard');
      } else {
        router.push('/employee/dashboard');
      }
      return { success: true, message: 'Login successful.' };
    } else {
      const message = "Login failed. Check your credentials and selected role.";
      console.error(message);
      return { success: false, message: "Login failed. Check your credentials and selected role." };
    }
  };

  const createAccount = (name: string, email: string, role: UserRole, supervisorId?: string): AuthResponse => {
    const existingUser = getUserByEmail(email);
    if (existingUser) {
        return { success: false, message: "An account with this email already exists." };
    }
    
    const newUser: User = { 
      id: `user-${Date.now()}`, 
      name, 
      email, 
      role, 
      supervisorId: role === 'employee' ? supervisorId : undefined,
      status: 'active',
    };
    
    addUserToDB(newUser);
    setUser(newUser);
    
    // Let the AppLayout's useEffect handle redirection based on role
    if (role === 'admin') {
      router.push('/admin/dashboard');
    } else if (role === 'manager') {
      router.push('/manager/dashboard');
    } else {
      router.push('/employee/dashboard');
    }
    return { success: true, message: 'Account created successfully.' };
  };

  const logout = () => {
    setUser(null);
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
