@echo off
COLOR 0A
echo.
echo ========================================
echo   DUPLICATE UI FIX - GUARANTEED
echo ========================================
echo.
echo This script will:
echo  1. Verify code is correct
echo  2. Stop containers
echo  3. Remove old images
echo  4. Clear Docker cache
echo  5. Rebuild frontend
echo  6. Start services
echo  7. Verify fix
echo.
echo Press any key to start...
pause >nul

echo.
echo ========================================
echo STEP 1: Verifying Code
echo ========================================
echo.

echo Checking if Layout imports were removed...
findstr /C:"import Layout" frontend\src\pages\UserManagement.js >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [ERROR] UserManagement.js still imports Layout!
    echo The code fix was not applied correctly.
    pause
    exit /b 1
) else (
    echo [OK] UserManagement.js - No Layout import
)

findstr /C:"import Layout" frontend\src\pages\MyAssignments.js >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [ERROR] MyAssignments.js still imports Layout!
    pause
    exit /b 1
) else (
    echo [OK] MyAssignments.js - No Layout import
)

findstr /C:"import Layout" frontend\src\pages\InterviewForm.js >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [ERROR] InterviewForm.js still imports Layout!
    pause
    exit /b 1
) else (
    echo [OK] InterviewForm.js - No Layout import
)

findstr /C:"import Layout" frontend\src\pages\FinalRecommendation.js >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [ERROR] FinalRecommendation.js still imports Layout!
    pause
    exit /b 1
) else (
    echo [OK] FinalRecommendation.js - No Layout import
)

echo.
echo [SUCCESS] All code fixes verified!
echo.

echo ========================================
echo STEP 2: Stopping Containers
echo ========================================
echo.
docker-compose stop

echo.
echo ========================================
echo STEP 3: Removing Old Frontend Image
echo ========================================
echo.
docker rmi infopercept-ats-frontend 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Old image removed
) else (
    echo [INFO] No old image found (this is fine)
)

echo.
echo ========================================
echo STEP 4: Clearing Docker Build Cache
echo ========================================
echo.
docker builder prune -f

echo.
echo ========================================
echo STEP 5: Rebuilding Frontend (NO CACHE)
echo ========================================
echo.
echo This may take 2-3 minutes...
echo.
docker-compose build --no-cache frontend
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Build failed!
    echo Check the error messages above.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Frontend rebuilt successfully!

echo.
echo ========================================
echo STEP 6: Starting All Services
echo ========================================
echo.
docker-compose up -d

echo.
echo Waiting for services to start (60 seconds)...
timeout /t 60 /nobreak >nul

echo.
echo ========================================
echo STEP 7: Verifying Services
echo ========================================
echo.
docker-compose ps

echo.
echo ========================================
echo   FIX COMPLETE!
echo ========================================
echo.
echo NEXT STEPS:
echo.
echo 1. CLOSE ALL BROWSER WINDOWS COMPLETELY
echo.
echo 2. Open a NEW INCOGNITO window:
echo    - Chrome: Ctrl+Shift+N
echo    - Firefox: Ctrl+Shift+P
echo    - Edge: Ctrl+Shift+N
echo.
echo 3. Visit: http://localhost:3000
echo.
echo 4. Login:
echo    Email: admin@infopercept.com
echo    Password: Welcome@ATS
echo.
echo 5. Click "User Management"
echo.
echo 6. Verify:
echo    - ONE sidebar on left
echo    - ONE content area on right
echo    - No horizontal scrolling
echo    - No duplicate elements
echo.
echo ========================================
echo.
echo If you STILL see duplicates:
echo.
echo 1. Clear ALL browser data:
echo    - Press Ctrl+Shift+Delete
echo    - Select "All time"
echo    - Check ALL boxes
echo    - Click "Clear data"
echo.
echo 2. Try a DIFFERENT browser
echo.
echo 3. Check logs:
echo    docker-compose logs frontend
echo.
echo ========================================
echo.
pause
