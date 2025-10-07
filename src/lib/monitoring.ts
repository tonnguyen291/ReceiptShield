import { getAnalytics, logEvent } from 'firebase/analytics';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, analytics } from './firebase';
import { alerting } from './alerting';

export const monitoring = {
  // Initialize monitoring
  initialize: () => {
    if (typeof window !== 'undefined') {
      try {
        // Initialize Firebase Analytics
        const analytics = getAnalytics(app);
        
        console.log('📊 Monitoring initialized successfully');
        return { analytics };
      } catch (error) {
        console.error('Failed to initialize monitoring:', error);
        return null;
      }
    }
    return null;
  },

  // Track custom events
  trackEvent: async (eventName: string, parameters?: Record<string, any>) => {
    try {
      if (typeof window !== 'undefined') {
        const analytics = getAnalytics();
        logEvent(analytics, eventName, parameters);
      }
      
      // Also log to Firestore for custom analytics
      await addDoc(collection(db, 'analytics_events'), {
        eventName,
        parameters,
        timestamp: serverTimestamp(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        url: typeof window !== 'undefined' ? window.location.href : 'server'
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  },

  // Track performance metrics
  trackPerformance: async (metricName: string, value: number, unit: string = 'ms') => {
    try {
      await addDoc(collection(db, 'performance_metrics'), {
        metricName,
        value,
        unit,
        timestamp: serverTimestamp(),
        url: typeof window !== 'undefined' ? window.location.href : 'server'
      });
    } catch (error) {
      console.error('Failed to track performance metric:', error);
    }
  },

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
      
      // Send alert for critical errors
      await alerting.sendAlert({
        type: 'critical',
        title: 'Application Error',
        message: error.message,
        context: { ...context, stack: error.stack }
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
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
  },

  // Create performance trace (simplified version)
  createTrace: (traceName: string) => {
    if (typeof window !== 'undefined') {
      try {
        console.log(`[Performance] Starting trace: ${traceName}`);
        return {
          start: () => console.log(`[Performance] Trace ${traceName} started`),
          stop: () => console.log(`[Performance] Trace ${traceName} stopped`)
        };
      } catch (error) {
        console.error('Failed to create trace:', error);
        return null;
      }
    }
    return null;
  }
};

// Initialize monitoring on import
export const initializeMonitoring = () => {
  return monitoring.initialize();
};
