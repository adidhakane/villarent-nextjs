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
    
    // Validate input
    const validatedData = villaRegistrationSchema.parse(body)
    
    // Create villa
    const villa = await prisma.villa.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        location: validatedData.location,
        address: validatedData.address,
        maxGuests: validatedData.maxGuests,
        bedrooms: validatedData.bedrooms,
        bathrooms: validatedData.bathrooms,
        amenities: JSON.stringify(validatedData.amenities),
        pricePerNight: validatedData.pricePerNight,
        ownerId: session.user.id,
        isApproved: false, // Requires admin approval
        isActive: true,
        images: JSON.stringify([]) // Will be added later via image upload
      },
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
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
