@echo off
echo ========================================
echo   Updating Interview Stage Names
echo ========================================
echo.

echo Stopping services...
docker-compose down

echo.
echo Rebuilding services with new stage names...
docker-compose up -d --build

echo.
echo Waiting for services to start...
timeout /t 30 /nobreak

echo.
echo Checking service status...
docker-compose ps

echo.
echo ========================================
echo   Stage Names Updated Successfully!
echo ========================================
echo.
echo New Interview Stages:
echo 1. Resume Screening
echo 2. HR Telephonic Interview
echo 3. Practical Lab Test
echo 4. Technical Interview
echo 5. BU Lead Round
echo 6. HR Head Round
echo 7. CEO Round
echo.
echo Access the application at: http://172.17.11.30:3000
echo.
pause
