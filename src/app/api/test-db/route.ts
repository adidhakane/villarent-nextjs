import { NextRequest, NextResponse } from 'next/server'
import { prisma, checkDatabaseConnection } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Basic connection test
    const isConnected = await checkDatabaseConnection()
    
    if (!isConnected) {
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    // Test basic queries
    const userCount = await prisma.user.count()
    const villaCount = await prisma.villa.count()

    // Test a sample villa query (similar to search)
    const sampleVillas = await prisma.villa.findMany({
      take: 1,
      where: {
        isApproved: true,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        location: true,
        amenities: true,
        images: true
      }
    })

    return NextResponse.json({
      status: 'healthy',
      database: {
        connected: true,
        users: userCount,
        villas: villaCount,
        sampleVilla: sampleVillas[0] || null
      },
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not Set'
    })
  } catch (error) {
    console.error('Database test failed:', error)
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
