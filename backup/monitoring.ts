import { initializeApp } from 'firebase/app';
import { getPerformance, trace, getAnalytics, logEvent } from 'firebase/analytics';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { alerting } from './alerting';

// Initialize Firebase Performance Monitoring
const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

// Initialize Performance Monitoring
const perf = getPerformance(app);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Performance monitoring utilities
export const performanceMonitoring = {
  // Track page load times
  trackPageLoad: (pageName: string) => {
    const pageTrace = trace(perf, `page_load_${pageName}`);
    pageTrace.start();
    
    // Stop trace when page is fully loaded
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        pageTrace.stop();
      });
    }
  },

  // Track custom metrics
  trackCustomMetric: (metricName: string, value: number, unit: string = 'ms') => {
    const customTrace = trace(perf, metricName);
    customTrace.putMetric(metricName, value);
    customTrace.putAttribute('unit', unit);
    customTrace.stop();
  },

  // Track API response times
  trackApiCall: async (apiName: string, apiCall: () => Promise<any>) => {
    const apiTrace = trace(perf, `api_call_${apiName}`);
    apiTrace.start();
    
    try {
      const result = await apiCall();
      apiTrace.putMetric('success', 1);
      return result;
    } catch (error) {
      apiTrace.putMetric('error', 1);
      throw error;
    } finally {
      apiTrace.stop();
    }
  },

  // Track user interactions
  trackUserInteraction: (interactionName: string, details?: Record<string, any>) => {
    logEvent(analytics, 'user_interaction', {
      interaction_name: interactionName,
      timestamp: Date.now(),
      ...details
    });
  }
};

// Error tracking and logging
export const errorMonitoring = {
  // Log errors to Firestore
  logError: async (error: Error, context?: Record<string, any>) => {
    try {
      await addDoc(collection(db, 'error_logs'), {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: serverTimestamp(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        url: typeof window !== 'undefined' ? window.location.href : 'server',
        severity: 'error'
      });
      
      // Check for critical error spikes
      await alerting.checkCriticalErrorSpike();
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  },

  // Log warnings
  logWarning: async (message: string, context?: Record<string, any>) => {
    try {
      await addDoc(collection(db, 'error_logs'), {
        message,
        context,
        timestamp: serverTimestamp(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        url: typeof window !== 'undefined' ? window.location.href : 'server',
        severity: 'warning'
      });
    } catch (logError) {
      console.error('Failed to log warning:', logError);
    }
  },

  // Track unhandled errors
  trackUnhandledErrors: () => {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        errorMonitoring.logError(new Error(event.error?.message || 'Unhandled error'), {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        errorMonitoring.logError(new Error(event.reason?.message || 'Unhandled promise rejection'), {
          reason: event.reason
        });
      });
    }
  }
};

// Analytics and user tracking
export const analyticsMonitoring = {
  // Track page views
  trackPageView: (pageName: string, pageTitle?: string) => {
    logEvent(analytics, 'page_view', {
      page_name: pageName,
      page_title: pageTitle || document.title,
      timestamp: Date.now()
    });
  },

  // Track user actions
  trackUserAction: (actionName: string, details?: Record<string, any>) => {
    logEvent(analytics, 'user_action', {
      action_name: actionName,
      timestamp: Date.now(),
      ...details
    });
  },

  // Track business metrics
  trackBusinessMetric: (metricName: string, value: number, details?: Record<string, any>) => {
    logEvent(analytics, 'business_metric', {
      metric_name: metricName,
      value,
      timestamp: Date.now(),
      ...details
    });
  },

  // Track conversion events
  trackConversion: (conversionType: string, value?: number, details?: Record<string, any>) => {
    logEvent(analytics, 'conversion', {
      conversion_type: conversionType,
      value,
      timestamp: Date.now(),
      ...details
    });
  }
};

// Uptime monitoring
export const uptimeMonitoring = {
  // Send heartbeat to Firestore
  sendHeartbeat: async () => {
    try {
      await addDoc(collection(db, 'uptime_heartbeats'), {
        timestamp: serverTimestamp(),
        status: 'healthy',
        environment: process.env.NODE_ENV || 'production'
      });
    } catch (error) {
      console.error('Failed to send heartbeat:', error);
    }
  },

  // Track system health
  trackSystemHealth: async (healthData: Record<string, any>) => {
    try {
      await addDoc(collection(db, 'system_health'), {
        ...healthData,
        timestamp: serverTimestamp(),
        environment: process.env.NODE_ENV || 'production'
      });
      
      // Check health thresholds and send alerts if needed
      await alerting.checkSystemHealthThresholds(healthData);
    } catch (error) {
      console.error('Failed to track system health:', error);
    }
  }
};

// Initialize monitoring
export const initializeMonitoring = () => {
  // Initialize error tracking
  errorMonitoring.trackUnhandledErrors();
  
  // Track initial page load
  if (typeof window !== 'undefined') {
    performanceMonitoring.trackPageLoad('initial');
    analyticsMonitoring.trackPageView('home', 'Receipt Shield');
  }
  
  // Send initial heartbeat
  uptimeMonitoring.sendHeartbeat();
  
  // Set up periodic heartbeat (every 5 minutes)
  if (typeof window !== 'undefined') {
    setInterval(() => {
      uptimeMonitoring.sendHeartbeat();
    }, 5 * 60 * 1000);
  }
};

export default {
  performanceMonitoring,
  errorMonitoring,
  analyticsMonitoring,
  uptimeMonitoring,
  initializeMonitoring
};