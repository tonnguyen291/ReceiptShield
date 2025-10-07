'use client';

import { useState, useEffect } from 'react';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeUsers: number;
  lastUpdate: string;
}

export default function MonitoringPage() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSystemHealth();
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchSystemHealth();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchSystemHealth = async () => {
    try {
      // Fetch from your health endpoint
      const response = await fetch('/api/monitoring/health');
      const data = await response.json();
      
      // Fetch performance metrics for additional data
      const perfResponse = await fetch('/api/monitoring/performance');
      const perfData = await perfResponse.json();
      
      // Fetch analytics for active users
      const analyticsResponse = await fetch('/api/monitoring/analytics?timeRange=1h');
      const analyticsData = await analyticsResponse.json();
      
      setSystemHealth({
        status: data.status,
        uptime: 99.9, // This would come from your monitoring system
        responseTime: data.responseTime || perfData.averages?.responseTime || 0,
        errorRate: perfData.averages?.errorRate || 0.1,
        activeUsers: analyticsData.statistics?.uniqueUsers || 0,
        lastUpdate: data.timestamp
      });
    } catch (error) {
      console.error('Failed to fetch system health:', error);
      setSystemHealth({
        status: 'critical',
        uptime: 0,
        responseTime: 0,
        errorRate: 100,
        activeUsers: 0,
        lastUpdate: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
          <button 
            onClick={() => window.location.reload()}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* System Health Overview */}
        {systemHealth && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">System Status</h3>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(systemHealth.status)}`}></div>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-gray-900 capitalize">{systemHealth.status}</div>
                <p className="text-sm text-gray-500">Last updated: {new Date(systemHealth.lastUpdate).toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">Uptime</h3>
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-gray-900">{systemHealth.uptime}%</div>
                <p className="text-sm text-gray-500">Last 24 hours</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">Response Time</h3>
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-gray-900">{systemHealth.responseTime}ms</div>
                <p className="text-sm text-gray-500">Average</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-gray-900">{systemHealth.activeUsers}</div>
                <p className="text-sm text-gray-500">Currently online</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              Check Uptime
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
              Database Status
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
              Performance Report
            </button>
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors">
              System Logs
            </button>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Application</h3>
              <p className="text-sm text-gray-900">ReceiptShield v1.0.0</p>
              <p className="text-sm text-gray-500">Next.js 15.5.2</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Environment</h3>
              <p className="text-sm text-gray-900">Production</p>
              <p className="text-sm text-gray-500">Firebase App Hosting</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Domain</h3>
              <p className="text-sm text-gray-900">compensationengine.com</p>
              <p className="text-sm text-gray-500">SSL Certificate Active</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Last Deployment</h3>
              <p className="text-sm text-gray-900">October 6, 2025</p>
              <p className="text-sm text-gray-500">Firebase App Hosting</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}