// Monitoring Configuration for ReceiptShield Production App

export const monitoringConfig = {
  // Performance Monitoring
  performance: {
    // Track these page load metrics
    pageLoadMetrics: [
      'page_load_home',
      'page_load_login',
      'page_load_signup',
      'page_load_dashboard',
      'page_load_receipts',
      'page_load_admin'
    ],
    
    // Track these API endpoints
    apiEndpoints: [
      '/api/auth/login',
      '/api/auth/signup',
      '/api/receipts/upload',
      '/api/receipts/process',
      '/api/receipts/list',
      '/api/admin/users',
      '/api/admin/invite'
    ],
    
    // Performance thresholds (in milliseconds)
    thresholds: {
      pageLoad: 3000,      // 3 seconds
      apiResponse: 2000,   // 2 seconds
      databaseQuery: 1000, // 1 second
      fileUpload: 10000    // 10 seconds
    }
  },

  // Error Monitoring
  errorMonitoring: {
    // Track these error types
    errorTypes: [
      'authentication_error',
      'authorization_error',
      'validation_error',
      'database_error',
      'api_error',
      'file_upload_error',
      'receipt_processing_error',
      'email_sending_error'
    ],
    
    // Error severity levels
    severityLevels: {
      critical: ['database_error', 'authentication_error'],
      high: ['api_error', 'receipt_processing_error'],
      medium: ['validation_error', 'file_upload_error'],
      low: ['email_sending_error']
    },
    
    // Alert thresholds
    alertThresholds: {
      criticalErrors: 5,    // Alert after 5 critical errors
      errorRate: 0.05,      // Alert if error rate > 5%
      consecutiveErrors: 3   // Alert after 3 consecutive errors
    }
  },

  // Analytics Tracking
  analytics: {
    // Track these user actions
    userActions: [
      'user_login',
      'user_signup',
      'receipt_upload',
      'receipt_process',
      'receipt_download',
      'admin_invite_user',
      'admin_manage_users',
      'user_logout'
    ],
    
    // Track these business metrics
    businessMetrics: [
      'receipts_processed',
      'users_registered',
      'admin_invites_sent',
      'receipts_uploaded',
      'api_calls_made'
    ],
    
    // Track these conversion events
    conversions: [
      'user_registration',
      'first_receipt_upload',
      'admin_invitation_sent',
      'receipt_processing_complete'
    ]
  },

  // Uptime Monitoring
  uptime: {
    // Heartbeat intervals (in milliseconds)
    heartbeatInterval: 5 * 60 * 1000,  // 5 minutes
    
    // Health check endpoints
    healthChecks: [
      '/api/health',
      '/api/auth/status',
      '/api/receipts/status',
      '/api/admin/status'
    ],
    
    // Uptime thresholds
    uptimeThresholds: {
      warning: 99.0,    // Alert if uptime < 99%
      critical: 95.0    // Alert if uptime < 95%
    }
  },

  // System Health Monitoring
  systemHealth: {
    // Track these system metrics
    systemMetrics: [
      'memory_usage',
      'cpu_usage',
      'disk_usage',
      'database_connections',
      'api_response_time',
      'error_rate'
    ],
    
    // Health check intervals
    healthCheckInterval: 30 * 1000,  // 30 seconds
    
    // System thresholds
    systemThresholds: {
      memoryUsage: 80,      // Alert if memory usage > 80%
      cpuUsage: 90,         // Alert if CPU usage > 90%
      diskUsage: 85,        // Alert if disk usage > 85%
      responseTime: 5000,   // Alert if response time > 5 seconds
      errorRate: 0.05       // Alert if error rate > 5%
    }
  },

  // Alerting Configuration
  alerting: {
    // Alert channels
    channels: [
      'email',
      'slack',
      'webhook'
    ],
    
    // Alert recipients
    recipients: {
      critical: ['admin@compensationengine.com'],
      warning: ['admin@compensationengine.com', 'dev@compensationengine.com'],
      info: ['admin@compensationengine.com']
    },
    
    // Alert cooldown periods (in milliseconds)
    cooldownPeriods: {
      critical: 15 * 60 * 1000,  // 15 minutes
      warning: 30 * 60 * 1000,   // 30 minutes
      info: 60 * 60 * 1000       // 1 hour
    }
  },

  // Dashboard Configuration
  dashboard: {
    // Refresh intervals (in milliseconds)
    refreshIntervals: {
      realTime: 5 * 1000,      // 5 seconds
      nearRealTime: 30 * 1000, // 30 seconds
      standard: 5 * 60 * 1000  // 5 minutes
    },
    
    // Dashboard widgets
    widgets: [
      'system_status',
      'performance_metrics',
      'error_logs',
      'user_activity',
      'api_health',
      'database_status'
    ],
    
    // Data retention periods
    dataRetention: {
      realTime: 24 * 60 * 60 * 1000,      // 24 hours
      metrics: 7 * 24 * 60 * 60 * 1000,    // 7 days
      logs: 30 * 24 * 60 * 60 * 1000,     // 30 days
      analytics: 90 * 24 * 60 * 60 * 1000  // 90 days
    }
  }
};

// Monitoring initialization function
export const initializeMonitoring = () => {
  // Initialize performance monitoring
  if (typeof window !== 'undefined') {
    // Track initial page load
    const pageName = window.location.pathname.split('/').pop() || 'home';
    // This would be called from your monitoring.ts file
    
    // Set up error tracking
    window.addEventListener('error', (event) => {
      console.error('Unhandled error:', event.error);
      // This would be handled by your error monitoring system
    });
    
    // Set up unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      // This would be handled by your error monitoring system
    });
  }
};

export default monitoringConfig;
