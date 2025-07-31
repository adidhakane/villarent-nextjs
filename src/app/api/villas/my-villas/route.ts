import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { transformVillasForAPI } from '@/lib/utils/villa-transform'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const villas = await prisma.villa.findMany({
      where: {
        ownerId: session.user.id
      },
      include: {
        bookings: {
          where: {
            status: {
              in: ['CONFIRMED', 'PENDING']
            }
          },
          orderBy: {
            checkIn: 'asc'
          }
        },
        unavailableDates: {
          orderBy: {
            date: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform villas to parse JSON fields
    const transformedVillas = transformVillasForAPI(villas)

    return NextResponse.json({
      success: true,
      villas: transformedVillas
    })
  } catch (error) {
    console.error('Error fetching villas:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
