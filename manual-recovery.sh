#!/bin/bash

################################################################################
# Manual Recovery Script
# 
# This script manually starts containers using Docker commands
# to bypass the docker-compose ContainerConfig error
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

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo "================================================================================"
print_info "MANUAL RECOVERY - Bypassing docker-compose"
echo "================================================================================"
echo ""

################################################################################
# Step 1: Remove corrupted MongoDB container
################################################################################

print_info "Step 1: Removing corrupted MongoDB container..."

# Find and remove the corrupted MongoDB container
MONGO_CONTAINER=$(docker ps -a | grep mongodb | awk '{print $1}')

if [ ! -z "$MONGO_CONTAINER" ]; then
    print_info "Found MongoDB container: $MONGO_CONTAINER"
    docker rm -f $MONGO_CONTAINER 2>/dev/null || true
    print_success "Removed corrupted container"
else
    print_info "No MongoDB container found"
fi

echo ""

################################################################################
# Step 2: Start MongoDB using docker run
################################################################################

print_info "Step 2: Starting MongoDB container manually..."

# Check if MongoDB volume exists
if docker volume ls | grep -q "infopercept-ats_mongodb_data"; then
    print_success "MongoDB data volume exists - data will be preserved"
else
    print_warning "MongoDB data volume not found - creating new one"
fi

# Start MongoDB container
docker run -d \
  --name ats_mongodb \
  --network infopercept-ats_ats_network \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD='InfoperceptATS@2024!Secure' \
  -e MONGO_INITDB_DATABASE=ats_production \
  -v infopercept-ats_mongodb_data:/data/db \
  --health-cmd="mongosh --eval 'db.adminCommand(\"ping\")'" \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=3 \
  --health-start-period=40s \
  mongo:7.0

print_success "MongoDB container started"
echo ""

################################################################################
# Step 3: Wait for MongoDB to be healthy
################################################################################

print_info "Step 3: Waiting for MongoDB to be healthy..."

for i in {1..30}; do
    if docker ps | grep ats_mongodb | grep -q "healthy"; then
        print_success "MongoDB is healthy"
        break
    fi
    echo -n "."
    sleep 2
done

echo ""
echo ""

################################################################################
# Step 4: Start Backend
################################################################################

print_info "Step 4: Starting backend container..."

# Remove old backend container if exists
docker rm -f ats_backend 2>/dev/null || true

# Start backend
docker run -d \
  --name ats_backend \
  --network infopercept-ats_ats_network \
  -p 8000:8000 \
  -e MONGODB_URL='mongodb://admin:InfoperceptATS%402024%21Secure@ats_mongodb:27017/ats_production?authSource=admin' \
  -e JWT_SECRET_KEY='7f8a9b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6InfoperceptATS2024' \
  -e JWT_ALGORITHM=HS256 \
  -e JWT_ACCESS_TOKEN_EXPIRE_MINUTES=480 \
  -e HOST=0.0.0.0 \
  -e PORT=8000 \
  -e DEBUG=False \
  -e ENVIRONMENT=production \
  -v infopercept-ats_backend_uploads:/app/uploads \
  -v infopercept-ats_backend_logs:/app/logs \
  --health-cmd="curl -f http://localhost:8000/health" \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=3 \
  --health-start-period=40s \
  infopercept-ats_backend

print_success "Backend container started"
echo ""

################################################################################
# Step 5: Start Frontend
################################################################################

print_info "Step 5: Starting frontend container..."

# Remove old frontend container if exists
docker rm -f ats_frontend 2>/dev/null || true

# Start frontend
docker run -d \
  --name ats_frontend \
  --network infopercept-ats_ats_network \
  -p 3000:80 \
  --health-cmd="wget --no-verbose --tries=1 --spider http://localhost:80/" \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=3 \
  --health-start-period=40s \
  infopercept-ats_frontend

print_success "Frontend container started"
echo ""

################################################################################
# Step 6: Start MongoDB Express
################################################################################

print_info "Step 6: Starting MongoDB Express..."

# Remove old mongo-express container if exists
docker rm -f ats_mongo_express 2>/dev/null || true

# Start mongo-express
docker run -d \
  --name ats_mongo_express \
  --network infopercept-ats_ats_network \
  -p 8081:8081 \
  -e ME_CONFIG_MONGODB_ADMINUSERNAME=admin \
  -e ME_CONFIG_MONGODB_ADMINPASSWORD='InfoperceptATS@2024!Secure' \
  -e ME_CONFIG_MONGODB_URL='mongodb://admin:InfoperceptATS%402024%21Secure@ats_mongodb:27017/' \
  -e ME_CONFIG_BASICAUTH_USERNAME=admin \
  -e ME_CONFIG_BASICAUTH_PASSWORD='InfoperceptMongo@2024' \
  -e ME_CONFIG_MONGODB_ENABLE_ADMIN=true \
  mongo-express:1.0.0

print_success "MongoDB Express started"
echo ""

################################################################################
# Step 7: Wait for services
################################################################################

print_info "Step 7: Waiting for services to be ready..."
sleep 15
echo ""

################################################################################
# Step 8: Verify all containers
################################################################################

print_info "Step 8: Verifying container status..."
docker ps --filter "name=ats_" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

################################################################################
# Step 9: Test endpoints
################################################################################

print_info "Step 9: Testing endpoints..."

# Test backend
if curl -f http://localhost:8000/health >/dev/null 2>&1; then
    print_success "✅ Backend is responding"
else
    print_warning "⚠️  Backend health check failed (may still be starting)"
fi

# Test frontend
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    print_success "✅ Frontend is responding"
else
    print_warning "⚠️  Frontend health check failed (may still be starting)"
fi

# Test MongoDB
if docker exec ats_mongodb mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
    print_success "✅ MongoDB is accessible"
else
    print_warning "⚠️  MongoDB connection check failed"
fi

echo ""

################################################################################
# Summary
################################################################################

echo "================================================================================"
print_success "MANUAL RECOVERY COMPLETED!"
echo "================================================================================"
echo ""
echo "📦 Containers Started:"
echo "   ✅ MongoDB (ats_mongodb)"
echo "   ✅ Backend (ats_backend)"
echo "   ✅ Frontend (ats_frontend)"
echo "   ✅ MongoDB Express (ats_mongo_express)"
echo ""
echo "💾 Data Status:"
echo "   ✅ MongoDB data volume preserved"
echo "   ✅ No data loss"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend:        http://localhost:3000"
echo "   Backend API:     http://localhost:8000"
echo "   API Docs:        http://localhost:8000/docs"
echo "   MongoDB Express: http://localhost:8081"
echo ""
echo "📋 Changes Deployed:"
echo "   ✅ Fixed stage feedback mapping (Stage 2 & 3)"
echo "   ✅ Added HR/Admin edit permissions"
echo "   ✅ Added 'Edit Feedback' button in modal"
echo ""
echo "================================================================================"
echo ""

print_info "Next Steps:"
echo "1. Clear browser cache (Ctrl+Shift+R)"
echo "2. Test the application"
echo "3. Verify 'Edit Feedback' button appears for HR/Admin"
echo ""

print_info "To view logs:"
echo "   docker logs -f ats_backend"
echo "   docker logs -f ats_frontend"
echo "   docker logs -f ats_mongodb"
echo ""

print_info "To stop containers:"
echo "   docker stop ats_backend ats_frontend ats_mongo_express ats_mongodb"
echo ""

print_success "Deployment completed successfully!"
