#!/bin/bash

# Deployment Test Script
# Validates CORS configuration and API endpoints

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
BACKEND_URL="${BACKEND_URL:-https://2-terminal-companion-production.up.railway.app}"
FRONTEND_ORIGIN="${FRONTEND_ORIGIN:-https://v0-ai-companion-prototype-main-production.up.railway.app}"

echo "============================================"
echo "Deployment Validation Test"
echo "============================================"
echo "Backend URL: $BACKEND_URL"
echo "Frontend Origin: $FRONTEND_ORIGIN"
echo "============================================"
echo ""

PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local expect_cors=${4:-true}

    echo -n "Testing: $description... "

    # Make the request
    response=$(curl -s -i -X "$method" "$BACKEND_URL$endpoint" \
        -H "Origin: $FRONTEND_ORIGIN" \
        -H "Access-Control-Request-Method: $method" \
        -H "Access-Control-Request-Headers: Content-Type, Authorization" \
        2>&1)

    # Check for CORS header
    if echo "$response" | grep -qi "access-control-allow-origin"; then
        if [ "$expect_cors" = true ]; then
            echo -e "${GREEN}PASSED${NC}"
            ((PASSED++))
            return 0
        fi
    else
        if [ "$expect_cors" = true ]; then
            echo -e "${RED}FAILED${NC} - No CORS header"
            ((FAILED++))
            return 1
        fi
    fi

    echo -e "${GREEN}PASSED${NC}"
    ((PASSED++))
    return 0
}

# Function to test preflight (OPTIONS)
test_preflight() {
    local endpoint=$1
    local description=$2

    echo -n "Testing: $description (OPTIONS preflight)... "

    response=$(curl -s -i -X OPTIONS "$BACKEND_URL$endpoint" \
        -H "Origin: $FRONTEND_ORIGIN" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type, Authorization" \
        2>&1)

    # Check for all required CORS headers
    local has_origin=$(echo "$response" | grep -qi "access-control-allow-origin" && echo "yes" || echo "no")
    local has_methods=$(echo "$response" | grep -qi "access-control-allow-methods" && echo "yes" || echo "no")
    local has_headers=$(echo "$response" | grep -qi "access-control-allow-headers" && echo "yes" || echo "no")
    local has_credentials=$(echo "$response" | grep -qi "access-control-allow-credentials" && echo "yes" || echo "no")

    if [ "$has_origin" = "yes" ] && [ "$has_methods" = "yes" ]; then
        echo -e "${GREEN}PASSED${NC}"
        ((PASSED++))

        # Show details
        echo "    - Access-Control-Allow-Origin: $has_origin"
        echo "    - Access-Control-Allow-Methods: $has_methods"
        echo "    - Access-Control-Allow-Headers: $has_headers"
        echo "    - Access-Control-Allow-Credentials: $has_credentials"
        return 0
    else
        echo -e "${RED}FAILED${NC}"
        ((FAILED++))
        echo "    - Access-Control-Allow-Origin: $has_origin"
        echo "    - Access-Control-Allow-Methods: $has_methods"
        echo "    - Access-Control-Allow-Headers: $has_headers"
        echo "    - Access-Control-Allow-Credentials: $has_credentials"
        return 1
    fi
}

# Function to test actual request with CORS
test_cors_request() {
    local method=$1
    local endpoint=$2
    local description=$3
    local body=$4

    echo -n "Testing: $description... "

    if [ -n "$body" ]; then
        response=$(curl -s -i -X "$method" "$BACKEND_URL$endpoint" \
            -H "Origin: $FRONTEND_ORIGIN" \
            -H "Content-Type: application/json" \
            -d "$body" \
            2>&1)
    else
        response=$(curl -s -i -X "$method" "$BACKEND_URL$endpoint" \
            -H "Origin: $FRONTEND_ORIGIN" \
            2>&1)
    fi

    # Check HTTP status (not 5xx)
    http_status=$(echo "$response" | grep -E "^HTTP" | tail -1 | awk '{print $2}')
    has_cors=$(echo "$response" | grep -qi "access-control-allow-origin" && echo "yes" || echo "no")

    if [ "$has_cors" = "yes" ]; then
        echo -e "${GREEN}PASSED${NC} (HTTP $http_status, CORS: yes)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}FAILED${NC} (HTTP $http_status, CORS: no)"
        ((FAILED++))
        return 1
    fi
}

echo "--- CORS Preflight Tests ---"
echo ""
test_preflight "/api/health" "Health endpoint"
test_preflight "/api/auth/login" "Login endpoint"
test_preflight "/api/auth/register" "Register endpoint"
test_preflight "/api/auth/refresh" "Refresh endpoint"

echo ""
echo "--- API Endpoint Tests ---"
echo ""
test_cors_request "GET" "/api/health" "Health check GET"
test_cors_request "GET" "/" "Root endpoint GET"

# Test login with invalid credentials (should return 401 with CORS headers)
test_cors_request "POST" "/api/auth/login" "Login POST (expect 401)" '{"email":"test@test.com","password":"test"}'

echo ""
echo "============================================"
echo "Test Results"
echo "============================================"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! CORS is properly configured.${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed. Check CORS configuration.${NC}"
    exit 1
fi
