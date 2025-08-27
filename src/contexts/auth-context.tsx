
'use client';

import type { User, UserRole } from '@/types';
import type { Dispatch, ReactNode, SetStateAction} from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { getUserByEmail, addUser as addUserToDB, getUsers, initializeDefaultUsers, testFirebaseConnection } from '@/lib/firebase-user-store';
import { useRouter } from 'next/navigation';

interface AuthResponse {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, role: UserRole) => Promise<AuthResponse>;
  createAccount: (name: string, email: string, role: UserRole, supervisorId?: string) => Promise<AuthResponse>;
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
    // Initialize Firebase users DB on load
    const initializeAuth = async () => {
      try {
        // Set a timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          console.warn('Firebase initialization taking too long, proceeding without initialization');
          setIsLoading(false);
        }, 10000); // 10 second timeout

        // Test Firebase connection first
        const isConnected = await testFirebaseConnection();
        if (!isConnected) {
          console.warn('Firebase connection failed, proceeding in offline mode');
          setIsLoading(false);
          return;
        }

        await initializeDefaultUsers();
        const users = await getUsers();
        console.log('Loaded users from Firestore:', users.length);
        
        const storedUserJSON = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedUserJSON) {
          const storedUser: User = JSON.parse(storedUserJSON);
          // Ensure user is still valid and active on load
          const freshUser = await getUserByEmail(storedUser.email);
          if (freshUser && freshUser.status === 'active') {
            setUser(storedUser);
          } else {
            // If user doesn't exist or is inactive, clear from storage
            localStorage.removeItem(AUTH_STORAGE_KEY);
          }
        }
        
        clearTimeout(timeoutId);
      } catch (error) {
        console.error("Failed to initialize Firebase users:", error);
        // Continue even if Firebase fails
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
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

  const login = async (email: string, role: UserRole): Promise<AuthResponse> => {
    try {
      const foundUser = await getUserByEmail(email);

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
        return { success: false, message: "Login failed. Check your credentials and selected role." };
      }
    } catch (error) {
      console.error('Login error:', error);
      // Fallback to default users if Firebase fails
      const defaultUsers = [
        { email: 'admin@corp.com', role: 'admin' as UserRole },
        { email: 'manager@example.com', role: 'manager' as UserRole },
        { email: 'employee@example.com', role: 'employee' as UserRole },
        { email: 'employee2@example.com', role: 'employee' as UserRole },
      ];
      
      const defaultUser = defaultUsers.find(u => u.email === email && u.role === role);
      if (defaultUser) {
        const fallbackUser: User = {
          id: `fallback-${Date.now()}`,
          name: email.split('@')[0],
          email: email,
          role: role,
          status: 'active',
        };
        setUser(fallbackUser);
        
        if (role === 'admin') {
          router.push('/admin/dashboard');
        } else if (role === 'manager') {
          router.push('/manager/dashboard');
        } else {
          router.push('/employee/dashboard');
        }
        return { success: true, message: 'Login successful (offline mode).' };
      }
      
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const createAccount = async (name: string, email: string, role: UserRole, supervisorId?: string): Promise<AuthResponse> => {
    try {
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
          return { success: false, message: "An account with this email already exists." };
      }
      
      // Clear any existing session data before creating a new account
      logout();

      const newUserData = { 
        name, 
        email, 
        role, 
        supervisorId: role === 'employee' ? supervisorId : undefined,
        status: 'active' as const,
      };
      
      const userId = await addUserToDB(newUserData);
      const newUser: User = { 
        id: userId,
        ...newUserData,
      };
      
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
    } catch (error) {
      console.error('Create account error:', error);
      return { success: false, message: 'Failed to create account. Please try again.' };
    }
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
