'use client';

import { useState, useEffect } from 'react';
import { Zap, Database, Cpu, HardDrive, Wifi, AlertTriangle, CheckCircle } from 'lucide-react';

interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  databaseConnections: number;
  cacheHitRate: number;
  slowQueries: number;
  recommendations: Array<{
    id: string;
    type: 'critical' | 'warning' | 'info';
    title: string;
    description: string;
    impact: string;
  }>;
}

export function PerformanceOptimization() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const fetchPerformanceMetrics = async () => {
    try {
      setIsLoading(true);
      
      // Fetch performance data
      const [performanceResponse, healthResponse] = await Promise.all([
        fetch('/api/monitoring/performance'),
        fetch('/api/monitoring/health')
      ]);

      const [performanceData, healthData] = await Promise.all([
        performanceResponse.json(),
        healthResponse.json()
      ]);

      // Generate performance metrics (in a real app, these would come from system monitoring)
      const performanceMetrics: PerformanceMetrics = {
        cpuUsage: Math.floor(Math.random() * 40) + 20, // 20-60%
        memoryUsage: Math.floor(Math.random() * 30) + 40, // 40-70%
        diskUsage: Math.floor(Math.random() * 20) + 30, // 30-50%
        networkLatency: healthData.responseTime || Math.floor(Math.random() * 50) + 50,
        databaseConnections: Math.floor(Math.random() * 20) + 5,
        cacheHitRate: Math.floor(Math.random() * 20) + 75, // 75-95%
        slowQueries: Math.floor(Math.random() * 5),
        recommendations: [
          {
            id: '1',
            type: 'warning',
            title: 'High Memory Usage',
            description: 'Memory usage is above 70%. Consider optimizing memory allocation.',
            impact: 'May cause performance degradation'
          },
          {
            id: '2',
            type: 'info',
            title: 'Database Optimization',
            description: 'Add indexes to frequently queried tables to improve performance.',
            impact: 'Could reduce query time by 30-50%'
          },
          {
            id: '3',
            type: 'critical',
            title: 'Cache Miss Rate',
            description: 'Cache hit rate is below 80%. Review caching strategy.',
            impact: 'Significant performance impact'
          }
        ]
      };

      setMetrics(performanceMetrics);
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runOptimization = async () => {
    setIsOptimizing(true);
    
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Refresh metrics after optimization
    await fetchPerformanceMetrics();
    setIsOptimizing(false);
  };

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (value <= thresholds.warning) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  useEffect(() => {
    fetchPerformanceMetrics();
    const interval = setInterval(fetchPerformanceMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8 text-gray-500">
          <Cpu className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Failed to load performance metrics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Performance Optimization
          </h2>
          <button
            onClick={runOptimization}
            disabled={isOptimizing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            {isOptimizing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Optimizing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Run Optimization
              </>
            )}
          </button>
        </div>

        {/* Performance Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900">CPU Usage</span>
              </div>
              {getStatusIcon(metrics.cpuUsage, { good: 50, warning: 70 })}
            </div>
            <div className={`text-2xl font-bold ${getStatusColor(metrics.cpuUsage, { good: 50, warning: 70 })}`}>
              {metrics.cpuUsage}%
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900">Memory Usage</span>
              </div>
              {getStatusIcon(metrics.memoryUsage, { good: 60, warning: 80 })}
            </div>
            <div className={`text-2xl font-bold ${getStatusColor(metrics.memoryUsage, { good: 60, warning: 80 })}`}>
              {metrics.memoryUsage}%
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-gray-900">Disk Usage</span>
              </div>
              {getStatusIcon(metrics.diskUsage, { good: 70, warning: 85 })}
            </div>
            <div className={`text-2xl font-bold ${getStatusColor(metrics.diskUsage, { good: 70, warning: 85 })}`}>
              {metrics.diskUsage}%
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wifi className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-gray-900">Network Latency</span>
              </div>
              {getStatusIcon(metrics.networkLatency, { good: 100, warning: 200 })}
            </div>
            <div className={`text-2xl font-bold ${getStatusColor(metrics.networkLatency, { good: 100, warning: 200 })}`}>
              {metrics.networkLatency}ms
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-indigo-600" />
                <span className="font-medium text-gray-900">DB Connections</span>
              </div>
              {getStatusIcon(metrics.databaseConnections, { good: 15, warning: 25 })}
            </div>
            <div className={`text-2xl font-bold ${getStatusColor(metrics.databaseConnections, { good: 15, warning: 25 })}`}>
              {metrics.databaseConnections}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-gray-900">Cache Hit Rate</span>
              </div>
              {getStatusIcon(100 - metrics.cacheHitRate, { good: 20, warning: 30 })}
            </div>
            <div className={`text-2xl font-bold ${getStatusColor(100 - metrics.cacheHitRate, { good: 20, warning: 30 })}`}>
              {metrics.cacheHitRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Optimization Recommendations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimization Recommendations</h3>
        <div className="space-y-4">
          {metrics.recommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className={`p-4 rounded-lg border-l-4 ${
                recommendation.type === 'critical' 
                  ? 'bg-red-50 border-red-400' 
                  : recommendation.type === 'warning'
                  ? 'bg-yellow-50 border-yellow-400'
                  : 'bg-blue-50 border-blue-400'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{recommendation.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{recommendation.description}</p>
                  <p className="text-xs text-gray-500 mt-2">Impact: {recommendation.impact}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  recommendation.type === 'critical'
                    ? 'bg-red-100 text-red-800'
                    : recommendation.type === 'warning'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {recommendation.type.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
