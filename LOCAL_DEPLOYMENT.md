# Local Deployment Guide

## Changes Made for Local Deployment

All environment files have been updated to use `localhost` instead of `172.17.11.30`:

### Updated Files:
1. ✅ `.env` - Updated CORS origins to localhost
2. ✅ `frontend/.env` - Updated API URLs to localhost
3. ✅ `backend/.env` - Updated CORS origins to localhost
4. ✅ `frontend/.env.docker` - Already configured for Docker internal networking

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- At least 4GB RAM available for Docker

### Step 1: Start the Application
```bash
docker-compose up -d
```

This will start:
- MongoDB (internal only, no external port)
- Backend API (http://localhost:8000)
- Frontend (http://localhost:3000)
- MongoDB Express (http://localhost:8081)

### Step 2: Check Status
```bash
docker-compose ps
```

All services should show "Up" status.

### Step 3: View Logs (if needed)
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Step 4: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **MongoDB Express**: http://localhost:8081
  - Username: `admin`
  - Password: `InfoperceptMongo@2024`

### Step 5: Login

Default admin credentials:
- **Email**: admin@infopercept.com
- **Password**: Welcome@ATS

⚠️ **Change the password immediately after first login!**

## Stopping the Application

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

## Troubleshooting

### Port Already in Use
If you get port conflicts, check what's using the ports:
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :8000
netstat -ano | findstr :8081
```

### Rebuild Containers
If you make changes to code:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### View Container Logs
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb
```

### Reset Everything
```bash
docker-compose down -v
docker-compose up -d
```

## Development Mode

If you want to run in development mode with hot reload:

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm start
```

Note: You'll still need MongoDB running via Docker:
```bash
docker-compose up -d mongodb
```

## Network Configuration

The application uses Docker's internal networking:
- Services communicate using service names (e.g., `backend`, `mongodb`)
- External access via localhost ports
- Frontend connects to backend via `http://localhost:8000` from browser
- Backend connects to MongoDB via `mongodb://mongodb:27017` internally

## Next Steps

1. Access the application at http://localhost:3000
2. Login with admin credentials
3. Change the default password
4. Create additional users (HR, Team Members, etc.)
5. Start using the ATS system!

## Support

If you encounter issues:
1. Check Docker Desktop is running
2. Verify all containers are up: `docker-compose ps`
3. Check logs: `docker-compose logs -f`
4. Try rebuilding: `docker-compose build --no-cache`
