import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('🔍 Checking villa table structure...')
    
    // Get table info
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'villas' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `
    
    console.log('📊 Villa table structure:', result)
    
    return NextResponse.json({
      message: 'Villa table structure',
      columns: result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('💥 Table check error:', error)
    return NextResponse.json({
      error: 'Failed to check table structure',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
