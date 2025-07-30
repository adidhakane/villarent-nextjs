# 🚀 PostgreSQL Production Deployment Guide

## 1. Database Setup (Choose One)

### Option A: Vercel Postgres (Recommended)
1. Go to Vercel Dashboard → Storage
2. Create Postgres Database
3. Copy the `DATABASE_URL` connection string

### Option B: External PostgreSQL (Railway, PlanetScale, Supabase)
1. Create a PostgreSQL database on your preferred provider
2. Copy the `DATABASE_URL` connection string

## 2. Vercel Environment Variables

In your Vercel project settings, add these **EXACT** variables:

```
DATABASE_URL
postgresql://username:password@hostname:port/database

NEXTAUTH_SECRET
villa-rental-production-ultra-secure-secret-key-2024-32chars

NEXTAUTH_URL
https://your-app-name.vercel.app

NODE_ENV
production

IMAGE_STORAGE
postgresql

PRISMA_HIDE_UPDATE_MESSAGE
true
```

## 3. Deployment Commands

### Build Command (in Vercel):
```
npm run vercel-build
```

### Or use default:
```
npm run build
```

## 4. Key Features for Production:

✅ **PostgreSQL Database**: Proper production database
✅ **Base64 Image Storage**: Villa cover images stored in PostgreSQL  
✅ **Compressed Images**: 500KB max, optimized for web
✅ **Database Seeding**: Demo data automatically created
✅ **Environment-aware**: Different configs for dev vs production

## 5. After Successful Deployment:

### Demo Credentials:
- **Admin**: admin@example.com / admin123
- **Villa Owner**: owner@example.com / owner123

### Features Available:
- Villa registration with image upload (stored in PostgreSQL)
- Admin dashboard with full management
- Dynamic pricing system
- Search and filtering
- Authentication system

## 6. Troubleshooting:

### If build fails:
1. Check DATABASE_URL is valid PostgreSQL connection
2. Ensure all environment variables are set
3. Check build logs for specific errors

### If images don't load:
- Images are stored as Base64 in PostgreSQL for production
- Check IMAGE_STORAGE=postgresql is set

This configuration uses PostgreSQL for both data and image storage in production! 🎯
