
'use client';

import type { User, UserRole } from '@/types';
import { useRouter } from 'next/navigation';
import type { Dispatch, ReactNode, SetStateAction} from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { getUserByEmail, addUser as addUserToDB } from '@/lib/user-store';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, role: UserRole) => { success: boolean, message: string };
  createAccount: (name: string, email: string, role: UserRole, supervisorId?: string) => { success: boolean, message: string };
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
        const storedUser: User = JSON.parse(storedUserJSON);
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
    const foundUser = getUserByEmail(email);

    if (foundUser && foundUser.role === role) {
      setUser(foundUser);
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
      return { success: false, message };
    }
  };

  const createAccount = (name: string, email: string, role: UserRole, supervisorId?: string) => {
    const existingUser = getUserByEmail(email);
    if (existingUser) {
        const message = "An account with this email already exists.";
        return { success: false, message };
    }
    
    const newUser: User = { 
      id: `user-${Date.now()}`, 
      name, 
      email, 
      role, 
      supervisorId: role === 'employee' ? supervisorId : undefined,
    };
    
    addUserToDB(newUser);
    setUser(newUser);
    
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
