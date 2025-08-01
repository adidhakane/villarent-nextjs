import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { transformVillasForAPI } from '@/lib/utils/villa-transform'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('Owner villas API called by:', session?.user?.email, 'Role:', session?.user?.role)
    
    if (!session?.user?.id) {
      console.log('❌ No session found for my-villas')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('✅ Owner authorization successful, fetching villas for user:', session.user.id)

    // First get villas without JSON fields to avoid parsing errors
    const rawVillas = await prisma.villa.findMany({
      where: {
        ownerId: session.user.id
      },
      select: {
        id: true,
        name: true,
        description: true,
        location: true,
        address: true,
        maxGuests: true,
        bedrooms: true,
        bathrooms: true,
        pricePerNight: true,
        weekdayPrice: true,
        fridayPrice: true,
        saturdayPrice: true,
        sundayPrice: true,
        ownerPhone: true,
        ownerEmail: true,
        checkInTime: true,
        checkOutTime: true,
        adminWeekdayPrice: true,
        adminSaturdayPrice: true,
        adminSundayPrice: true,
        googleDriveLink: true,
        isApproved: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
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

    // Now safely add JSON fields for each villa
    const villas = await Promise.all(rawVillas.map(async (villa) => {
      try {
        // Try to get the JSON fields safely
        const villaWithJson = await prisma.villa.findUnique({
          where: { id: villa.id },
          select: {
            amenities: true,
            images: true
          }
        })
        
        return {
          ...villa,
          amenities: villaWithJson?.amenities || [],
          images: villaWithJson?.images || []
        }
      } catch (jsonError) {
        console.error(`Failed to get JSON fields for villa ${villa.id}:`, jsonError)
        // Return villa without JSON fields if they're malformed
        return {
          ...villa,
          amenities: [],
          images: []
        }
      }
    }))

    // Transform villas to parse JSON fields
    let transformedVillas
    try {
      transformedVillas = transformVillasForAPI(villas)
      console.log(`Successfully transformed ${transformedVillas.length} villas for owner dashboard`)
    } catch (transformError) {
      console.error('Villa transformation failed in my-villas:', transformError)
      console.error('Raw villa data that failed:', JSON.stringify(villas, null, 2))
      return NextResponse.json({
        success: false,
        error: 'Villa data transformation failed',
        details: transformError instanceof Error ? transformError.message : 'Unknown transformation error'
      }, { status: 500 })
    }

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
