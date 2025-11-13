@echo off
COLOR 0A
cls
echo.
echo ========================================
echo   FIXED! NOW REBUILDING...
echo ========================================
echo.
echo The syntax errors have been fixed!
echo Now rebuilding the frontend...
echo.
pause

echo.
echo [1/4] Stopping containers...
docker-compose stop

echo.
echo [2/4] Removing old image...
docker rmi infopercept-ats-frontend 2>nul

echo.
echo [3/4] Rebuilding frontend (NO CACHE)...
echo This will take 2-3 minutes...
echo.
docker-compose build --no-cache frontend

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Build failed again!
    echo Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo [4/4] Starting services...
docker-compose up -d

echo.
echo Waiting for services to start (60 seconds)...
timeout /t 60 /nobreak >nul

echo.
echo ========================================
echo   SUCCESS! FIX COMPLETE!
echo ========================================
echo.
echo NEXT STEPS:
echo.
echo 1. CLOSE ALL BROWSER WINDOWS
echo.
echo 2. Open INCOGNITO window:
echo    Chrome: Ctrl+Shift+N
echo    Firefox: Ctrl+Shift+P
echo.
echo 3. Visit: http://localhost:3000
echo.
echo 4. Login:
echo    Email: admin@infopercept.com
echo    Password: Welcome@ATS
echo.
echo 5. Click "User Management"
echo.
echo 6. You should see:
echo    - ONE sidebar (not two)
echo    - ONE content area (not two)
echo    - No duplicates!
echo.
echo ========================================
echo.
pause
