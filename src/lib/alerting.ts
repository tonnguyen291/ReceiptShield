import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './firebase';

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

export interface AlertThresholds {
  responseTime: number; // ms
  errorRate: number; // percentage
  memoryUsage: number; // percentage
  cpuUsage: number; // percentage
}

export const alerting = {
  // Send an alert
  sendAlert: async (alert: Omit<Alert, 'id' | 'timestamp'>) => {
    try {
      await addDoc(collection(db, 'alerts'), {
        ...alert,
        timestamp: serverTimestamp(),
        resolved: false
      });
      
      console.log(`🚨 Alert sent: ${alert.title}`);
    } catch (error) {
      console.error('Failed to send alert:', error);
    }
  },

  // Get recent alerts
  getRecentAlerts: async (limitCount: number = 10) => {
    try {
      const alertsQuery = query(
        collection(db, 'alerts'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(alertsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Failed to get recent alerts:', error);
      return [];
    }
  },

  // Check system health thresholds
  checkSystemHealthThresholds: async (healthData: Record<string, any>) => {
    const thresholds: AlertThresholds = {
      responseTime: 5000, // 5 seconds
      errorRate: 5, // 5%
      memoryUsage: 90, // 90%
      cpuUsage: 90 // 90%
    };

    // Check response time
    if (healthData.responseTime && healthData.responseTime > thresholds.responseTime) {
      await alerting.sendAlert({
        type: 'warning',
        title: 'High Response Time',
        message: `Response time is ${healthData.responseTime}ms, exceeding threshold of ${thresholds.responseTime}ms`,
        context: { responseTime: healthData.responseTime, threshold: thresholds.responseTime }
      });
    }

    // Check error rate
    if (healthData.errorRate && healthData.errorRate > thresholds.errorRate) {
      await alerting.sendAlert({
        type: 'critical',
        title: 'High Error Rate',
        message: `Error rate is ${healthData.errorRate}%, exceeding threshold of ${thresholds.errorRate}%`,
        context: { errorRate: healthData.errorRate, threshold: thresholds.errorRate }
      });
    }

    // Check memory usage
    if (healthData.memoryUsage && healthData.memoryUsage > thresholds.memoryUsage) {
      await alerting.sendAlert({
        type: 'warning',
        title: 'High Memory Usage',
        message: `Memory usage is ${healthData.memoryUsage}%, exceeding threshold of ${thresholds.memoryUsage}%`,
        context: { memoryUsage: healthData.memoryUsage, threshold: thresholds.memoryUsage }
      });
    }

    // Check CPU usage
    if (healthData.cpuUsage && healthData.cpuUsage > thresholds.cpuUsage) {
      await alerting.sendAlert({
        type: 'warning',
        title: 'High CPU Usage',
        message: `CPU usage is ${healthData.cpuUsage}%, exceeding threshold of ${thresholds.cpuUsage}%`,
        context: { cpuUsage: healthData.cpuUsage, threshold: thresholds.cpuUsage }
      });
    }
  }
};
