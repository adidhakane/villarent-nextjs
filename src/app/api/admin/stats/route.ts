import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const [totalVillas, pendingApprovals, totalBookings, revenueData] = await Promise.all([
      prisma.villa.count(),
      prisma.villa.count({
        where: { isApproved: false }
      }),
      prisma.booking.count(),
      prisma.booking.aggregate({
        where: {
          status: 'CONFIRMED'
        },
        _sum: {
          totalAmount: true
        }
      })
    ])

    const stats = {
      totalVillas,
      pendingApprovals,
      totalBookings,
      totalRevenue: revenueData._sum.totalAmount || 0
    }

    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Admin stats fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
