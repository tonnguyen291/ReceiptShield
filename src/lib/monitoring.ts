import { getAnalytics, logEvent } from 'firebase/analytics';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, app } from './firebase';
import { alerting } from './alerting';

// Helper function to sanitize data for Firestore
function sanitizeData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }
  
  if (data instanceof Date) {
    return data.toISOString();
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }
  
  if (typeof data === 'object') {
    // Check if it's a DOM element or other non-serializable object
    if (data.nodeType || data.constructor?.name === 'SVGAnimatedString' || 
        data.constructor?.name === 'HTMLCollection' || 
        data.constructor?.name === 'NodeList' ||
        typeof data === 'function') {
      return '[DOM Element]';
    }
    
    const sanitized: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        try {
          sanitized[key] = sanitizeData(data[key]);
        } catch (error) {
          // Skip properties that can't be serialized
          sanitized[key] = '[Non-serializable]';
        }
      }
    }
    return sanitized;
  }
  
  return '[Non-serializable]';
}

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
      
      // Sanitize parameters to remove DOM elements and non-serializable data
      const sanitizedParameters = parameters ? sanitizeData(parameters) : {};
      
      // Also log to Firestore for custom analytics (with network error handling)
      try {
        await addDoc(collection(db, 'analytics_events'), {
          eventName,
          parameters: sanitizedParameters,
          userId: parameters?.userId || 'anonymous',
          timestamp: serverTimestamp(),
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
          url: typeof window !== 'undefined' ? window.location.href : 'server'
        });
      } catch (firestoreError) {
        // Handle network errors gracefully
        if (firestoreError instanceof Error && firestoreError.message.includes('ERR_BLOCKED_BY_CLIENT')) {
          console.warn('Analytics tracking blocked by browser extension, continuing without Firestore logging');
        } else {
          throw firestoreError;
        }
      }
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
      // Handle network errors gracefully
      if (error instanceof Error && error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
        console.warn('Performance tracking blocked by browser extension, continuing without Firestore logging');
      } else {
        console.error('Failed to track performance metric:', error);
      }
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
