#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Start the ATS application with MongoDB Express for database management.

.DESCRIPTION
    This script starts all the Docker services including mongo-express
    which provides a web interface for managing the MongoDB database.

.PARAMETER Build
    Rebuild the Docker images before starting services.

.EXAMPLE
    .\start-with-mongo-express.ps1
    Start the services using existing images.

.EXAMPLE
    .\start-with-mongo-express.ps1 -Build
    Rebuild and start the services.
#>

param(
    [switch]$Build
)

Write-Host "🚀 Starting ATS Application with MongoDB Express..." -ForegroundColor Green

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating from env.example..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host "✅ .env file created. Please update the passwords in .env file before continuing." -ForegroundColor Green
    Write-Host "   Press any key to continue..." -ForegroundColor Cyan
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Build images if requested
if ($Build) {
    Write-Host "🔨 Building Docker images..." -ForegroundColor Blue
    docker-compose build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to build images" -ForegroundColor Red
        exit 1
    }
}

# Start services
Write-Host "📦 Starting Docker services..." -ForegroundColor Blue
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Services started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Application URLs:" -ForegroundColor Cyan
    Write-Host "   Frontend:     http://localhost:3000" -ForegroundColor White
    Write-Host "   Backend API:  http://localhost:8000" -ForegroundColor White
    Write-Host "   MongoDB Express: http://localhost:8081" -ForegroundColor White
    Write-Host ""
    Write-Host "🔐 MongoDB Express Login:" -ForegroundColor Cyan
    Write-Host "   Username: admin" -ForegroundColor White
    Write-Host "   Password: admin123 (or as set in .env)" -ForegroundColor White
    Write-Host ""
    Write-Host "📊 To view logs: docker-compose logs -f" -ForegroundColor Yellow
    Write-Host "🛑 To stop services: docker-compose down" -ForegroundColor Yellow
} else {
    Write-Host "❌ Failed to start services" -ForegroundColor Red
    exit 1
} 