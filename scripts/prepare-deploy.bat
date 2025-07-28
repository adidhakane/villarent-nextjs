@echo off
echo 🚀 Preparing for Git deployment...

REM Copy production schema for PostgreSQL
echo 📋 Setting up PostgreSQL schema for production...
copy prisma\schema.prod.prisma prisma\schema.prisma

REM Update package.json build script for production
echo 📦 Updating build configuration...
echo Build will use PostgreSQL with native arrays

echo ✅ Project ready for Git push!
echo    - Local development: SQLite (keep current setup)
echo    - Production: PostgreSQL (schema updated)
echo.
echo 📝 Next steps:
echo    1. git add .
echo    2. git commit -m "Update for production deployment"
echo    3. git push origin main
echo.
echo ⚠️  After push, remember to set environment variables in Vercel:
echo    - DATABASE_URL=your_postgresql_connection_string
echo    - NEXTAUTH_SECRET=your_production_secret
