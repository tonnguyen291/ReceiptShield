// Production configuration and environment setup
import { initializeMonitoring } from './monitoring';
import { initializePerformanceOptimizations } from './performance';

// Production environment configuration
export const productionConfig = {
  // Environment detection
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // App configuration
  app: {
    name: 'ReceiptShield',
    version: process.env.npm_package_version || '1.0.0',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    environment: process.env.NODE_ENV || 'development',
  },
  
  // Firebase configuration
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },
  
  // External services
  services: {
    googleAI: {
      apiKey: process.env.GOOGLE_AI_API_KEY,
    },
    email: {
      from: process.env.NEXT_PUBLIC_EMAIL_FROM || 'noreply@receiptshield.com',
      fromName: process.env.NEXT_PUBLIC_EMAIL_FROM_NAME || 'ReceiptShield',
    },
  },
  
  // Performance settings
  performance: {
    enableMonitoring: process.env.NODE_ENV === 'production',
    enableAnalytics: process.env.NODE_ENV === 'production',
    enableErrorReporting: process.env.NODE_ENV === 'production',
  },
  
  // Security settings
  security: {
    enableCSP: process.env.NODE_ENV === 'production',
    enableHSTS: process.env.NODE_ENV === 'production',
    enableRateLimiting: process.env.NODE_ENV === 'production',
  },
  
  // Feature flags
  features: {
    enableML: true,
    enableEmailNotifications: true,
    enableAnalytics: process.env.NODE_ENV === 'production',
    enableErrorReporting: process.env.NODE_ENV === 'production',
    enablePerformanceMonitoring: process.env.NODE_ENV === 'production',
  },
};

// Validate required environment variables
export const validateEnvironment = (): { isValid: boolean; missing: string[] } => {
  const required = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  return {
    isValid: missing.length === 0,
    missing,
  };
};

// Initialize production features
export const initializeProduction = () => {
  // Validate environment
  const validation = validateEnvironment();
  if (!validation.isValid) {
    console.error('Missing required environment variables:', validation.missing);
    if (productionConfig.isProduction) {
      throw new Error(`Missing required environment variables: ${validation.missing.join(', ')}`);
    }
  }
  
  // Initialize monitoring in production
  if (productionConfig.isProduction && productionConfig.performance.enableMonitoring) {
    initializeMonitoring();
  }
  
  // Initialize performance optimizations
  if (productionConfig.isProduction) {
    initializePerformanceOptimizations();
  }
  
  console.log(`🚀 ReceiptShield initialized in ${productionConfig.app.environment} mode`);
};

// Error handling configuration
export const errorConfig = {
  // Error reporting settings
  enableErrorReporting: productionConfig.isProduction,
  
  // Error categories
  categories: {
    AUTHENTICATION: 'authentication',
    NETWORK: 'network',
    VALIDATION: 'validation',
    UPLOAD: 'upload',
    PROCESSING: 'processing',
    UNKNOWN: 'unknown',
  },
  
  // Error severity levels
  severity: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
  },
};

// Logging configuration
export const loggingConfig = {
  // Log levels
  levels: {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug',
  },
  
  // Log formatting
  format: (level: string, message: string, context?: any): string => {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  },
  
  // Log to console in development, external service in production
  log: (level: string, message: string, context?: any): void => {
    const formattedMessage = loggingConfig.format(level, message, context);
    
    if (productionConfig.isDevelopment) {
      console.log(formattedMessage);
    } else {
      // In production, send to external logging service
      // Example: sendToLoggingService(level, message, context);
      console.log(formattedMessage);
    }
  },
};

// API configuration
export const apiConfig = {
  // API endpoints
  endpoints: {
    base: productionConfig.app.url,
    auth: '/api/auth',
    upload: '/api/upload',
    process: '/api/process',
    ml: '/api/ml-predict',
  },
  
  // Request configuration
  request: {
    timeout: 30000, // 30 seconds
    retries: 3,
    retryDelay: 1000, // 1 second
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
  },
};

// Cache configuration
export const cacheConfig = {
  // Cache TTL (Time To Live) in milliseconds
  ttl: {
    user: 5 * 60 * 1000, // 5 minutes
    receipts: 10 * 60 * 1000, // 10 minutes
    analytics: 60 * 60 * 1000, // 1 hour
  },
  
  // Cache keys
  keys: {
    user: (userId: string) => `user:${userId}`,
    receipts: (userId: string) => `receipts:${userId}`,
    analytics: (date: string) => `analytics:${date}`,
  },
};

// Export configuration for use in other modules
export default productionConfig;
