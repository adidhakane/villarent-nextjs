# Database Configuration

This project is configured to automatically use different databases for development and production:

## 🏠 Local Development (SQLite)
- **Database**: SQLite (`prisma/dev.db`)
- **Schema**: `prisma/schema.prisma` (current - for SQLite)
- **Usage**: Just run `npm run dev` - your existing database will work

## 🚀 Production Deployment (PostgreSQL)
- **Database**: PostgreSQL (via Vercel/production environment)
- **Schema**: `prisma/schema.prod.prisma` (PostgreSQL with native arrays)
- **Usage**: Run prepare script before Git push

## 📋 Deployment Steps

### When ready to push to Git/Production:

1. **Prepare for deployment:**
   ```bash
   npm run prepare-deploy
   ```

2. **Commit and push:**
   ```bash
   git add .
   git commit -m "Update for production deployment"
   git push origin main
   ```

3. **Set Vercel environment variables:**
   - `DATABASE_URL` = Your PostgreSQL connection string
   - `NEXTAUTH_SECRET` = Your production secret key
   - `NEXTAUTH_URL` = https://your-domain.vercel.app

## 🔄 Key Differences

| Feature | Local (SQLite) | Production (PostgreSQL) |
|---------|---------------|-------------------------|
| Arrays (amenities, images) | JSON strings | Native arrays |
| Database file | `prisma/dev.db` | Remote PostgreSQL |
| Schema | `schema.prisma` (SQLite) | Auto-switched to PostgreSQL |

## 📱 WhatsApp Integration
- **Book Now**: Direct to `+919168355968`  
- **Book via WhatsApp**: Opens contact selector
- Both include villa details, dates, and guest count

Your current setup is ready for local testing with SQLite! 🎉
