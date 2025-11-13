# Docker Setup Guide for ATS System

This guide will help you deploy the Applicant Tracking System (ATS) using Docker and Docker Compose.

## Prerequisites

- **Docker** - [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose** - [Install Docker Compose](https://docs.docker.com/compose/install/)

## Quick Start

### 1. Clone and Setup

```bash
# Navigate to the project directory
cd HR_Management

# Copy environment file
cp env.example .env

# Edit the .env file with your configuration
# (See Environment Variables section below)
```

### 2. Environment Variables

Edit the `.env` file with your secure values:

```env
# MongoDB Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_secure_password_here
MONGO_DATABASE=ats_db

# MongoDB Express (Optional)
MONGO_EXPRESS_USERNAME=admin
MONGO_EXPRESS_PASSWORD=admin

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-long-and-random
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=False

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://frontend:80
```

### 3. Build and Run

#### Development Environment
```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Production Environment
```bash
# Build and start production services
docker-compose -f docker-compose.prod.yml up --build -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

## Services Overview

### Core Services

1. **MongoDB** (Port: 27017)
   - Database server
   - Persistent data storage
   - Health checks enabled

2. **Backend** (Port: 8000)
   - FastAPI application
   - RESTful API endpoints
   - File upload handling

3. **Frontend** (Port: 3000)
   - React application
   - Nginx server
   - Static file serving

### Optional Services

4. **MongoDB Express** (Port: 8081)
   - Web-based MongoDB admin interface
   - Accessible at http://localhost:8081
   - Username: admin, Password: admin (configurable)

5. **Nginx Reverse Proxy** (Production only)
   - SSL termination
   - Load balancing
   - Rate limiting
   - Security headers

## Access Points

### Development
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **MongoDB Express**: http://localhost:8081

### Production
- **Application**: https://your-domain.com (or http://your-domain.com)
- **API**: https://your-domain.com/api
- **Health Check**: https://your-domain.com/health

## Docker Commands

### Basic Commands
```bash
# Build images
docker-compose build

# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs

# View logs for specific service
docker-compose logs backend

# Follow logs
docker-compose logs -f

# Restart services
docker-compose restart

# Rebuild and restart
docker-compose up --build
```

### Production Commands
```bash
# Build and start production
docker-compose -f docker-compose.prod.yml up --build -d

# View production logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop production services
docker-compose -f docker-compose.prod.yml down

# Scale services (if needed)
docker-compose -f docker-compose.prod.yml up --scale backend=3 -d
```

### Maintenance Commands
```bash
# Remove all containers and volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Clean up unused resources
docker system prune -a

# View running containers
docker ps

# Execute commands in containers
docker-compose exec backend python manage.py shell
docker-compose exec mongodb mongosh

# Backup database
docker-compose exec mongodb mongodump --out /backup

# Restore database
docker-compose exec mongodb mongorestore /backup
```

## Environment Variables

### Required Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONGO_ROOT_USERNAME` | MongoDB root username | admin | Yes |
| `MONGO_ROOT_PASSWORD` | MongoDB root password | - | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `MONGO_DATABASE` | Database name | ats_db | No |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_EXPRESS_USERNAME` | MongoDB Express username | admin |
| `MONGO_EXPRESS_PASSWORD` | MongoDB Express password | admin |
| `JWT_ALGORITHM` | JWT algorithm | HS256 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time | 30 |
| `UPLOAD_DIR` | File upload directory | ./uploads |
| `MAX_FILE_SIZE` | Maximum file size (bytes) | 10485760 |
| `HOST` | Backend host | 0.0.0.0 |
| `PORT` | Backend port | 8000 |
| `DEBUG` | Debug mode | False |
| `ALLOWED_ORIGINS` | CORS allowed origins | http://localhost:3000,http://127.0.0.1:3000,http://frontend:80 |

## Security Considerations

### 1. Environment Variables
- Use strong, unique passwords
- Generate a secure JWT secret
- Never commit `.env` files to version control

### 2. MongoDB Security
- Use strong passwords for MongoDB users
- Restrict network access in production
- Enable authentication

### 3. SSL/TLS (Production)
- Obtain SSL certificates
- Configure HTTPS in nginx
- Use secure cipher suites

### 4. Network Security
- Use Docker networks for service isolation
- Restrict port exposure
- Implement rate limiting

## Production Deployment

### 1. SSL Certificate Setup

For production, you need SSL certificates:

```bash
# Create SSL directory
mkdir -p ssl

# Generate self-signed certificate (for testing)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem -out ssl/cert.pem

# For production, use Let's Encrypt or your CA
```

### 2. Production Environment File

Create `.env.prod` for production:

```env
# MongoDB Configuration
MONGO_ROOT_USERNAME=your_production_username
MONGO_ROOT_PASSWORD=your_very_secure_password
MONGO_DATABASE=ats_db_prod

# JWT Configuration
JWT_SECRET=your-production-jwt-secret-make-it-very-long-and-random
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=False

# CORS Configuration
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### 3. Deploy to Production

```bash
# Set production environment
export $(cat .env.prod | xargs)

# Deploy with production compose file
docker-compose -f docker-compose.prod.yml up --build -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Monitoring and Logs

### Health Checks
All services include health checks:
- MongoDB: Database connectivity
- Backend: API health endpoint
- Frontend: Web server availability
- Nginx: Reverse proxy health

### Log Management
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend

# Follow logs in real-time
docker-compose logs -f

# View logs with timestamps
docker-compose logs -t
```

### Resource Monitoring
```bash
# View resource usage
docker stats

# View container details
docker inspect ats_backend

# Check disk usage
docker system df
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   netstat -tulpn | grep :3000
   
   # Stop conflicting services
   sudo systemctl stop nginx  # if nginx is running
   ```

2. **MongoDB Connection Issues**
   ```bash
   # Check MongoDB logs
   docker-compose logs mongodb
   
   # Test connection
   docker-compose exec backend python -c "from app.database import connect_to_mongo; import asyncio; asyncio.run(connect_to_mongo())"
   ```

3. **Build Failures**
   ```bash
   # Clean build
   docker-compose build --no-cache
   
   # Remove all images and rebuild
   docker-compose down --rmi all
   docker-compose up --build
   ```

4. **Permission Issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   
   # Fix Docker permissions
   sudo usermod -aG docker $USER
   ```

### Debug Commands
```bash
# Enter container shell
docker-compose exec backend bash
docker-compose exec frontend sh

# Check service status
docker-compose ps

# View service configuration
docker-compose config

# Check network connectivity
docker-compose exec backend ping mongodb
```

## Backup and Recovery

### Database Backup
```bash
# Create backup
docker-compose exec mongodb mongodump --out /backup/$(date +%Y%m%d_%H%M%S)

# Copy backup from container
docker cp ats_mongodb:/backup ./backup

# Restore from backup
docker-compose exec mongodb mongorestore /backup/20240101_120000/
```

### File Uploads Backup
```bash
# Backup uploads
docker cp ats_backend:/app/uploads ./backup/uploads

# Restore uploads
docker cp ./backup/uploads ats_backend:/app/uploads
```

## Performance Optimization

### Resource Limits
The production compose file includes resource limits:
- MongoDB: 1GB memory limit
- Backend: 512MB memory limit
- Frontend: 256MB memory limit

### Scaling
```bash
# Scale backend services
docker-compose -f docker-compose.prod.yml up --scale backend=3 -d

# Scale with load balancer
docker-compose -f docker-compose.prod.yml up --scale backend=3 --scale frontend=2 -d
```

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review service logs: `docker-compose logs`
3. Verify environment variables are set correctly
4. Ensure all required ports are available
5. Check Docker and Docker Compose versions

For additional help:
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Docker Documentation](https://hub.docker.com/_/mongo) 