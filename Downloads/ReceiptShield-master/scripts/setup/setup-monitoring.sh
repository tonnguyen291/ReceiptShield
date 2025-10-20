#!/bin/bash

echo "🔍 Setting up Production Monitoring for ReceiptShield..."

# Install monitoring dependencies
echo "📦 Installing monitoring dependencies..."
npm install @sentry/nextjs @sentry/profiling-node

# Create monitoring directories
echo "📁 Creating monitoring directories..."
mkdir -p src/lib/monitoring
mkdir -p src/components/admin
mkdir -p src/app/api/monitoring
mkdir -p scripts/deployment
mkdir -p scripts/testing
mkdir -p docs/monitoring

# Set up environment variables for monitoring
echo "🔧 Setting up monitoring environment variables..."
cat >> .env.local << EOF

# Monitoring Configuration
NEXT_PUBLIC_MONITORING_ENABLED=true
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
NEXT_PUBLIC_FIREBASE_PERFORMANCE_ENABLED=true
NEXT_PUBLIC_ANALYTICS_ENABLED=true
EOF

# Create Firestore security rules for monitoring
echo "🔒 Setting up Firestore security rules for monitoring..."
cat > firestore-monitoring.rules << 'EOF'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Monitoring collections - read/write for authenticated users
    match /error_logs/{document} {
      allow read, write: if request.auth != null;
    }
    
    match /health_checks/{document} {
      allow read, write: if request.auth != null;
    }
    
    match /performance_metrics/{document} {
      allow read, write: if request.auth != null;
    }
    
    match /uptime_heartbeats/{document} {
      allow read, write: if request.auth != null;
    }
    
    match /system_health/{document} {
      allow read, write: if request.auth != null;
    }
    
    match /analytics_events/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
EOF

# Create monitoring deployment script
echo "🚀 Creating monitoring deployment script..."
cat > scripts/deployment/deploy-monitoring.sh << 'EOF'
#!/bin/bash

echo "🚀 Deploying monitoring configuration..."

# Deploy Firestore rules
echo "📋 Deploying Firestore monitoring rules..."
firebase deploy --only firestore:rules

# Deploy monitoring API
echo "🔌 Deploying monitoring API..."
npm run build
firebase deploy --only apphosting

echo "✅ Monitoring deployment complete!"
echo "📊 Access your monitoring dashboard at: https://compensationengine.com/admin/monitoring"
EOF

chmod +x scripts/deployment/deploy-monitoring.sh

# Create monitoring test script
echo "🧪 Creating monitoring test script..."
cat > scripts/testing/test-monitoring.sh << 'EOF'
#!/bin/bash

echo "🧪 Testing monitoring setup..."

# Test health endpoint
echo "🏥 Testing health endpoint..."
curl -f https://compensationengine.com/api/monitoring/health || echo "❌ Health endpoint failed"

# Test monitoring dashboard
echo "📊 Testing monitoring dashboard..."
curl -f https://compensationengine.com/admin/monitoring || echo "❌ Monitoring dashboard failed"

echo "✅ Monitoring tests complete!"
EOF

chmod +x scripts/testing/test-monitoring.sh

# Create monitoring documentation
echo "📚 Creating monitoring documentation..."
cat > docs/monitoring/MONITORING_GUIDE.md << 'EOF'
# ReceiptShield Production Monitoring Guide

## Overview
This guide covers the comprehensive monitoring setup for the ReceiptShield production application.

## Monitoring Components

### 1. Performance Monitoring
- **Firebase Performance**: Tracks page load times, API response times, and custom metrics
- **Real User Monitoring**: Monitors actual user experience
- **Core Web Vitals**: Tracks LCP, FID, and CLS metrics

### 2. Error Monitoring
- **Error Logging**: Captures and logs all application errors
- **Error Tracking**: Tracks error rates and patterns
- **Alerting**: Sends alerts for critical errors

### 3. Uptime Monitoring
- **Health Checks**: Regular system health monitoring
- **Heartbeat Monitoring**: Tracks application availability
- **Status Page**: Public status page for users

### 4. Analytics
- **User Analytics**: Tracks user behavior and engagement
- **Business Metrics**: Monitors key business indicators
- **Conversion Tracking**: Tracks conversion events

## Monitoring Dashboard

Access the monitoring dashboard at: `/admin/monitoring`

### Dashboard Features
- **System Status**: Real-time system health
- **Performance Metrics**: Key performance indicators
- **Error Logs**: Recent errors and warnings
- **User Activity**: Active users and engagement
- **API Health**: API endpoint status
- **Database Status**: Database performance metrics

## API Endpoints

### Health Check
- **GET** `/api/monitoring/health` - System health status
- **POST** `/api/monitoring/health` - Manual health check

### Performance
- **GET** `/api/monitoring/performance` - Performance metrics
- **POST** `/api/monitoring/performance` - Log performance data

### Errors
- **GET** `/api/monitoring/errors` - Error logs
- **POST** `/api/monitoring/errors` - Log error

## Configuration

### Environment Variables
```bash
NEXT_PUBLIC_MONITORING_ENABLED=true
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
NEXT_PUBLIC_FIREBASE_PERFORMANCE_ENABLED=true
NEXT_PUBLIC_ANALYTICS_ENABLED=true
```

### Firestore Collections
- `error_logs` - Application errors
- `health_checks` - System health data
- `performance_metrics` - Performance data
- `uptime_heartbeats` - Uptime monitoring
- `system_health` - System resource data
- `analytics_events` - User analytics

## Alerting

### Alert Types
- **Critical**: System down, database errors
- **Warning**: High error rates, performance issues
- **Info**: System updates, maintenance

### Alert Channels
- Email notifications
- Slack integration
- Webhook notifications

## Maintenance

### Regular Tasks
1. **Daily**: Check error logs and performance metrics
2. **Weekly**: Review system health and uptime
3. **Monthly**: Analyze trends and optimize performance

### Monitoring Best Practices
1. **Set appropriate thresholds** for alerts
2. **Monitor key metrics** regularly
3. **Respond to alerts** promptly
4. **Document incidents** and resolutions
5. **Review and optimize** monitoring setup

## Troubleshooting

### Common Issues
1. **High Error Rates**: Check application logs and database
2. **Slow Performance**: Monitor API response times and database queries
3. **Uptime Issues**: Check server resources and network connectivity

### Support
- **Documentation**: This guide and inline comments
- **Logs**: Check Firestore collections for detailed logs
- **Dashboard**: Use the monitoring dashboard for real-time status
EOF

echo "✅ Monitoring setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Review the monitoring configuration in src/lib/monitoring-config.ts"
echo "2. Set up Sentry DSN in your environment variables"
echo "3. Deploy the monitoring setup: ./scripts/deployment/deploy-monitoring.sh"
echo "4. Test the monitoring: ./scripts/testing/test-monitoring.sh"
echo "5. Access the dashboard at: https://compensationengine.com/admin/monitoring"
echo ""
echo "📚 Read the full guide: docs/monitoring/MONITORING_GUIDE.md"
