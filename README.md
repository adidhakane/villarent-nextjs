# Villa Rental Management System

A comprehensive villa rental management platform built with Next.js 14, TypeScript, and modern web technologies.

## 🏡 Project Overview

This platform simplifies the villa rental process for three types of users:

### **Villa Owners**
- Register their villas with detailed information
- Manage villa availability through an intuitive calendar
- View and update booking status
- Track rental performance

### **Admin Team**
- Access and manage all registered villas
- Approve new villa registrations
- Update availability for any villa
- Monitor platform activity

### **Public Users**
- Search villas by location, dates, and guest count
- View detailed villa information
- No registration required for browsing
- Easy booking inquiry process

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod validation
- **Deployment**: Ready for Vercel

## 📁 Project Structure

```
villa-rental-system/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (public)/          # Public routes (no auth)
│   │   ├── (protected)/       # Protected routes
│   │   ├── api/               # API routes
│   │   └── auth/              # Authentication pages
│   ├── components/            # Reusable UI components
│   │   ├── ui/                # Shadcn/ui components
│   │   ├── forms/             # Form components
│   │   └── calendar/          # Calendar components
│   ├── lib/                   # Utility functions
│   │   ├── auth/              # Authentication config
│   │   └── validations/       # Zod schemas
│   └── types/                 # TypeScript type definitions
├── prisma/                    # Database schema and migrations
└── public/                    # Static assets
```

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd villa-rental-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your database and authentication credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/villa_rental_db"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

4. **Set up the database**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

### Core Models
- **User**: Authentication and role management
- **Villa**: Property information and details
- **Booking**: Reservation tracking and management
- **UnavailableDate**: Calendar availability system

### User Roles
- `ADMIN`: Full platform access
- `VILLA_OWNER`: Manage own villas

## 🔑 Key Features

### Villa Management
- ✅ Villa registration with detailed information
- ✅ Image upload and gallery management
- ✅ Amenities and pricing configuration
- ✅ Location-based categorization

### Calendar System
- ✅ Monthly view with availability status
- ✅ Booking visualization
- ✅ Manual unavailable date setting
- ✅ Real-time updates

### Search & Discovery
- ✅ Location-based villa search
- ✅ Date range availability filtering
- ✅ Guest count and amenity filters
- ✅ Responsive villa listings

### Authentication
- ✅ Google OAuth integration
- ✅ Email/password authentication
- ✅ Role-based access control
- ✅ Secure session management

## 🚀 Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Database operations
npx prisma studio          # Open database GUI
npx prisma db push         # Push schema changes
npx prisma generate        # Generate Prisma client
npx prisma migrate dev     # Create and apply migration
```

## 📱 Responsive Design

The application is fully responsive and optimized for:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1440px+)

## 🎨 UI Components

Built with Shadcn/ui for consistency and accessibility:
- Form components with validation
- Calendar and date pickers
- Cards and layouts
- Buttons and navigation
- Modals and dialogs

## 🔒 Security Features

- JWT-based authentication
- CSRF protection
- Input validation and sanitization
- SQL injection prevention (Prisma)
- Environment variable protection

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Manual Deployment
1. Build the application: `npm run build`
2. Start the production server: `npm start`
3. Ensure PostgreSQL database is accessible

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@villarental.com or join our Slack channel.

---

**Built with ❤️ by the Villa Rental Team**
