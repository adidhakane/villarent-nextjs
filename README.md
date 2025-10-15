# Villa Rental Management System

A comprehensive villa rental management system built with Next.js 14, featuring role-based authentication, booking management, and calendar integration.

## 🚀 Features

- **Multi-role Authentication**: Admin, Villa Owners, and Public Users
- **Villa Management**: Register, manage, and view villas
- **Booking System**: Calendar-based availability and booking management
- **Image Handling**: Smart image compression and storage
- **Responsive Design**: Modern UI with Tailwind CSS and Shadcn/ui
- **Database Flexibility**: SQLite for development, PostgreSQL for production

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: SQLite (dev) / PostgreSQL (prod) with Prisma ORM
- **Authentication**: NextAuth.js with credentials and OAuth
- **State Management**: TanStack Query
- **Forms**: React Hook Form with Zod validation

## 🏃‍♂️ Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd villa-rental-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**
   
   **Get a free PostgreSQL database** (choose one):
   - [Supabase](https://supabase.com) - Free tier
   - [Railway](https://railway.app) - Free tier  
   - [ElephantSQL](https://www.elephantsql.com) - Free tier
   
   See `LOCAL_DATABASE_SETUP.md` for detailed instructions.

4. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your PostgreSQL connection:
   ```env
   DATABASE_URL="postgresql://username:password@hostname:port/database"
   NEXTAUTH_SECRET="your-super-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

5. **Set up the database**
   ```bash
   npm run db:setup
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Login with demo credentials:
     - **Admin**: `admin@example.com` / `admin123`
     - **Villa Owner**: `owner@example.com` / `owner123`

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect Next.js

3. **Add Environment Variables in Vercel**
   Go to your project settings and add:
   ```env
   NEXTAUTH_SECRET=your-production-secret-key
   DATABASE_URL=your-postgresql-connection-string
   NODE_ENV=production
   IMAGE_STORAGE=postgresql
   ```

4. **Add Database (Recommended: Vercel Postgres)**
   - In Vercel Dashboard, go to Storage
   - Create a Postgres database
   - Copy the connection string to `DATABASE_URL`

5. **Deploy**
   - Vercel will automatically deploy on every push to main
   - Database will be automatically seeded on first deployment

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (protected)/       # Protected routes
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   └── search/            # Public search page
│   ├── components/            # Reusable UI components
│   ├── lib/                   # Utility functions
│   └── types/                 # TypeScript definitions
├── prisma/                    # Database schema and migrations
├── public/                    # Static assets
└── .env.example              # Environment variables template
```

## 🗄️ Database

### Both Development and Production (PostgreSQL)
- Uses `schema.prisma` with PostgreSQL provider
- **Identical database structure** in both environments
- Supports any PostgreSQL provider (Vercel Postgres, Supabase, Railway, etc.)
- Automatic migrations and seeding

## 🖼️ Image Storage

### Development
- Images stored locally in `public/uploads/villas/`
- Automatic compression and optimization

### Production
- **Option 1**: Database storage (Base64 encoding)
- **Option 2**: Cloudinary integration (if configured)
- Fallback handling for reliability

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:setup:local` - Set up local database
- `npm run db:push` - Push schema changes
- `npm run db:studio` - Open Prisma Studio

## 🚀 Deployment Workflow

1. **Develop locally** using PostgreSQL (same as production)
2. **Test features** with identical database structure
3. **Push to GitHub** when ready
4. **Automatic deployment** to Vercel
5. **Zero configuration** - works identically in both environments

## 🔐 Authentication

### Demo Accounts
- **Admin**: `admin@example.com` / `admin123`
  - Full access to all villas and bookings
  - User management capabilities
  
- **Villa Owner**: `owner@example.com` / `owner123`
  - Manage own villas
  - View bookings for own properties

### Google OAuth (Optional)
Add Google OAuth credentials to environment variables:
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 📝 Environment Variables

### Required
- `DATABASE_URL` - Database connection string
- `NEXTAUTH_SECRET` - JWT signing secret
- `NEXTAUTH_URL` - Application URL

### Optional
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `IMAGE_STORAGE` - Image storage method (`postgresql`)
- `CLOUDINARY_*` - Cloudinary configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ using Next.js 14 and TypeScript
