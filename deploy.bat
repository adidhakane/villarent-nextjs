@echo off
REM Villa Rental System - Quick Deploy Script for Windows

echo 🚀 Villa Rental System - Team Deployment
echo ========================================

REM Check if git is initialized
if not exist ".git" (
    echo 📁 Initializing Git repository...
    git init
    git add .
    git commit -m "Initial commit: Villa Rental System"
) else (
    echo 📁 Git repository exists, updating...
    git add .
    git commit -m "Deploy: Villa Rental System updates"
)

echo.
echo 🎯 Choose your deployment platform:
echo 1. Vercel (Recommended - Free)
echo 2. Railway (Database included)
echo 3. Netlify (Static hosting)
echo.

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo 🔧 Deploying to Vercel...
    where vercel >nul 2>nul
    if errorlevel 1 (
        echo Installing Vercel CLI...
        npm install -g vercel
    )
    vercel --prod
) else if "%choice%"=="2" (
    echo 🚂 Deploying to Railway...
    echo 1. Go to https://railway.app
    echo 2. Connect your GitHub account
    echo 3. Deploy this repository
    echo 4. Add environment variables in Railway dashboard
) else if "%choice%"=="3" (
    echo 🌐 Deploying to Netlify...
    echo 1. Go to https://netlify.com
    echo 2. Connect your GitHub account
    echo 3. Deploy this repository
    echo 4. Build command: npm run build
    echo 5. Publish directory: .next
) else (
    echo ❌ Invalid choice
)

echo.
echo ✅ Don't forget to set these environment variables:
echo    DATABASE_URL=file:./dev.db
echo    NEXTAUTH_SECRET=your-production-secret
echo    NEXTAUTH_URL=https://your-deployed-url.com
echo    NODE_ENV=production
echo.
echo 🎯 Demo Credentials for your team:
echo    Admin: admin@example.com / admin123
echo    Villa Owner: owner@example.com / owner123

pause
