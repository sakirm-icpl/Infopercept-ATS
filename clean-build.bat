@echo off
echo ========================================
echo  CLEAN BUILD - Infopercept ATS
echo ========================================
echo.

echo [1/7] Stopping all containers...
docker-compose down
echo.

echo [2/7] Removing volumes...
docker-compose down -v
echo.

echo [3/7] Cleaning Docker system...
echo This will remove unused containers, networks, and images.
docker system prune -f
echo.

echo [4/7] Rebuilding all images (this may take 3-5 minutes)...
docker-compose build --no-cache
echo.

echo [5/7] Starting all services...
docker-compose up -d
echo.

echo [6/7] Waiting for services to be healthy (60 seconds)...
timeout /t 60 /nobreak
echo.

echo [7/7] Checking service status...
docker-compose ps
echo.

echo ========================================
echo  BUILD COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Open browser in incognito mode
echo 2. Visit: http://localhost:3000
echo 3. Login: admin@infopercept.com / Welcome@ATS
echo.
echo To view logs: docker-compose logs -f
echo.
pause
