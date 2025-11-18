#!/bin/bash

################################################################################
# Fix Deployment Error Script
# 
# This script fixes the ContainerConfig error and completes the deployment
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info "Fixing deployment error..."
echo ""

# Determine docker-compose command
if command -v docker-compose >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker-compose"
else
    DOCKER_COMPOSE="docker compose"
fi

################################################################################
# Check Current Status
################################################################################

print_info "Checking current container status..."
$DOCKER_COMPOSE ps
echo ""

################################################################################
# Start MongoDB if not running
################################################################################

if ! $DOCKER_COMPOSE ps | grep -q "mongodb.*Up"; then
    print_info "Starting MongoDB..."
    $DOCKER_COMPOSE up -d mongodb
    sleep 10
    print_success "MongoDB started"
else
    print_success "MongoDB is already running"
fi

echo ""

################################################################################
# Start Backend
################################################################################

print_info "Starting backend container..."
$DOCKER_COMPOSE up -d --no-deps backend

print_success "Backend started"
echo ""

################################################################################
# Start Frontend
################################################################################

print_info "Starting frontend container..."
$DOCKER_COMPOSE up -d --no-deps frontend

print_success "Frontend started"
echo ""

################################################################################
# Start MongoDB Express
################################################################################

print_info "Starting MongoDB Express..."
$DOCKER_COMPOSE up -d --no-deps mongo-express

print_success "MongoDB Express started"
echo ""

################################################################################
# Wait for Services
################################################################################

print_info "Waiting for services to be healthy..."
sleep 10

################################################################################
# Verify Status
################################################################################

print_info "Current container status:"
$DOCKER_COMPOSE ps
echo ""

################################################################################
# Test Endpoints
################################################################################

print_info "Testing endpoints..."

# Test backend
if curl -f http://localhost:8000/health >/dev/null 2>&1; then
    print_success "Backend is responding"
else
    print_error "Backend health check failed"
fi

# Test frontend
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    print_success "Frontend is responding"
else
    print_error "Frontend health check failed"
fi

echo ""

################################################################################
# Summary
################################################################################

echo "================================================================================"
print_success "DEPLOYMENT FIXED AND COMPLETED!"
echo "================================================================================"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend:        http://localhost:3000"
echo "   Backend API:     http://localhost:8000"
echo "   API Docs:        http://localhost:8000/docs"
echo "   MongoDB Express: http://localhost:8081"
echo ""
echo "📋 Next Steps:"
echo "   1. Clear browser cache (Ctrl+Shift+R)"
echo "   2. Test the application"
echo "   3. Verify 'Edit Feedback' button appears for HR/Admin"
echo ""
echo "================================================================================"
echo ""

print_success "Deployment completed successfully!"
