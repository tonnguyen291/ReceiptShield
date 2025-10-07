'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, Clock, AlertTriangle } from 'lucide-react';

interface ChartData {
  timestamp: string;
  activeUsers: number;
  responseTime: number;
  errorRate: number;
  uptime: number;
}

interface RealtimeChartsProps {
  refreshInterval?: number;
}

export function RealtimeCharts({ refreshInterval = 30000 }: RealtimeChartsProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChartData = async () => {
    try {
      // Fetch multiple data points for the last hour
      const [healthResponse, analyticsResponse, performanceResponse] = await Promise.all([
        fetch('/api/monitoring/health'),
        fetch('/api/monitoring/analytics?timeRange=1h'),
        fetch('/api/monitoring/performance')
      ]);

      const [healthData, analyticsData, performanceData] = await Promise.all([
        healthResponse.json(),
        analyticsResponse.json(),
        performanceResponse.json()
      ]);

      const newDataPoint: ChartData = {
        timestamp: new Date().toLocaleTimeString(),
        activeUsers: analyticsData.statistics?.uniqueUsers || 0,
        responseTime: healthData.responseTime || 0,
        errorRate: performanceData.averages?.errorRate || 0,
        uptime: healthData.uptime || 0
      };

      setChartData(prev => {
        const updated = [...prev, newDataPoint];
        // Keep only last 20 data points for performance
        return updated.slice(-20);
      });
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
    const interval = setInterval(fetchChartData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Users Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Active Users (Last Hour)
          </h3>
          <div className="text-sm text-gray-500">
            Updates every 30s
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey="activeUsers" 
              stroke="#3B82F6" 
              fill="#3B82F6" 
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              Response Time
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="responseTime" 
                stroke="#10B981" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Error Rate Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Error Rate
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="errorRate" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Uptime Trend */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            System Uptime Trend
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis domain={[95, 100]} />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="uptime" 
              stroke="#8B5CF6" 
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
