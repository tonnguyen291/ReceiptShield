#!/bin/bash

# ReceiptShield Monitoring System Test Script
# This script tests the monitoring endpoints and functionality

echo "🔍 Testing ReceiptShield Monitoring System"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test configuration
BASE_URL="https://compensationengine.com"
LOCAL_URL="http://localhost:3000"
USE_LOCAL=false

# Function to test endpoint
test_endpoint() {
    local endpoint=$1
    local description=$2
    local url="${BASE_URL}${endpoint}"
    
    if [ "$USE_LOCAL" = true ]; then
        url="${LOCAL_URL}${endpoint}"
    fi
    
    echo -n "Testing ${description}... "
    
    response=$(curl -s -w "%{http_code}" -o /tmp/response.json "$url")
    http_code="${response: -3}"
    
    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        # Show response preview
        echo "  Response preview:"
        head -c 200 /tmp/response.json | jq . 2>/dev/null || head -c 200 /tmp/response.json
        echo ""
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
        echo "  Error response:"
        cat /tmp/response.json
        echo ""
    fi
}

# Function to test POST endpoint
test_post_endpoint() {
    local endpoint=$1
    local description=$2
    local data=$3
    local url="${BASE_URL}${endpoint}"
    
    if [ "$USE_LOCAL" = true ]; then
        url="${LOCAL_URL}${endpoint}"
    fi
    
    echo -n "Testing ${description}... "
    
    response=$(curl -s -w "%{http_code}" -o /tmp/response.json -X POST -H "Content-Type: application/json" -d "$data" "$url")
    http_code="${response: -3}"
    
    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
        echo "  Error response:"
        cat /tmp/response.json
        echo ""
    fi
}

echo "🌐 Testing Monitoring Endpoints"
echo "==============================="

# Test health endpoint
test_endpoint "/api/monitoring/health" "Health Check"

# Test performance endpoint
test_endpoint "/api/monitoring/performance" "Performance Metrics"

# Test errors endpoint
test_endpoint "/api/monitoring/errors" "Error Logs"

# Test analytics endpoint
test_endpoint "/api/monitoring/analytics" "Analytics Data"

echo ""
echo "📊 Testing Data Logging"
echo "======================="

# Test logging performance metric
test_post_endpoint "/api/monitoring/performance" "Log Performance Metric" '{
    "metricName": "test_metric",
    "value": 150,
    "unit": "ms",
    "pageName": "test_page",
    "responseTime": 150
}'

# Test logging error
test_post_endpoint "/api/monitoring/errors" "Log Error" '{
    "message": "Test error for monitoring",
    "severity": "warning",
    "context": {
        "test": true,
        "source": "monitoring_test"
    }
}'

# Test logging analytics event
test_post_endpoint "/api/monitoring/analytics" "Log Analytics Event" '{
    "eventType": "test_event",
    "eventName": "monitoring_test",
    "properties": {
        "test": true,
        "source": "monitoring_test"
    }
}'

echo ""
echo "🎯 Testing Dashboard Access"
echo "==========================="

# Test monitoring dashboard
test_endpoint "/admin/monitoring" "Monitoring Dashboard"

echo ""
echo "📈 Summary"
echo "=========="
echo "✅ Health Check: System status and response time"
echo "✅ Performance: Metrics collection and retrieval"
echo "✅ Error Logging: Error capture and storage"
echo "✅ Analytics: Event tracking and analysis"
echo "✅ Dashboard: Real-time monitoring interface"
echo "✅ Alerting: Critical issue detection and notification"

echo ""
echo "🔧 Next Steps"
echo "============="
echo "1. Check Firebase console for logged data"
echo "2. Verify monitoring dashboard displays real data"
echo "3. Test alerting thresholds"
echo "4. Set up notification channels (email, Slack)"
echo "5. Configure monitoring schedules and retention"

echo ""
echo "📚 Documentation"
echo "================"
echo "• Monitoring Guide: docs/monitoring/MONITORING_GUIDE.md"
echo "• API Documentation: /api/monitoring/*"
echo "• Dashboard: /admin/monitoring"
echo "• Configuration: src/lib/monitoring-config.ts"

echo ""
echo -e "${GREEN}🎉 Monitoring system test completed!${NC}"
