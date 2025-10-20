'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  TrendingUp,
  Server,
  Database,
  Globe
} from 'lucide-react';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeUsers: number;
  lastUpdate: string;
}

interface ErrorLog {
  id: string;
  message: string;
  severity: 'error' | 'warning';
  timestamp: string;
  context?: Record<string, any>;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

export default function MonitoringDashboard() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [recentErrors, setRecentErrors] = useState<ErrorLog[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSystemHealth();
    fetchRecentErrors();
    fetchPerformanceMetrics();
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchSystemHealth();
      fetchRecentErrors();
      fetchPerformanceMetrics();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchSystemHealth = async () => {
    try {
      // Fetch from monitoring API
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
    }
  };

  const fetchRecentErrors = async () => {
    try {
      // Fetch from error monitoring API
      const response = await fetch('/api/monitoring/errors?limit=10');
      const data = await response.json();
      
      setRecentErrors(data.errors.map((error: any) => ({
        id: error.id,
        message: error.message,
        severity: error.severity,
        timestamp: error.timestamp?.toDate?.()?.toISOString() || error.timestamp,
        context: error.context
      })));
    } catch (error) {
      console.error('Failed to fetch recent errors:', error);
      setRecentErrors([]);
    }
  };

  const fetchPerformanceMetrics = async () => {
    try {
      // Fetch from performance monitoring API
      const response = await fetch('/api/monitoring/performance');
      const data = await response.json();
      
      // Transform performance data into metrics format
      const metrics = [
        { 
          name: 'Page Load Time', 
          value: Math.round((data.averages?.pageLoadTime || 1200) / 1000 * 10) / 10, 
          unit: 's', 
          trend: 'stable' as const 
        },
        { 
          name: 'API Response Time', 
          value: data.averages?.responseTime || 245, 
          unit: 'ms', 
          trend: 'stable' as const 
        },
        { 
          name: 'Error Rate', 
          value: Math.round((data.averages?.errorRate || 0.1) * 100 * 10) / 10, 
          unit: '%', 
          trend: 'stable' as const 
        },
        { 
          name: 'Total Metrics', 
          value: data.metrics?.length || 0, 
          unit: 'count', 
          trend: 'stable' as const 
        }
      ];
      
      setPerformanceMetrics(metrics);
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
      setPerformanceMetrics([]);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">System Monitoring</h1>
        <Button onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </div>

      {/* System Health Overview */}
      {systemHealth && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              {getStatusIcon(systemHealth.status)}
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(systemHealth.status)}`}></div>
                <span className="text-2xl font-bold capitalize">{systemHealth.status}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemHealth.uptime}%</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemHealth.responseTime}ms</div>
              <p className="text-xs text-muted-foreground">Average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemHealth.activeUsers}</div>
              <p className="text-xs text-muted-foreground">Currently online</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Key performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{metric.name}</span>
                  <Badge variant={metric.trend === 'up' ? 'destructive' : metric.trend === 'down' ? 'default' : 'secondary'}>
                    {metric.trend}
                  </Badge>
                </div>
                <div className="text-2xl font-bold">
                  {metric.value} {metric.unit}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Errors */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Errors</CardTitle>
          <CardDescription>Latest error logs and warnings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentErrors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                <p>No recent errors</p>
              </div>
            ) : (
              recentErrors.map((error) => (
                <Alert key={error.id} variant={error.severity === 'error' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{error.message}</span>
                      <Badge variant={error.severity === 'error' ? 'destructive' : 'secondary'}>
                        {error.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(error.timestamp).toLocaleString()}
                    </p>
                    {error.context && (
                      <details className="mt-2">
                        <summary className="text-sm cursor-pointer">Context</summary>
                        <pre className="text-xs bg-muted p-2 rounded mt-1">
                          {JSON.stringify(error.context, null, 2)}
                        </pre>
                      </details>
                    )}
                  </AlertDescription>
                </Alert>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common monitoring tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Globe className="h-4 w-4 mr-2" />
              Check Uptime
            </Button>
            <Button variant="outline" size="sm">
              <Database className="h-4 w-4 mr-2" />
              Database Status
            </Button>
            <Button variant="outline" size="sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              Performance Report
            </Button>
            <Button variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              System Logs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
