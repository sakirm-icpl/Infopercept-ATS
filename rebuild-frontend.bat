@echo off
echo ========================================
echo Rebuilding Frontend to Fix Duplicate UI
echo ========================================
echo.

echo Stopping containers...
docker-compose stop frontend

echo.
echo Rebuilding frontend container...
docker-compose build --no-cache frontend

echo.
echo Starting frontend container...
docker-compose up -d frontend

echo.
echo ========================================
echo Frontend rebuilt successfully!
echo ========================================
echo.
echo Wait 30 seconds, then visit: http://localhost:3000
echo Use Ctrl+Shift+N (Chrome) or Ctrl+Shift+P (Firefox) for incognito mode
echo.
pause
