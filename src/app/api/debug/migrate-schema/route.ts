import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    console.log('🔄 Updating database schema for PostgreSQL arrays...')
    
    // Update amenities column to use array type
    await prisma.$executeRaw`
      ALTER TABLE villas 
      ALTER COLUMN amenities TYPE TEXT[] 
      USING string_to_array(amenities, ',')
    `
    
    // Update images column to use array type  
    await prisma.$executeRaw`
      ALTER TABLE villas 
      ALTER COLUMN images TYPE TEXT[] 
      USING string_to_array(images, ',')
    `
    
    console.log('✅ Database schema updated successfully!')
    
    return NextResponse.json({
      success: true,
      message: 'Database schema updated to use arrays'
    })
  } catch (error) {
    console.error('💥 Schema update error:', error)
    return NextResponse.json({
      error: 'Schema update failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
