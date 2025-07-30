#!/bin/bash

# Switch Prisma schema based on environment
if [ "$NODE_ENV" = "production" ]; then
  echo "🔄 Using PostgreSQL schema for production..."
  cp prisma/schema.prod.prisma prisma/schema.prisma
else
  echo "🔄 Using SQLite schema for development..."
  cp prisma/schema.dev.prisma prisma/schema.prisma
fi

# Generate Prisma client
prisma generate

echo "✅ Prisma setup complete for $NODE_ENV environment"
