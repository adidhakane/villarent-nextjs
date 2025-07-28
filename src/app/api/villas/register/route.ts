import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { villaRegistrationSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Ensure amenities is an array
    if (Array.isArray(body.amenities)) {
      // Already an array, good!
    } else if (typeof body.amenities === 'string') {
      try {
        const parsed = JSON.parse(body.amenities)
        if (Array.isArray(parsed)) {
          body.amenities = parsed
        } else {
          body.amenities = [body.amenities]
        }
      } catch (e) {
        body.amenities = [body.amenities]
      }
    } else {
      body.amenities = []
    }
    
    // Ensure images is an array
    if (Array.isArray(body.images)) {
      // Already an array, good!
    } else if (typeof body.images === 'string') {
      try {
        const parsed = JSON.parse(body.images)
        if (Array.isArray(parsed)) {
          body.images = parsed
        } else {
          body.images = []
        }
      } catch (e) {
        body.images = []
      }
    } else {
      body.images = []
    }
    
    // Validate input
    const validatedData = villaRegistrationSchema.parse(body)
    
    // Create villa data
        const villaData = {
      name,
      description,
      location,
      address,
      maxGuests: parseInt(maxGuests),
      bedrooms: parseInt(bedrooms),
      bathrooms: parseInt(bathrooms),
      // Handle arrays - SQLite uses JSON strings, PostgreSQL uses native arrays
      amenities: process.env.NODE_ENV === 'production' 
        ? amenities 
        : JSON.stringify(amenities),
      images: process.env.NODE_ENV === 'production' 
        ? images 
        : JSON.stringify(images),
      pricePerNight: parseFloat(pricePerNight),
      ownerId: session.user.id
    }

    const villa = await prisma.villa.create({
      data: villaData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Villa registered successfully. Awaiting approval.',
        villa 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Villa registration error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    })
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
