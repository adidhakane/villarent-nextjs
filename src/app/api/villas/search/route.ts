import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { transformVillasForAPI } from '@/lib/utils/villa-transform'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location')
    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')
    const guests = searchParams.get('guests')

    if (!location || !checkIn || !checkOut || !guests) {
      return NextResponse.json(
        { error: 'Missing required search parameters' },
        { status: 400 }
      )
    }

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const guestCount = parseInt(guests)

    // Find villas that match criteria and are available
    const villas = await prisma.villa.findMany({
      where: {
        location: {
          contains: location
          // Note: SQLite doesn't support mode: 'insensitive', using contains which is case-sensitive
        },
        maxGuests: {
          gte: guestCount
        },
        isApproved: true,
        isActive: true,
        // Exclude villas with conflicting bookings
        NOT: {
          bookings: {
            some: {
              status: {
                in: ['CONFIRMED', 'PENDING']
              },
              OR: [
                {
                  // Booking starts during our stay
                  checkIn: {
                    gte: checkInDate,
                    lt: checkOutDate
                  }
                },
                {
                  // Booking ends during our stay
                  checkOut: {
                    gt: checkInDate,
                    lte: checkOutDate
                  }
                },
                {
                  // Booking completely encompasses our stay
                  AND: [
                    {
                      checkIn: {
                        lte: checkInDate
                      }
                    },
                    {
                      checkOut: {
                        gte: checkOutDate
                      }
                    }
                  ]
                }
              ]
            }
          }
        },
        // Exclude villas with unavailable dates in the range
        unavailableDates: {
          none: {
            date: {
              gte: checkInDate,
              lt: checkOutDate
            }
          }
        }
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
        // Owner pricing fields (not exposed to users)
        weekdayPrice: true,
        fridayPrice: true,
        saturdayPrice: true,
        sundayPrice: true,
        // Admin pricing fields (displayed to users)
        adminWeekdayPrice: true,
        adminSaturdayPrice: true,
        adminSundayPrice: true,
        amenities: true,
        images: true,
        googleDriveLink: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        pricePerNight: 'asc'
      }
    })

    // Transform villas to parse JSON fields
    const transformedVillas = transformVillasForAPI(villas)

    return NextResponse.json({
      success: true,
      villas: transformedVillas,
      searchCriteria: {
        location,
        checkIn,
        checkOut,
        guests: guestCount
      }
    })
  } catch (error) {
    console.error('Villa search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
