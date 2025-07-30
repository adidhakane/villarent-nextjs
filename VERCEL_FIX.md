# Vercel Deployment Fix Guide

## Common Issues and Solutions

### 1. Database Connection Issues
- **Problem**: SQLite files don't work on Vercel serverless
- **Solution**: Use PostgreSQL or external database service

### 2. Environment Variables
Add these in Vercel Dashboard → Project Settings → Environment Variables:

```
DATABASE_URL=postgresql://username:password@hostname:port/database
NEXTAUTH_SECRET=villa-rental-production-ultra-secure-secret-key-2024-32chars
NEXTAUTH_URL=https://your-app-name.vercel.app
NODE_ENV=production
```

### 3. Build Command Issues
- Vercel Build Command: `npm run vercel-build`
- Or use default: `npm run build`

### 4. Quick Fixes Applied:
1. ✅ Updated vercel.json configuration
2. ✅ Added vercel-build script with database setup
3. ✅ Created .env.vercel template
4. ✅ Simplified build process

### 5. Manual Deployment Steps:
1. Go to https://vercel.com/dashboard
2. Import your GitHub repository
3. Add environment variables
4. Deploy

### 6. Alternative: Use PostgreSQL
For production, consider using:
- Vercel Postgres
- Railway
- PlanetScale
- Supabase

## Demo Credentials:
- Admin: admin@example.com / admin123
- Villa Owner: owner@example.com / owner123
