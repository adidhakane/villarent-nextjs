import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    console.log('🚀 Manually setting up database tables...')
    
    // This will create tables if they don't exist
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL,
        "name" TEXT,
        "email" TEXT NOT NULL,
        "password" TEXT,
        "emailVerified" TIMESTAMP(3),
        "image" TEXT,
        "role" TEXT NOT NULL DEFAULT 'VILLA_OWNER',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      );
    `
    
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
    `
    
    console.log('✅ Database tables created successfully!')
    
    return NextResponse.json({
      success: true,
      message: 'Database setup completed'
    })
  } catch (error) {
    console.error('💥 Database setup error:', error)
    return NextResponse.json({
      error: 'Database setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
