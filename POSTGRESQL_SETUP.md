# 🚀 Quick PostgreSQL Setup for Vercel Deployment

## Step 1: Get Free PostgreSQL Database

1. Go to **[Neon.tech](https://neon.tech)** (free PostgreSQL hosting)
2. Sign up and create a new project
3. Copy the connection string (looks like: `postgresql://username:password@host/dbname`)

## Step 2: Update Vercel Environment Variables

Replace your current `DATABASE_URL` in Vercel with the PostgreSQL connection string:

```
DATABASE_URL=postgresql://username:password@host/dbname?sslmode=require
NEXTAUTH_SECRET=3+Tk6cCRRv5ct0r1ipTW/S7/JMIUUeDH315uuN7Re1E=
NEXTAUTH_URL=https://villarent-nextjs.vercel.app
```

## Step 3: Redeploy

After updating the environment variables, redeploy your application.

## Alternative: Use Vercel Postgres (Built-in)

1. Go to your Vercel project dashboard
2. **Storage** tab → **Create Database** → **Postgres**
3. It will automatically set the environment variables
4. Redeploy your application

## Why This Fixes the Issue

- SQLite doesn't work in Vercel's serverless environment (read-only filesystem)
- PostgreSQL is cloud-hosted and works perfectly with Vercel
- Your demo users will be automatically created on first run

## Demo Credentials (will work after PostgreSQL setup)

- **Admin**: `admin@example.com` / `admin123`
- **Villa Owner**: `owner@example.com` / `owner123`
