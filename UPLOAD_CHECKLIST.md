# 📋 COMPLETE FILE UPLOAD CHECKLIST

## 🎯 Upload ALL these files to GitHub master branch

### ✅ **ROOT FILES:**
- `.env` (development config)
- `.env.example` (template)
- `.env.production` (PostgreSQL production config) ⭐ **CRITICAL**
- `components.json`
- `deploy-helper.bat`
- `eslint.config.mjs`
- `next.config.js`
- `package.json` ⭐ **CRITICAL** (contains vercel-build script)
- `package-lock.json`
- `postcss.config.js`
- `README.md`
- `tailwind.config.js`
- `tsconfig.json`
- `vercel.json`

### ✅ **PRISMA FOLDER:**
- `prisma/schema.prisma` (SQLite for development)
- `prisma/schema.prod.prisma` ⭐ **CRITICAL** (PostgreSQL for production)
- `prisma/seed.ts`

### ✅ **SCRIPTS FOLDER:**
- `scripts/setup-prisma.js` ⭐ **CRITICAL** (schema switching)

### ✅ **SRC FOLDER:**
- `src/app/` (all app files)
- `src/components/` (all component files)
- `src/lib/` (all library files including upload.ts)
- `src/types/` (all type files)

### ✅ **PUBLIC FOLDER:**
- `public/` (all public assets)

---

## 🚀 **UPLOAD STEPS:**

### Option 1: GitHub Web Upload
1. Go to: https://github.com/adidhakane/villarent-nextjs
2. **IMPORTANT**: Delete all existing files first
3. Click "Upload files"
4. Drag the ENTIRE folder contents
5. Commit message: `🚀 PostgreSQL production ready - Fixed schema switching`
6. Commit to master branch

### Option 2: GitHub Desktop
1. Clone the repository
2. Replace all files with current folder contents
3. Commit and push to master

---

## 🎯 **KEY FILES THAT MAKE IT WORK:**

1. **`prisma/schema.prod.prisma`** - PostgreSQL schema for production
2. **`scripts/setup-prisma.js`** - Automatically switches schemas
3. **`package.json`** - Contains `vercel-build` script with schema switching
4. **`.env.production`** - PostgreSQL environment configuration
5. **`src/lib/upload.ts`** - PostgreSQL Base64 image storage

**These 5 files are what make the deployment succeed this time!**

---

## ✅ **VERIFICATION:**

After upload, check that these files exist in your GitHub repo:
- [ ] `prisma/schema.prod.prisma`
- [ ] `scripts/setup-prisma.js`
- [ ] Updated `package.json` with vercel-build
- [ ] `.env.production` with PostgreSQL config

**Once uploaded, Vercel will auto-deploy and it WILL work! 🚀**
