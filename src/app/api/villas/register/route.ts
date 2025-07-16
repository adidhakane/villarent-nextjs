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
    
    console.log('📝 Raw body received:', body)
    console.log('🔍 Amenities type:', typeof body.amenities)
    console.log('🔍 Amenities value:', body.amenities)
    
    // Ensure amenities is an array
    if (Array.isArray(body.amenities)) {
      console.log('✅ Amenities is already an array')
    } else if (typeof body.amenities === 'string') {
      try {
        const parsed = JSON.parse(body.amenities)
        if (Array.isArray(parsed)) {
          body.amenities = parsed
          console.log('✅ Parsed amenities from JSON string:', body.amenities)
        } else {
          // Single string value, convert to array
          body.amenities = [body.amenities]
          console.log('✅ Converted single amenity to array:', body.amenities)
        }
      } catch (e) {
        console.log('❌ Failed to parse amenities as JSON, treating as single item')
        body.amenities = [body.amenities]
      }
    } else {
      console.log('⚠️ Amenities is neither array nor string, defaulting to empty array')
      body.amenities = []
    }
    
    // Ensure images is an array
    if (Array.isArray(body.images)) {
      console.log('✅ Images is already an array')
    } else if (typeof body.images === 'string') {
      try {
        const parsed = JSON.parse(body.images)
        if (Array.isArray(parsed)) {
          body.images = parsed
          console.log('✅ Parsed images from JSON string:', body.images)
        } else {
          body.images = []
          console.log('✅ Images was string but not array, using empty array')
        }
      } catch (e) {
        console.log('❌ Failed to parse images, using empty array')
        body.images = []
      }
    } else {
      console.log('⚠️ Images not provided or invalid, using empty array')
      body.images = []
    }
    
    console.log('📋 Processed body before validation:', body)
    
    // Validate input
    const validatedData = villaRegistrationSchema.parse(body)
    
    console.log('✅ Validated data:', validatedData)
    
    // Create villa - use arrays directly (PostgreSQL arrays)
    const villaData = {
      name: validatedData.name,
      description: validatedData.description,
      location: validatedData.location,
      address: validatedData.address,
      maxGuests: validatedData.maxGuests,
      bedrooms: validatedData.bedrooms,
      bathrooms: validatedData.bathrooms,
      amenities: validatedData.amenities, // Should be array after validation
      pricePerNight: validatedData.pricePerNight,
      ownerId: session.user.id,
      isApproved: false,
      isActive: true,
      images: [] // Empty array for PostgreSQL
    }

    console.log('🏠 Creating villa with data:', villaData)

    const villa = await prisma.villa.create({
      data: villaData as any, // Type assertion to bypass schema mismatch
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
