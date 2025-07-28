#!/bin/bash

# Database setup script for different environments

echo "🔧 Setting up database..."

# Check if we're in production
if [ "$NODE_ENV" = "production" ]; then
    echo "📦 Production environment detected - using PostgreSQL"
    echo "🔄 Generating Prisma client for PostgreSQL..."
    npx prisma generate
    echo "🚀 Running database migrations..."
    npx prisma migrate deploy
else
    echo "🏠 Development environment detected - using SQLite"
    echo "🔄 Generating Prisma client for SQLite..."
    npx prisma generate
    echo "🔄 Pushing database schema..."
    npx prisma db push
    echo "🌱 Seeding database with demo data..."
    npx prisma db seed
fi

echo "✅ Database setup complete!"
