#!/bin/bash
# Production Database Setup Script
# This script sets up the production database schema and seeds it with demo data

echo "🚀 Setting up production database..."

# Set the production DATABASE_URL
export DATABASE_URL="postgres://c296e295b381237fde33dc84ecb6fe6484d3c2384bb2eca14044a844271a3a38:sk_pyZslGd_Qlh-Nw7iMa0Dy@db.prisma.io:5432/?sslmode=require"

echo "📊 Generating Prisma Client..."
npx prisma generate

echo "🏗️ Creating database schema..."
npx prisma db push --force-reset

echo "🌱 Seeding database with demo data..."
npx prisma db seed

echo "✅ Production database setup complete!"
echo "Demo credentials:"
echo "Admin: admin@example.com / admin123"
echo "Villa Owner: owner@example.com / owner123"
