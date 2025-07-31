# 🚀 Production Deployment Guide

## Prerequisites
- Existing Vercel project connected to GitHub
- Production PostgreSQL database

## 📋 Deployment Steps

### 1. Vercel Environment Variables
Add these environment variables in your Vercel dashboard:

**Go to:** Vercel Dashboard → Your Project → Settings → Environment Variables

```bash
# Database
DATABASE_URL = "your-production-postgresql-url"

# NextAuth
NEXTAUTH_SECRET = "generate-strong-random-secret"
NEXTAUTH_URL = "https://your-domain.vercel.app"

# App Settings
NODE_ENV = "production"
```

### 2. Generate NEXTAUTH_SECRET
Run this locally to generate a secure secret:
```bash
openssl rand -base64 32
```
Or use: https://generate-secret.vercel.app/32

### 3. Production Database Setup
Your production database needs the same schema. Options:

**Option A: Use existing production database**
- Copy your existing production DATABASE_URL

**Option B: New database for this version**
- Set up new PostgreSQL (Supabase, Railway, etc.)
- Run: `npx prisma db push` with production URL
- Run: `npx prisma db seed` for demo data

### 4. Deploy
```bash
git add .
git commit -m "feat: updated villa rental app with PostgreSQL"
git push origin main
```

Vercel will automatically deploy when you push to GitHub!

## 🔍 Post-Deploy Verification
1. Check Vercel build logs
2. Test login with demo accounts
3. Test villa search functionality
4. Verify database connections

## 🆘 Troubleshooting
- Check Vercel Function Logs for database connection errors
- Ensure DATABASE_URL is correctly set in Vercel
- Verify NEXTAUTH_SECRET is set in production
