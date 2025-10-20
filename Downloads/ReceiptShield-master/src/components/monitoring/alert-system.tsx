'use client';

import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, XCircle, Settings } from 'lucide-react';

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

interface AlertConfig {
  uptimeThreshold: number;
  responseTimeThreshold: number;
  errorRateThreshold: number;
  activeUsersThreshold: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export function AlertSystem() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [config, setConfig] = useState<AlertConfig>({
    uptimeThreshold: 95,
    responseTimeThreshold: 1000,
    errorRateThreshold: 5,
    activeUsersThreshold: 0,
    emailNotifications: true,
    smsNotifications: false
  });
  const [showConfig, setShowConfig] = useState(false);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'success': return 'bg-green-50 border-green-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const clearAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const checkAlerts = async () => {
    try {
      const [healthResponse, analyticsResponse, performanceResponse] = await Promise.all([
        fetch('/api/monitoring/health', {
          headers: {
            'Authorization': 'Bearer monitoring-token',
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/monitoring/analytics?timeRange=5m', {
          headers: {
            'Authorization': 'Bearer monitoring-token',
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/monitoring/performance', {
          headers: {
            'Authorization': 'Bearer monitoring-token',
            'Content-Type': 'application/json'
          }
        })
      ]);

      const [healthData, analyticsData, performanceData] = await Promise.all([
        healthResponse.json(),
        analyticsResponse.json(),
        performanceResponse.json()
      ]);

      const newAlerts: Alert[] = [];

      // Check uptime threshold
      if (healthData.uptime < config.uptimeThreshold) {
        newAlerts.push({
          id: `uptime-${Date.now()}`,
          type: 'error',
          title: 'Low Uptime Alert',
          message: `System uptime is ${healthData.uptime}%, below threshold of ${config.uptimeThreshold}%`,
          timestamp: new Date().toISOString(),
          acknowledged: false
        });
      }

      // Check response time threshold
      if (healthData.responseTime > config.responseTimeThreshold) {
        newAlerts.push({
          id: `response-${Date.now()}`,
          type: 'warning',
          title: 'High Response Time',
          message: `Response time is ${healthData.responseTime}ms, above threshold of ${config.responseTimeThreshold}ms`,
          timestamp: new Date().toISOString(),
          acknowledged: false
        });
      }

      // Check error rate threshold
      if (performanceData.averages?.errorRate > config.errorRateThreshold) {
        newAlerts.push({
          id: `error-rate-${Date.now()}`,
          type: 'error',
          title: 'High Error Rate',
          message: `Error rate is ${performanceData.averages.errorRate}%, above threshold of ${config.errorRateThreshold}%`,
          timestamp: new Date().toISOString(),
          acknowledged: false
        });
      }

      // Check active users threshold
      if (analyticsData.statistics?.uniqueUsers > config.activeUsersThreshold) {
        newAlerts.push({
          id: `users-${Date.now()}`,
          type: 'info',
          title: 'High User Activity',
          message: `${analyticsData.statistics.uniqueUsers} active users detected`,
          timestamp: new Date().toISOString(),
          acknowledged: false
        });
      }

      // Add new alerts (avoid duplicates)
      setAlerts(prev => {
        const existingIds = prev.map(alert => alert.id.split('-')[0]);
        const newUniqueAlerts = newAlerts.filter(alert => 
          !existingIds.includes(alert.id.split('-')[0])
        );
        return [...prev, ...newUniqueAlerts];
      });

    } catch (error) {
      console.error('Failed to check alerts:', error);
    }
  };

  useEffect(() => {
    checkAlerts();
    const interval = setInterval(checkAlerts, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [config]);

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-600" />
          Alert System
          {unacknowledgedAlerts.length > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {unacknowledgedAlerts.length}
            </span>
          )}
        </h2>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <Settings className="h-4 w-4" />
          Configure
        </button>
      </div>

      {/* Alert Configuration */}
      {showConfig && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4">Alert Thresholds</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Uptime Threshold (%)
              </label>
              <input
                type="number"
                value={config.uptimeThreshold}
                onChange={(e) => setConfig(prev => ({ ...prev, uptimeThreshold: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Response Time Threshold (ms)
              </label>
              <input
                type="number"
                value={config.responseTimeThreshold}
                onChange={(e) => setConfig(prev => ({ ...prev, responseTimeThreshold: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Error Rate Threshold (%)
              </label>
              <input
                type="number"
                value={config.errorRateThreshold}
                onChange={(e) => setConfig(prev => ({ ...prev, errorRateThreshold: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Active Users Threshold
              </label>
              <input
                type="number"
                value={config.activeUsersThreshold}
                onChange={(e) => setConfig(prev => ({ ...prev, activeUsersThreshold: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No alerts at this time</p>
          </div>
        ) : (
          alerts.slice(0, 10).map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${getAlertColor(alert.type)} ${
                alert.acknowledged ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.type)}
                  <div>
                    <h4 className="font-medium text-gray-900">{alert.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!alert.acknowledged && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                    >
                      Acknowledge
                    </button>
                  )}
                  <button
                    onClick={() => clearAlert(alert.id)}
                    className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
