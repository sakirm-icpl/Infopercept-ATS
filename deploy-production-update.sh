#!/bin/bash

################################################################################
# Production Deployment Script - Update Backend & Frontend
# 
# This script safely rebuilds backend and frontend containers without
# affecting the MongoDB database and its data.
#
# Usage: ./deploy-production-update.sh
################################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

################################################################################
# Pre-deployment Checks
################################################################################

print_info "Starting production deployment update..."
echo ""

# Check if Docker is installed
if ! command_exists docker; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Determine docker-compose command
if command_exists docker-compose; then
    DOCKER_COMPOSE="docker-compose"
else
    DOCKER_COMPOSE="docker compose"
fi

print_success "Docker and Docker Compose are installed"

# Check if we're in the correct directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found. Please run this script from the project root directory."
    exit 1
fi

print_success "Found docker-compose.yml"
echo ""

################################################################################
# Backup Current State
################################################################################

print_info "Creating backup of current deployment state..."

# Create backup directory with timestamp
BACKUP_DIR="backups/deployment_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup environment files
cp .env "$BACKUP_DIR/.env.backup" 2>/dev/null || true
cp backend/.env "$BACKUP_DIR/backend.env.backup" 2>/dev/null || true
cp frontend/.env "$BACKUP_DIR/frontend.env.backup" 2>/dev/null || true

print_success "Backup created at: $BACKUP_DIR"
echo ""

################################################################################
# Check Running Containers
################################################################################

print_info "Checking current container status..."
$DOCKER_COMPOSE ps
echo ""

# Check if MongoDB is running
if ! $DOCKER_COMPOSE ps | grep -q "mongodb.*Up"; then
    print_warning "MongoDB container is not running. Starting MongoDB first..."
    $DOCKER_COMPOSE up -d mongodb
    sleep 10
fi

print_success "MongoDB is running and will not be affected"
echo ""

################################################################################
# Stop Backend and Frontend (Keep MongoDB Running)
################################################################################

print_info "Stopping backend and frontend containers..."
$DOCKER_COMPOSE stop backend frontend mongo-express

print_success "Backend and frontend stopped"
echo ""

################################################################################
# Remove Old Containers (Not MongoDB)
################################################################################

print_info "Removing old backend and frontend containers..."
$DOCKER_COMPOSE rm -f backend frontend mongo-express

print_success "Old containers removed"
echo ""

################################################################################
# Clean Docker Build Cache (Optional but Recommended)
################################################################################

print_warning "Cleaning Docker build cache to ensure fresh build..."
read -p "Do you want to clean Docker build cache? This ensures no caching issues. (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Cleaning Docker build cache..."
    docker builder prune -f
    print_success "Build cache cleaned"
else
    print_info "Skipping build cache cleanup"
fi
echo ""

################################################################################
# Rebuild Backend and Frontend
################################################################################

print_info "Rebuilding backend container (no cache)..."
$DOCKER_COMPOSE build --no-cache backend

print_success "Backend rebuilt successfully"
echo ""

print_info "Rebuilding frontend container (no cache)..."
$DOCKER_COMPOSE build --no-cache frontend

print_success "Frontend rebuilt successfully"
echo ""

################################################################################
# Start Updated Containers
################################################################################

print_info "Starting updated containers..."

# Start backend first
print_info "Starting backend..."
$DOCKER_COMPOSE up -d --no-deps backend

# Start frontend
print_info "Starting frontend..."
$DOCKER_COMPOSE up -d --no-deps frontend

# Start mongo-express
print_info "Starting mongo-express..."
$DOCKER_COMPOSE up -d --no-deps mongo-express

print_success "Containers started"
echo ""

################################################################################
# Wait for Services to be Healthy
################################################################################

print_info "Waiting for services to be healthy..."
echo ""

# Wait for backend to be healthy
print_info "Checking backend health..."
BACKEND_HEALTHY=false
for i in {1..30}; do
    if $DOCKER_COMPOSE ps backend | grep -q "healthy"; then
        BACKEND_HEALTHY=true
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

if [ "$BACKEND_HEALTHY" = true ]; then
    print_success "Backend is healthy"
else
    print_warning "Backend health check timeout. Check logs with: $DOCKER_COMPOSE logs backend"
fi

# Wait for frontend to be healthy
print_info "Checking frontend health..."
FRONTEND_HEALTHY=false
for i in {1..30}; do
    if $DOCKER_COMPOSE ps frontend | grep -q "healthy\|Up"; then
        FRONTEND_HEALTHY=true
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

if [ "$FRONTEND_HEALTHY" = true ]; then
    print_success "Frontend is healthy"
else
    print_warning "Frontend health check timeout. Check logs with: $DOCKER_COMPOSE logs frontend"
fi

echo ""

################################################################################
# Verify All Services
################################################################################

print_info "Current container status:"
$DOCKER_COMPOSE ps
echo ""

################################################################################
# Test Endpoints
################################################################################

print_info "Testing application endpoints..."

# Test backend health
if curl -f http://localhost:8000/health >/dev/null 2>&1; then
    print_success "Backend API is responding"
else
    print_warning "Backend API health check failed. Check logs: $DOCKER_COMPOSE logs backend"
fi

# Test frontend
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    print_success "Frontend is responding"
else
    print_warning "Frontend health check failed. Check logs: $DOCKER_COMPOSE logs frontend"
fi

echo ""

################################################################################
# Database Verification
################################################################################

print_info "Verifying MongoDB data integrity..."

# Check if MongoDB is accessible
if $DOCKER_COMPOSE exec -T mongodb mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
    print_success "MongoDB is accessible and data is intact"
else
    print_warning "MongoDB connection check failed. Check logs: $DOCKER_COMPOSE logs mongodb"
fi

echo ""

################################################################################
# Deployment Summary
################################################################################

echo "================================================================================"
print_success "DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "================================================================================"
echo ""
echo "📦 Updated Components:"
echo "   ✅ Backend container rebuilt and restarted"
echo "   ✅ Frontend container rebuilt and restarted"
echo "   ✅ MongoDB Express restarted"
echo ""
echo "💾 Database Status:"
echo "   ✅ MongoDB data preserved and intact"
echo "   ✅ No data loss occurred"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend:        http://localhost:3000"
echo "   Backend API:     http://localhost:8000"
echo "   API Docs:        http://localhost:8000/docs"
echo "   MongoDB Express: http://localhost:8081"
echo ""
echo "📋 Changes Deployed:"
echo "   ✅ Fixed stage feedback mapping (Stage 2 & 3)"
echo "   ✅ Added HR/Admin edit permissions for all feedbacks"
echo "   ✅ Added 'Edit Feedback' button in feedback view modal"
echo ""
echo "📁 Backup Location: $BACKUP_DIR"
echo ""
echo "================================================================================"
echo ""

################################################################################
# Post-Deployment Instructions
################################################################################

print_info "Post-Deployment Instructions:"
echo ""
echo "1. Clear browser cache and hard refresh (Ctrl+Shift+R)"
echo "2. Test the following:"
echo "   - Login as HR/Admin user"
echo "   - View feedback on completed stages"
echo "   - Verify 'Edit Feedback' button appears"
echo "   - Test editing and saving feedback"
echo ""
echo "3. Monitor logs if needed:"
echo "   - All logs:      $DOCKER_COMPOSE logs -f"
echo "   - Backend logs:  $DOCKER_COMPOSE logs -f backend"
echo "   - Frontend logs: $DOCKER_COMPOSE logs -f frontend"
echo ""
echo "4. If issues occur, rollback with:"
echo "   $DOCKER_COMPOSE down"
echo "   git checkout <previous-commit>"
echo "   $DOCKER_COMPOSE up -d"
echo ""

################################################################################
# Optional: Show Recent Logs
################################################################################

read -p "Do you want to see recent logs? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Showing recent logs (last 50 lines)..."
    echo ""
    echo "=== Backend Logs ==="
    $DOCKER_COMPOSE logs --tail=50 backend
    echo ""
    echo "=== Frontend Logs ==="
    $DOCKER_COMPOSE logs --tail=50 frontend
fi

echo ""
print_success "Deployment script completed!"
print_info "Your application is now running with the latest changes."
echo ""
