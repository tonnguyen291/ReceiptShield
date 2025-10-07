#!/bin/bash

# Domain Verification Script for ReceiptShield
# This script helps verify that your domain is properly configured

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

print_status "Starting domain verification for: $DOMAIN"
echo "================================================"

# Check DNS resolution
print_status "Checking DNS resolution..."
if nslookup $DOMAIN > /dev/null 2>&1; then
    print_success "DNS resolution working"
    nslookup $DOMAIN
else
    print_error "DNS resolution failed"
    exit 1
fi

echo ""

# Check if domain resolves to Firebase
print_status "Checking if domain points to Firebase..."
IP=$(dig +short $DOMAIN | head -n1)
if [ ! -z "$IP" ]; then
    print_success "Domain resolves to IP: $IP"
    
    # Check if it's a Firebase IP (Firebase uses specific IP ranges)
    if [[ $IP =~ ^151\.101\. ]] || [[ $IP =~ ^151\.102\. ]] || [[ $IP =~ ^151\.103\. ]] || [[ $IP =~ ^151\.104\. ]]; then
        print_success "IP appears to be Firebase hosting"
    else
        print_warning "IP doesn't appear to be Firebase hosting. Please verify in Firebase Console."
    fi
else
    print_error "Could not resolve domain IP"
    exit 1
fi

echo ""

# Check HTTPS availability
print_status "Checking HTTPS availability..."
if curl -s -I "https://$DOMAIN" | grep -q "HTTP/2 200\|HTTP/1.1 200"; then
    print_success "HTTPS is working"
else
    print_warning "HTTPS might not be ready yet. This can take up to 1 hour after DNS propagation."
fi

echo ""

# Check SSL certificate
print_status "Checking SSL certificate..."
if openssl s_client -connect $DOMAIN:443 -servername $DOMAIN -verify_return_error -verify_return_error < /dev/null 2>/dev/null; then
    print_success "SSL certificate is valid"
    
    # Get certificate details
    CERT_INFO=$(echo | openssl s_client -connect $DOMAIN:443 -servername $DOMAIN 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
    if [ ! -z "$CERT_INFO" ]; then
        echo "Certificate details:"
        echo "$CERT_INFO"
    fi
else
    print_warning "SSL certificate verification failed. This might be normal if the certificate is still being provisioned."
fi

echo ""

# Check if the app is loading
print_status "Checking if the app loads correctly..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN")
if [ "$HTTP_STATUS" = "200" ]; then
    print_success "App is loading successfully (HTTP 200)"
elif [ "$HTTP_STATUS" = "404" ]; then
    print_warning "App returns 404. This might be normal if the app is still deploying."
else
    print_warning "App returned HTTP $HTTP_STATUS. This might be normal during deployment."
fi

echo ""

# Check Firebase App Hosting status
print_status "Checking Firebase App Hosting status..."
if command -v firebase &> /dev/null; then
    if firebase apphosting:backends:list > /dev/null 2>&1; then
        print_success "Firebase CLI is authenticated"
        echo "Firebase App Hosting backends:"
        firebase apphosting:backends:list
    else
        print_warning "Firebase CLI not authenticated or no backends found"
    fi
else
    print_warning "Firebase CLI not installed. Install with: npm install -g firebase-tools"
fi

echo ""
echo "================================================"
print_status "Domain verification complete!"

# Summary
echo ""
echo "Summary:"
echo "- Domain: $DOMAIN"
echo "- DNS Resolution: $(nslookup $DOMAIN > /dev/null 2>&1 && echo "✓ Working" || echo "✗ Failed")"
echo "- HTTPS: $(curl -s -I "https://$DOMAIN" | grep -q "HTTP/2 200\|HTTP/1.1 200" && echo "✓ Working" || echo "⚠ May need time")"
echo "- SSL Certificate: $(openssl s_client -connect $DOMAIN:443 -servername $DOMAIN -verify_return_error -verify_return_error < /dev/null 2>/dev/null && echo "✓ Valid" || echo "⚠ May need time")"

echo ""
print_status "Next steps:"
echo "1. If DNS is not working, check your Porkbun DNS settings"
echo "2. If HTTPS/SSL is not working, wait up to 1 hour for certificate provisioning"
echo "3. Test your app functionality at https://$DOMAIN"
echo "4. Update your environment variables with the production URL"
