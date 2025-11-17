#!/bin/bash

# Production Deployment Script for Server 172.17.11.30
# Infopercept ATS System

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

echo "=========================================="
echo "  Infopercept ATS Production Deployment"
echo "  Server: 172.17.11.30"
echo "=========================================="
echo

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please do not run this script as root"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Set Docker Compose command
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    DOCKER_COMPOSE="docker compose"
fi

print_status "Using Docker Compose command: $DOCKER_COMPOSE"

# Verify environment files exist
print_status "Checking environment files..."
if [ ! -f ".env" ]; then
    print_error ".env file not found!"
    exit 1
fi

if [ ! -f "backend/.env" ]; then
    print_error "backend/.env file not found!"
    exit 1
fi

if [ ! -f "frontend/.env" ]; then
    print_error "frontend/.env file not found!"
    exit 1
fi

print_success "All environment files found"

# Verify server IP in configuration
print_status "Verifying server IP configuration..."
if grep -q "172.17.11.30" .env && grep -q "172.17.11.30" frontend/.env; then
    print_success "Server IP correctly configured"
else
    print_warning "Server IP 172.17.11.30 not found in configuration files"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs
mkdir -p backend/uploads
mkdir -p backups

# Set permissions
chmod 755 logs
chmod 755 backend/uploads
chmod 755 backups

# Stop existing containers if running
print_status "Stopping existing containers..."
$DOCKER_COMPOSE down 2>/dev/null || true

# Clean up old images (optional)
read -p "Do you want to remove old Docker images? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Cleaning up old Docker images..."
    docker system prune -f
    docker image prune -f
fi

# Build and start services
print_status "Building and starting services..."
$DOCKER_COMPOSE up -d --build

# Wait for services to be healthy
print_status "Waiting for services to be ready..."
sleep 30

# Check service status
print_status "Checking service status..."
$DOCKER_COMPOSE ps

# Test connectivity
print_status "Testing service connectivity..."

# Test backend health
for i in {1..30}; do
    if curl -f http://172.17.11.30:8000/health &>/dev/null; then
        print_success "Backend is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Backend health check failed"
        print_status "Checking backend logs..."
        $DOCKER_COMPOSE logs backend | tail -50
        exit 1
    fi
    sleep 2
done

# Test frontend
for i in {1..30}; do
    if curl -f http://172.17.11.30:3000 &>/dev/null; then
        print_success "Frontend is accessible"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Frontend accessibility check failed"
        print_status "Checking frontend logs..."
        $DOCKER_COMPOSE logs frontend | tail -50
        exit 1
    fi
    sleep 2
done

# Test MongoDB
print_status "Testing MongoDB connection..."
if $DOCKER_COMPOSE exec -T mongodb mongosh --eval "db.adminCommand('ping')" &>/dev/null; then
    print_success "MongoDB is accessible"
else
    print_warning "MongoDB connection test failed"
fi

# Display deployment information
echo
print_success "🎉 ATS System deployed successfully on 172.17.11.30!"
echo
echo "=========================================="
echo "  Deployment Information"
echo "=========================================="
echo
echo "📋 Access URLs:"
echo "   Frontend:        http://172.17.11.30:3000"
echo "   Backend API:     http://172.17.11.30:8000"
echo "   API Docs:        http://172.17.11.30:8000/docs"
echo "   MongoDB Express: http://172.17.11.30:8081"
echo
echo "🔐 Default Admin Credentials:"
echo "   Email:    admin@infopercept.com"
echo "   Password: Welcome@ATS"
echo
echo "⚠️  CRITICAL SECURITY TASKS:"
echo "   1. Change admin password immediately!"
echo "   2. Change MongoDB Express password"
echo "   3. Configure firewall rules"
echo "   4. Setup SSL certificates (recommended)"
echo "   5. Disable MongoDB Express after initial setup"
echo
echo "📊 Service Status:"
$DOCKER_COMPOSE ps
echo
echo "📝 Useful Commands:"
echo "   View logs:       $DOCKER_COMPOSE logs -f"
echo "   Stop services:   $DOCKER_COMPOSE down"
echo "   Restart:         $DOCKER_COMPOSE restart"
echo "   Backup:          ./backup.sh"
echo
echo "📖 Documentation:"
echo "   Deployment Guide: DEPLOY_172.17.11.30.md"
echo "   Quick Start:      QUICK_START.md"
echo "   Admin Info:       ADMIN_CREDENTIALS.md"
echo
print_success "Deployment completed! 🚀"
echo
print_warning "Next Steps:"
echo "1. Login at http://172.17.11.30:3000"
echo "2. Change the default admin password"
echo "3. Create additional users as needed"
echo "4. Configure firewall and security settings"
echo "5. Setup automated backups"
echo
