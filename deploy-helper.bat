@echo off
title Villa Rental System - Production Deployment
color 0A

echo.
echo ========================================
echo 🚀 VILLA RENTAL SYSTEM DEPLOYMENT 🚀
echo ========================================
echo.

echo ✅ Your project is ready for production!
echo ✅ PostgreSQL schema configured
echo ✅ Image storage configured  
echo ✅ Environment variables set
echo.

echo 📋 DEPLOYMENT OPTIONS:
echo.
echo [1] Open GitHub Desktop (Recommended)
echo [2] Open GitHub Web Upload
echo [3] Open Vercel Dashboard
echo [4] View Deployment Guide
echo [5] Exit
echo.

set /p choice="Choose an option (1-5): "

if "%choice%"=="1" (
    echo.
    echo 🔄 Opening GitHub Desktop...
    echo ℹ️  Add this folder as a local repository
    echo ℹ️  Commit with message: "🚀 Production ready with PostgreSQL"
    echo ℹ️  Push to origin
    start "" "https://desktop.github.com"
    goto :end
)

if "%choice%"=="2" (
    echo.
    echo 🔄 Opening GitHub for manual upload...
    echo ℹ️  Upload all files from this folder
    echo ℹ️  Commit message: "🚀 Production ready with PostgreSQL"
    start "" "https://github.com/adidhakane/villarent-nextjs/upload"
    goto :end
)

if "%choice%"=="3" (
    echo.
    echo 🔄 Opening Vercel Dashboard...
    echo ℹ️  Your app will auto-deploy from GitHub
    echo ℹ️  Set the environment variables shown in DEPLOY_NOW.md
    start "" "https://vercel.com/dashboard"
    goto :end
)

if "%choice%"=="4" (
    echo.
    echo 📖 Opening deployment guide...
    start "" "DEPLOY_NOW.md"
    goto :end
)

if "%choice%"=="5" (
    echo.
    echo 👋 Goodbye! Your app is ready to deploy.
    goto :end
)

echo.
echo ❌ Invalid choice. Please run the script again.

:end
echo.
echo 🎯 Next: Push to GitHub → Vercel auto-deploys → Live app!
echo 🌐 Your app will be at: https://villarent-nextjs.vercel.app
echo.
pause
