import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    console.log('🔍 Checking database users...')
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true // Check if password exists
      }
    })

    const userInfo = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      hasPassword: !!user.password,
      passwordLength: user.password?.length || 0
    }))

    console.log('👥 Users in database:', userInfo)

    return NextResponse.json({
      message: 'Database Users Check',
      users: userInfo,
      count: users.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('💥 Database check error:', error)
    return NextResponse.json({
      error: 'Failed to check database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
