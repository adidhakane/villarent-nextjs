import { NextRequest, NextResponse } from 'next/server'
import { prisma, checkDatabaseConnection } from '@/lib/db'
import { initializeDatabase } from '@/lib/init-db'

export async function GET(request: NextRequest) {
  try {
    // Check database connection
    const isConnected = await checkDatabaseConnection()
    
    if (!isConnected) {
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    // Check if database has data
    const userCount = await prisma.user.count()
    const villaCount = await prisma.villa.count()

    // Initialize database if empty (only if no users exist)
    if (userCount === 0) {
      console.log('🚀 Database appears empty, initializing with demo data...')
      await initializeDatabase()
    }

    return NextResponse.json({
      status: 'healthy',
      database: {
        connected: true,
        users: userCount,
        villas: villaCount
      },
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
