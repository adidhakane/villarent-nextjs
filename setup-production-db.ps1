# Production Database Setup Script for Windows
# This script sets up the production database schema and seeds it with demo data

Write-Host "🚀 Setting up production database..." -ForegroundColor Green

# Set the production DATABASE_URL
$env:DATABASE_URL = "postgres://c296e295b381237fde33dc84ecb6fe6484d3c2384bb2eca14044a844271a3a38:sk_pyZslGd_Qlh-Nw7iMa0Dy@db.prisma.io:5432/?sslmode=require"

Write-Host "📊 Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

Write-Host "🏗️ Creating database schema..." -ForegroundColor Yellow
npx prisma db push --force-reset

Write-Host "🌱 Seeding database with demo data..." -ForegroundColor Yellow
npx prisma db seed

Write-Host "✅ Production database setup complete!" -ForegroundColor Green
Write-Host "Demo credentials:" -ForegroundColor Cyan
Write-Host "Admin: admin@example.com / admin123" -ForegroundColor White
Write-Host "Villa Owner: owner@example.com / owner123" -ForegroundColor White
