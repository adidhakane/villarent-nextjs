@echo off
echo 🚀 Villa Rental System - GitHub Upload for Team Demo
echo =====================================================
echo.

echo 📋 STEP 1: Create GitHub Repository
echo 1. Go to https://github.com/new
echo 2. Repository name: villa-rental-system
echo 3. Make it Public (so team can see)
echo 4. Don't initialize with README (we have one)
echo 5. Click "Create repository"
echo.

echo 📤 STEP 2: Copy your repository URL
set /p REPO_URL="Paste your GitHub repository URL here (e.g., https://github.com/username/villa-rental-system.git): "

echo.
echo 🔄 STEP 3: Uploading to GitHub...

git remote add origin %REPO_URL%
git branch -M main
git push -u origin main

echo.
echo ✅ SUCCESS! Your code is now on GitHub!
echo.
echo 🚀 STEP 4: Deploy to Vercel
echo 1. Go to https://vercel.com
echo 2. Click "New Project"
echo 3. Import from GitHub
echo 4. Select your villa-rental-system repository
echo 5. Add these environment variables in Vercel:
echo    DATABASE_URL=file:./dev.db
echo    NEXTAUTH_SECRET=villa-rental-super-secret-2024
echo    NEXTAUTH_URL=https://your-project.vercel.app
echo    NODE_ENV=production
echo 6. Click "Deploy"
echo.
echo 🎯 Your team demo will be live in 2 minutes!
echo.
echo 👥 Demo Credentials for your team:
echo    Admin: admin@example.com / admin123
echo    Villa Owner: owner@example.com / owner123
echo.

pause
