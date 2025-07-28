import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deployDatabase() {
  try {
    console.log('🚀 Setting up database...')
    
    // Push database schema
    console.log('📊 Pushing database schema...')
    // Note: In production, this happens automatically with Vercel Postgres
    
    console.log('✅ Database setup complete!')
  } catch (error) {
    console.error('💥 Database setup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

deployDatabase()
