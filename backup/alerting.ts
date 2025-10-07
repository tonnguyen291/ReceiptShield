import { getFirestore, collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

// Initialize Firebase
const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

const db = getFirestore(app);

export interface Alert {
  id?: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  context?: Record<string, any>;
  timestamp?: Date;
  resolved?: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface AlertThreshold {
  criticalErrors: number;
  errorRate: number;
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
}

export const alerting = {
  // Send alert
  sendAlert: async (alert: Omit<Alert, 'id' | 'timestamp'>) => {
    try {
      await addDoc(collection(db, 'alerts'), {
        ...alert,
        timestamp: serverTimestamp(),
        environment: process.env.NODE_ENV || 'production'
      });
      
      // Send notification if critical
      if (alert.type === 'critical') {
        await sendCriticalAlertNotification(alert);
      }
    } catch (error) {
      console.error('Failed to send alert:', error);
    }
  },

  // Check for critical error spikes
  checkCriticalErrorSpike: async () => {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const errorQuery = query(
        collection(db, 'error_logs'),
        where('severity', '==', 'error'),
        where('timestamp', '>=', oneHourAgo),
        orderBy('timestamp', 'desc')
      );
      
      const errorSnapshot = await getDocs(errorQuery);
      const errorCount = errorSnapshot.size;
      
      if (errorCount >= 10) {
        await alerting.sendAlert({
          type: 'critical',
          title: 'Critical Error Spike Detected',
          message: `${errorCount} critical errors in the last hour`,
          context: { errorCount, timeRange: '1 hour' }
        });
      }
    } catch (error) {
      console.error('Failed to check critical error spike:', error);
    }
  },

  // Check system health thresholds
  checkSystemHealthThresholds: async (healthData: any) => {
    try {
      const thresholds = {
        responseTime: 5000,    // 5 seconds
        memoryUsage: 80,       // 80%
        errorRate: 0.05        // 5%
      };
      
      const alerts: Omit<Alert, 'id' | 'timestamp'>[] = [];
      
      // Check response time
      if (healthData.responseTime > thresholds.responseTime) {
        alerts.push({
          type: 'warning',
          title: 'High Response Time',
          message: `API response time is ${healthData.responseTime}ms (threshold: ${thresholds.responseTime}ms)`,
          context: { responseTime: healthData.responseTime, threshold: thresholds.responseTime }
        });
      }
      
      // Check memory usage
      if (healthData.memoryUsage > thresholds.memoryUsage) {
        alerts.push({
          type: 'warning',
          title: 'High Memory Usage',
          message: `Memory usage is ${healthData.memoryUsage}% (threshold: ${thresholds.memoryUsage}%)`,
          context: { memoryUsage: healthData.memoryUsage, threshold: thresholds.memoryUsage }
        });
      }
      
      // Check error rate
      if (healthData.errorRate > thresholds.errorRate) {
        alerts.push({
          type: 'critical',
          title: 'High Error Rate',
          message: `Error rate is ${(healthData.errorRate * 100).toFixed(2)}% (threshold: ${(thresholds.errorRate * 100)}%)`,
          context: { errorRate: healthData.errorRate, threshold: thresholds.errorRate }
        });
      }
      
      // Send all alerts
      for (const alert of alerts) {
        await alerting.sendAlert(alert);
      }
    } catch (error) {
      console.error('Failed to check system health thresholds:', error);
    }
  },

  // Get recent alerts
  getRecentAlerts: async (limitCount: number = 50) => {
    try {
      const alertsQuery = query(
        collection(db, 'alerts'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const alertsSnapshot = await getDocs(alertsQuery);
      return alertsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Failed to get recent alerts:', error);
      return [];
    }
  },

  // Resolve alert
  resolveAlert: async (alertId: string, resolvedBy: string) => {
    try {
      // This would typically update the alert document
      // For now, we'll just log the resolution
      console.log(`Alert ${alertId} resolved by ${resolvedBy}`);
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  }
};

// Send critical alert notification (placeholder for email/Slack integration)
async function sendCriticalAlertNotification(alert: Omit<Alert, 'id' | 'timestamp'>) {
  try {
    // This would integrate with your notification service
    // For now, we'll just log it
    console.error('CRITICAL ALERT:', alert.title, alert.message);
    
    // In a real implementation, you would:
    // 1. Send email to admin@compensationengine.com
    // 2. Send Slack notification to #alerts channel
    // 3. Send SMS to on-call engineer
    // 4. Create incident in your incident management system
  } catch (error) {
    console.error('Failed to send critical alert notification:', error);
  }
}

export default alerting;
