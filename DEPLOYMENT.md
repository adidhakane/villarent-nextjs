# 🚀 Quick Deployment Guide

## Step 1: Prepare for Deployment

Make sure your local project is working:
```bash
npm run dev
```

## Step 2: Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

## Step 3: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com) and sign in**

2. **Import your repository**
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Add Environment Variables**
   
   In Vercel project settings, add these variables:
   
   ```
   NEXTAUTH_SECRET = your-super-secret-production-key
   NEXTAUTH_URL = https://your-app-name.vercel.app
   DATABASE_URL = your-postgresql-connection-string
   NODE_ENV = production
   IMAGE_STORAGE = postgresql
   ```

4. **Set up Database**
   
   **Option A: Vercel Postgres (Recommended)**
   - In Vercel Dashboard → Storage → Create Database
   - Select PostgreSQL
   - Copy connection string to `DATABASE_URL`
   
   **Option B: External PostgreSQL**
   - Use any PostgreSQL provider (Railway, Supabase, etc.)
   - Add connection string to `DATABASE_URL`

5. **Deploy**
   - Click "Deploy"
   - Vercel will automatically:
     - Build your app
     - Set up the database
     - Seed with demo data
     - Deploy to production

## Step 4: Test Production

Your app will be live at `https://your-app-name.vercel.app`

**Demo Accounts:**
- Admin: `admin@example.com` / `admin123`
- Owner: `owner@example.com` / `owner123`

## 🔄 Ongoing Development

1. **Develop locally** with SQLite
2. **Push changes** to GitHub
3. **Automatic deployment** to Vercel
4. **Production uses** PostgreSQL

No configuration changes needed between environments!

## 🆘 Troubleshooting

**Build fails?**
- Check environment variables are set
- Ensure DATABASE_URL is valid

**Database issues?**
- Verify PostgreSQL connection string
- Check Vercel Postgres is active

**Images not working?**
- Set `IMAGE_STORAGE=postgresql` in Vercel
- Images will be stored in database as Base64
