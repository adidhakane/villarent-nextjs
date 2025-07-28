# Villa Rental System - Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: Vercel (Recommended - 5 minutes)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy Command**:
   ```bash
   vercel
   ```

3. **Follow prompts**:
   - Link to your GitHub account
   - Choose project name
   - Set as production deployment

4. **Environment Variables** (Add in Vercel Dashboard):
   ```
   DATABASE_URL=file:./dev.db
   NEXTAUTH_SECRET=your-production-secret-key
   NEXTAUTH_URL=https://your-app-name.vercel.app
   NODE_ENV=production
   ```

### Option 2: Railway (Database Included)

1. **Connect GitHub**: Go to [railway.app](https://railway.app)
2. **Deploy from GitHub**: Select your repository
3. **Add Environment Variables** in Railway dashboard
4. **Railway will handle database automatically**

### Option 3: Netlify

1. **Connect GitHub**: Go to [netlify.com](https://netlify.com)
2. **Deploy from GitHub**: Select your repository
3. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`

## 🔧 Pre-Deployment Checklist

- [x] Environment variables configured
- [x] Database schema ready (SQLite for demo)
- [x] Build process working
- [x] Demo users seeded
- [x] All features tested

## 🎯 Demo Credentials

**Admin**: `admin@example.com` / `admin123`
**Villa Owner**: `owner@example.com` / `owner123`

## 📋 Features to Showcase

1. **Homepage**: Public villa search
2. **Authentication**: Role-based login
3. **Villa Owner Dashboard**: Manage properties & calendar
4. **Admin Panel**: System oversight & approvals
5. **Search & Booking**: WhatsApp integration

## 🐛 Known Limitations

- Uses SQLite (demo database)
- Google OAuth disabled (demo mode)
- File uploads not implemented (placeholder)

## 🔄 Local Development

```bash
npm install
npm run db:push
npm run dev
```
