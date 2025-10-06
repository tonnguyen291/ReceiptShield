// Production monitoring and analytics setup
import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent, type Analytics } from 'firebase/analytics';
import { getPerformance, trace, type Performance } from 'firebase/performance';

// Initialize Firebase Analytics and Performance Monitoring
let analytics: Analytics | null = null;
let performance: Performance | null = null;

export const initializeMonitoring = () => {
  if (typeof window === 'undefined') return;

  try {
    // Initialize Firebase app (assuming it's already initialized)
    const app = initializeApp({
      // Your Firebase config will be loaded from environment variables
    });

    // Initialize Analytics
    analytics = getAnalytics(app);
    
    // Initialize Performance Monitoring
    performance = getPerformance(app);
    
    console.log('Monitoring initialized successfully');
  } catch (error) {
    console.error('Failed to initialize monitoring:', error);
  }
};

// Analytics event tracking
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (!analytics) return;
  
  try {
    logEvent(analytics, eventName, parameters);
  } catch (error) {
    console.error('Failed to track event:', error);
  }
};

// Performance tracking
export const startTrace = (traceName: string) => {
  if (!performance) return null;
  
  try {
    return trace(performance, traceName);
  } catch (error) {
    console.error('Failed to start trace:', error);
    return null;
  }
};

// Predefined tracking functions for common events
export const trackUserAction = {
  // Authentication events
  login: (method: string) => trackEvent('login', { method }),
  signup: (method: string) => trackEvent('sign_up', { method }),
  logout: () => trackEvent('logout'),
  
  // Receipt events
  receiptUpload: (fileType: string, fileSize: number) => 
    trackEvent('receipt_upload', { file_type: fileType, file_size: fileSize }),
  receiptProcessed: (processingTime: number, success: boolean) => 
    trackEvent('receipt_processed', { processing_time: processingTime, success }),
  fraudDetected: (fraudProbability: number, riskLevel: string) => 
    trackEvent('fraud_detected', { fraud_probability: fraudProbability, risk_level: riskLevel }),
  
  // Navigation events
  pageView: (pageName: string) => trackEvent('page_view', { page_name: pageName }),
  
  // Error events
  error: (errorType: string, errorMessage: string, context?: string) => 
    trackEvent('error_occurred', { 
      error_type: errorType, 
      error_message: errorMessage, 
      context 
    }),
};

// Performance monitoring helpers
export const performanceMonitoring = {
  // Track page load performance
  trackPageLoad: (pageName: string) => {
    const trace = startTrace(`page_load_${pageName}`);
    if (trace) {
      trace.start();
      window.addEventListener('load', () => {
        trace.stop();
      });
    }
  },
  
  // Track API call performance
  trackApiCall: (apiName: string, duration: number, success: boolean) => {
    trackEvent('api_call', {
      api_name: apiName,
      duration,
      success,
    });
  },
  
  // Track user interaction performance
  trackUserInteraction: (interactionType: string, duration: number) => {
    trackEvent('user_interaction', {
      interaction_type: interactionType,
      duration,
    });
  },
};

// Error boundary helper
export const reportError = (error: Error, context?: string) => {
  console.error('Error reported:', error);
  
  trackUserAction.error(
    error.name,
    error.message,
    context
  );
  
  // You can also send to external error tracking service here
  // Example: Sentry.captureException(error, { tags: { context } });
};

// Initialize monitoring when the module is imported
if (typeof window !== 'undefined') {
  initializeMonitoring();
}
