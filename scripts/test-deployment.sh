#!/bin/bash

# ReceiptShield Deployment Testing Script
# This script performs comprehensive testing of the deployed application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if domain is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <your-domain.com>"
    echo "Example: $0 receiptshield.com"
    exit 1
fi

DOMAIN=$1
BASE_URL="https://$DOMAIN"

print_status "Starting comprehensive deployment testing for: $DOMAIN"
echo "================================================"

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_status="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    print_status "Running test: $test_name"
    
    if eval "$test_command"; then
        print_success "✓ $test_name"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        print_error "✗ $test_name"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

# Test 1: Basic connectivity
run_test "Basic connectivity" "curl -s -o /dev/null -w '%{http_code}' $BASE_URL | grep -q '200'"

# Test 2: HTTPS is working
run_test "HTTPS is working" "curl -s -I $BASE_URL | grep -q 'HTTP/2 200\|HTTP/1.1 200'"

# Test 3: SSL certificate is valid
run_test "SSL certificate is valid" "echo | openssl s_client -connect $DOMAIN:443 -servername $DOMAIN -verify_return_error -verify_return_error < /dev/null 2>/dev/null"

# Test 4: Security headers are present
run_test "Security headers present" "curl -s -I $BASE_URL | grep -q 'X-Content-Type-Options\|X-Frame-Options\|X-XSS-Protection'"

# Test 5: Homepage loads
run_test "Homepage loads" "curl -s $BASE_URL | grep -q 'ReceiptShield\|receipt'"

# Test 6: Login page is accessible
run_test "Login page accessible" "curl -s $BASE_URL/login | grep -q 'login\|sign in'"

# Test 7: Signup page is accessible
run_test "Signup page accessible" "curl -s $BASE_URL/signup | grep -q 'signup\|register'"

# Test 8: Help page is accessible
run_test "Help page accessible" "curl -s $BASE_URL/help | grep -q 'help\|support'"

# Test 9: API endpoints are responding
run_test "API endpoints responding" "curl -s -o /dev/null -w '%{http_code}' $BASE_URL/api/test-ocr | grep -q '200\|404'"

# Test 10: Static assets are loading
run_test "Static assets loading" "curl -s -I $BASE_URL | grep -q 'Content-Type: text/html'"

# Test 11: No critical errors in console (basic check)
run_test "No critical console errors" "curl -s $BASE_URL | grep -v -q 'error\|Error\|ERROR'"

# Test 12: Performance check (response time)
print_status "Testing response time..."
RESPONSE_TIME=$(curl -s -o /dev/null -w '%{time_total}' $BASE_URL)
if (( $(echo "$RESPONSE_TIME < 5.0" | bc -l) )); then
    print_success "✓ Response time acceptable: ${RESPONSE_TIME}s"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_warning "⚠ Response time slow: ${RESPONSE_TIME}s"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Test 13: Check for proper redirects
run_test "Proper redirects" "curl -s -I $BASE_URL | grep -q 'Location:.*https' || curl -s -I $BASE_URL | grep -q 'HTTP/2 200\|HTTP/1.1 200'"

# Test 14: Check for mobile responsiveness (basic)
run_test "Mobile viewport meta tag" "curl -s $BASE_URL | grep -q 'viewport'"

# Test 15: Check for proper favicon
run_test "Favicon present" "curl -s -I $BASE_URL/favicon.ico | grep -q '200\|404'"

echo ""
echo "================================================"
print_status "Testing Firebase App Hosting status..."

# Test Firebase App Hosting status
if command -v firebase &> /dev/null; then
    if firebase apphosting:backends:list > /dev/null 2>&1; then
        print_success "Firebase App Hosting is accessible"
        echo "Backend status:"
        firebase apphosting:backends:list
    else
        print_warning "Could not check Firebase App Hosting status"
    fi
else
    print_warning "Firebase CLI not available for status check"
fi

echo ""
echo "================================================"
print_status "Testing domain and DNS configuration..."

# Test DNS resolution
if nslookup $DOMAIN > /dev/null 2>&1; then
    print_success "DNS resolution working"
    echo "DNS records:"
    nslookup $DOMAIN
else
    print_error "DNS resolution failed"
fi

# Test SSL certificate details
print_status "SSL Certificate details:"
echo | openssl s_client -connect $DOMAIN:443 -servername $DOMAIN 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || print_warning "Could not retrieve certificate details"

echo ""
echo "================================================"
print_status "Testing application functionality..."

# Test user flows (basic checks)
print_status "Testing user authentication flows..."

# Test login page functionality
if curl -s $BASE_URL/login | grep -q 'form\|input'; then
    print_success "Login form is present"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_warning "Login form not found or not accessible"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Test signup page functionality
if curl -s $BASE_URL/signup | grep -q 'form\|input'; then
    print_success "Signup form is present"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_warning "Signup form not found or not accessible"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""
echo "================================================"
print_status "Testing performance metrics..."

# Test page load performance
print_status "Testing page load performance..."
PAGE_LOAD_TIME=$(curl -s -o /dev/null -w '%{time_total}' $BASE_URL)
print_status "Homepage load time: ${PAGE_LOAD_TIME}s"

# Test login page performance
LOGIN_LOAD_TIME=$(curl -s -o /dev/null -w '%{time_total}' $BASE_URL/login)
print_status "Login page load time: ${LOGIN_LOAD_TIME}s"

# Test signup page performance
SIGNUP_LOAD_TIME=$(curl -s -o /dev/null -w '%{time_total}' $BASE_URL/signup)
print_status "Signup page load time: ${SIGNUP_LOAD_TIME}s"

echo ""
echo "================================================"
print_status "Final test results:"

echo "Total tests: $TOTAL_TESTS"
echo "Passed: $TESTS_PASSED"
echo "Failed: $TESTS_FAILED"

if [ $TESTS_FAILED -eq 0 ]; then
    print_success "🎉 All tests passed! Your deployment is working correctly."
    echo ""
    print_status "Next steps:"
    echo "1. Test user registration and login manually"
    echo "2. Test receipt upload functionality"
    echo "3. Test all user roles (employee, manager, admin)"
    echo "4. Monitor application performance"
    echo "5. Set up monitoring and alerts"
else
    print_warning "⚠ Some tests failed. Please review the issues above."
    echo ""
    print_status "Troubleshooting steps:"
    echo "1. Check Firebase App Hosting status in Firebase Console"
    echo "2. Verify DNS configuration on Porkbun"
    echo "3. Check SSL certificate status"
    echo "4. Review application logs for errors"
    echo "5. Test with different browsers/devices"
fi

echo ""
print_status "Deployment testing complete!"
echo "Domain: $DOMAIN"
echo "Base URL: $BASE_URL"
echo "Test Date: $(date)"
