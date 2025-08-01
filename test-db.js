// Test database connection
require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set')

const prisma = new PrismaClient()

async function testConnection() {
  try {
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // Try to create the database if it doesn't exist
    await prisma.$executeRaw`SELECT 1`
    console.log('✅ Database query successful!')
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    
    if (error.code === 'P1001') {
      console.log('💡 This usually means:')
      console.log('   1. PostgreSQL service is not running')
      console.log('   2. Wrong connection credentials')
      console.log('   3. Database does not exist')
    }
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
