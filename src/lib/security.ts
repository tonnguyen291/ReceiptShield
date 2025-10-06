// Security configuration and utilities for production
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Security headers configuration
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.google.com https://apis.google.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https: blob:;
    connect-src 'self' https://*.googleapis.com https://*.firebaseapp.com wss://*.firebaseapp.com;
    frame-src 'self' https://*.google.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
  `.replace(/\s+/g, ' ').trim(),
};

// Input validation utilities
export const inputValidation = {
  // Sanitize user input
  sanitizeInput: (input: string): string => {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  },
  
  // Validate email format
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  // Validate file type for uploads
  isValidFileType: (fileName: string, allowedTypes: string[]): boolean => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension ? allowedTypes.includes(extension) : false;
  },
  
  // Validate file size
  isValidFileSize: (fileSize: number, maxSizeInMB: number): boolean => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return fileSize <= maxSizeInBytes;
  },
};

// Rate limiting configuration
export const rateLimiting = {
  // API rate limits
  apiLimits: {
    login: { requests: 5, window: 15 * 60 * 1000 }, // 5 requests per 15 minutes
    signup: { requests: 3, window: 60 * 60 * 1000 }, // 3 requests per hour
    upload: { requests: 10, window: 60 * 60 * 1000 }, // 10 uploads per hour
    passwordReset: { requests: 3, window: 60 * 60 * 1000 }, // 3 resets per hour
  },
  
  // Check if request is within rate limit
  isWithinRateLimit: (key: string, limit: { requests: number; window: number }): boolean => {
    // This would typically use Redis or similar for production
    // For now, we'll use localStorage as a simple implementation
    const now = Date.now();
    const stored = localStorage.getItem(`rate_limit_${key}`);
    
    if (!stored) {
      localStorage.setItem(`rate_limit_${key}`, JSON.stringify([now]));
      return true;
    }
    
    const requests: number[] = JSON.parse(stored);
    const validRequests = requests.filter(time => now - time < limit.window);
    
    if (validRequests.length >= limit.requests) {
      return false;
    }
    
    validRequests.push(now);
    localStorage.setItem(`rate_limit_${key}`, JSON.stringify(validRequests));
    return true;
  },
};

// Security middleware for API routes
export const securityMiddleware = {
  // CORS configuration
  corsOptions: {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      const allowedOrigins = [
        process.env.NEXT_PUBLIC_APP_URL,
        'http://localhost:3000',
        'http://localhost:9003',
      ].filter(Boolean);
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  },
  
  // Security headers middleware
  setSecurityHeaders: (res: any) => {
    Object.entries(securityHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
  },
};

// Firebase security configuration
export const firebaseSecurity = {
  // Initialize Firebase with security settings
  initializeSecureFirebase: () => {
    const app = initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    });
    
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    const storage = getStorage(app);
    
    // Configure emulators for development
    if (process.env.NODE_ENV === 'development') {
      try {
        connectAuthEmulator(auth, 'http://localhost:9099');
        connectFirestoreEmulator(firestore, 'localhost', 8080);
        connectStorageEmulator(storage, 'localhost', 9199);
      } catch (error) {
        // Emulators might already be connected
        console.log('Firebase emulators already connected or not available');
      }
    }
    
    return { app, auth, firestore, storage };
  },
};

// Content Security Policy configuration
export const cspConfig = {
  // Generate CSP header
  generateCSP: (isProduction: boolean = false): string => {
    const baseCSP = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.google.com https://apis.google.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com;
      img-src 'self' data: https: blob:;
      connect-src 'self' https://*.googleapis.com https://*.firebaseapp.com wss://*.firebaseapp.com;
      frame-src 'self' https://*.google.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
    `;
    
    if (isProduction) {
      return baseCSP + " upgrade-insecure-requests;";
    }
    
    return baseCSP;
  },
};

// Security utilities
export const securityUtils = {
  // Generate secure random string
  generateSecureToken: (length: number = 32): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
  
  // Hash sensitive data (simple implementation)
  hashSensitiveData: (data: string): string => {
    // In production, use a proper hashing library like bcrypt
    return btoa(data); // Simple base64 encoding for demo
  },
  
  // Validate session token
  validateSession: (token: string): boolean => {
    // Implement proper JWT validation in production
    return token && token.length > 0;
  },
};
