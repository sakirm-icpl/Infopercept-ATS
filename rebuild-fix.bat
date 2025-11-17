@echo off
echo ========================================
echo   Rebuilding ATS with Stage Name Updates
echo ========================================
echo.

echo Step 1: Stopping all containers...
docker-compose down
echo.

echo Step 2: Removing old images...
docker rmi infopercept-ats-backend infopercept-ats-frontend 2>nul
echo.

echo Step 3: Rebuilding and starting containers...
docker-compose up -d --build --force-recreate
echo.

echo Step 4: Waiting for services to start...
timeout /t 30 /nobreak
echo.

echo Step 5: Checking service status...
docker-compose ps
echo.

echo Step 6: Checking backend logs for errors...
docker-compose logs backend --tail=20
echo.

echo ========================================
echo   Rebuild Complete!
echo ========================================
echo.
echo If you see errors above, the backend may have issues.
echo Otherwise, refresh your browser and check the stage names.
echo.
pause
