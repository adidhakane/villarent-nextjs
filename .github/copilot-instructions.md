<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Villa Rental Management System - Copilot Instructions

## Project Overview
This is a Next.js 14 TypeScript project for a villa rental management system with three types of users:
1. **Villa Owners** - Register and manage their villas, view bookings calendar
2. **Admin Team** - Manage all villas, approve registrations, handle availability
3. **Public Users** - Search and view available villas (no registration required)

## Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth and credentials
- **State Management**: TanStack Query for server state
- **Forms**: React Hook Form with Zod validation

## Key Features
- Villa registration and management
- Calendar-based availability system
- Location-based villa search
- Role-based authentication (Admin, Villa Owner)
- Real-time booking management
- Image upload and management
- Responsive design with modern UI

## Code Guidelines
- Use TypeScript for all files
- Implement proper error handling
- Follow Next.js 14 App Router patterns
- Use Prisma for database operations
- Implement proper validation with Zod schemas
- Use TanStack Query for data fetching
- Follow responsive design principles
- Maintain clean component architecture

## Database Schema
- Users: Authentication and role management
- Villas: Property information and management
- Bookings: Reservation tracking
- UnavailableDates: Calendar availability management

## Important Notes
- Public villa search requires no authentication
- Villa owners can only manage their own properties
- Admins have full access to all villas and bookings
- Calendar system tracks both bookings and manual unavailable dates
- Focus on scalable, team-friendly code structure
