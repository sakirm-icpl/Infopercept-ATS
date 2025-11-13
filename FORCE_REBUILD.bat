@echo off
echo ========================================
echo FORCE REBUILD - Fix Duplicate UI Issue
echo ========================================
echo.
echo This will:
echo 1. Stop all containers
echo 2. Remove old images and volumes
echo 3. Rebuild everything from scratch
echo 4. Start fresh containers
echo.
pause

echo.
echo [1/5] Stopping all containers...
docker-compose down

echo.
echo [2/5] Removing old frontend image...
docker rmi infopercept-ats-frontend 2>nul

echo.
echo [3/5] Cleaning Docker build cache...
docker builder prune -f

echo.
echo [4/5] Rebuilding frontend with NO CACHE...
docker-compose build --no-cache frontend

echo.
echo [5/5] Starting all services...
docker-compose up -d

echo.
echo ========================================
echo Rebuild Complete!
echo ========================================
echo.
echo IMPORTANT: Wait 60 seconds for services to start
echo.
echo Then follow these steps:
echo 1. Close ALL browser windows completely
echo 2. Open a NEW incognito window (Ctrl+Shift+N)
echo 3. Visit: http://localhost:3000
echo 4. Login: admin@infopercept.com / Welcome@ATS
echo 5. Click User Management
echo.
echo You should see ONLY ONE sidebar and ONE content area!
echo.
echo If you still see duplicates:
echo - Clear ALL browser data (Ctrl+Shift+Delete)
echo - Try a different browser
echo - Check: docker-compose logs frontend
echo.
pause
