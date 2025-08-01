# Local PostgreSQL Setup Instructions

## Option 1: Docker (Recommended)

1. Make sure Docker Desktop is running
2. Run the following commands:
```bash
docker-compose up -d
```

This will start a PostgreSQL container with:
- Host: localhost:5432
- Database: villarent_dev
- User: postgres
- Password: admin123

## Option 2: Local PostgreSQL Installation

1. Install PostgreSQL locally
2. Create a database named `villarent_dev`
3. Update your `.env.local` file with the correct connection string

## Option 3: Cloud PostgreSQL (Neon/Supabase/Railway)

1. Create a free PostgreSQL database on:
   - [Neon](https://neon.tech)
   - [Supabase](https://supabase.com)
   - [Railway](https://railway.app)

2. Update your `.env.local` file with the connection string they provide

## After Database Setup

1. Run database migrations:
```bash
npm run db:push
```

2. Seed the database with demo data:
```bash
npm run db:seed
```

3. Start the development server:
```bash
npm run dev
```

## Environment Variables

Make sure your `.env.local` file contains:
```
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/villarent_dev"
NEXTAUTH_SECRET="your-super-secret-key-for-local-development"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```
