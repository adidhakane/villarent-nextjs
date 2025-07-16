# 🚀 Vercel Deployment Guide

## Quick Deploy to Vercel

### Method 1: One-Click Deploy (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your repository: `adidhakane/villarent-nextjs`
5. Configure environment variables (see below)
6. Click "Deploy"

### Method 2: Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

## 🔐 Environment Variables for Vercel

Add these in your Vercel project settings:

```
DATABASE_URL=file:./dev.db
NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters
NEXTAUTH_URL=https://your-app-name.vercel.app
```

### Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

## 📝 Demo Credentials for Team

Share these with your team after deployment:

**Admin Account:**
- Email: `admin@example.com`
- Password: `admin123`

**Villa Owner Account:**
- Email: `owner@example.com`  
- Password: `owner123`

## 🎯 Features to Demonstrate

1. **Public Search** - No login required
2. **Villa Registration** - Sign up as villa owner
3. **Admin Dashboard** - Manage all villas and bookings
4. **Calendar System** - Block unavailable dates
5. **Role-based Access** - Different permissions for Admin/Owner

## 🔧 Troubleshooting

### Common Issues:
1. **Build fails:** Check environment variables are set
2. **Database errors:** Ensure DATABASE_URL is correct
3. **Auth errors:** Verify NEXTAUTH_URL matches your domain

### Production URLs:
- Replace `your-app-name` in environment variables with your actual Vercel app name
- Update NEXTAUTH_URL to match your deployment URL

## 🌟 Post-Deployment Checklist

- [ ] Test authentication with demo accounts
- [ ] Verify villa registration works
- [ ] Check admin approval system
- [ ] Test public search functionality
- [ ] Confirm calendar blocking works

Your villa rental system is now live and ready for team demonstration! 🎉
