@echo off
echo Stopping containers...
docker-compose down

echo Removing old images...
docker rmi infopercept-ats-frontend 2>nul

echo Cleaning Docker build cache...
docker builder prune -f

echo Building with no cache...
docker-compose build --no-cache frontend

echo Starting frontend...
docker-compose up -d frontend

echo Done! Check status with: docker-compose ps
