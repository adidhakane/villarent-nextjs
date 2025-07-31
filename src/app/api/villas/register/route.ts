import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { villaRegistrationSchema } from '@/lib/validations'
import { uploadImage } from '@/lib/upload'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Handle FormData for file uploads
    const formData = await request.formData()
    
    // Extract form fields
    const body: any = {}
    
    // Get all text fields
    const textFields = [
      'name', 'description', 'location', 'address', 'maxGuests', 'bedrooms', 
      'bathrooms', 'pricePerNight', 'ownerPhone', 'ownerEmail', 'weekdayPrice',
      'fridayPrice', 'saturdayPrice', 'sundayPrice', 'checkInTime', 'checkOutTime',
      'adminWeekdayPrice', 'adminSaturdayPrice', 'adminSundayPrice', 'googleDriveLink'
    ]
    
    textFields.forEach(field => {
      const value = formData.get(field)
      if (value !== null && value !== '') {
        // Convert numeric fields
        if (['maxGuests', 'bedrooms', 'bathrooms'].includes(field)) {
          body[field] = parseInt(value as string) || 0
        } else if (['pricePerNight', 'weekdayPrice', 'fridayPrice', 'saturdayPrice', 'sundayPrice', 'adminWeekdayPrice', 'adminSaturdayPrice', 'adminSundayPrice'].includes(field)) {
          const numValue = parseFloat(value as string)
          if (!isNaN(numValue)) {
            body[field] = numValue
          }
          // Don't set the field if it's NaN or empty for optional admin fields
        } else {
          body[field] = value
        }
      }
    })
    
    // Handle amenities - try multiple approaches
    let amenitiesArray: string[] = []
    
    // First, try to get as JSON string (our manual addition)
    const amenitiesJson = formData.get('amenitiesJson')
    if (amenitiesJson) {
      try {
        amenitiesArray = JSON.parse(amenitiesJson as string)
      } catch (e) {
        console.log('Failed to parse amenities JSON:', e)
      }
    }
    
    // If no JSON, try getting all amenities values (from checkboxes)
    if (amenitiesArray.length === 0) {
      const allAmenities = formData.getAll('amenities')
      
      // Filter out empty strings and non-string values
      amenitiesArray = allAmenities
        .filter(item => item && typeof item === 'string' && item.trim() !== '')
        .map(item => item.toString().trim())
    }
    
    body.amenities = amenitiesArray
    
    // Handle cover image
    const coverImage = formData.get('coverImage') as File
    let imageUrl = ''
    
    if (coverImage && coverImage.size > 0) {
      try {
        imageUrl = await uploadImage(coverImage)
        console.log('✅ Image uploaded successfully:', imageUrl)
      } catch (error) {
        console.error('❌ Error uploading image:', error)
        // Fallback to placeholder if image upload fails
        imageUrl = `placeholder-${Date.now()}-${coverImage.name}`
      }
    }
    
    // Set images array with cover image
    body.images = imageUrl ? [imageUrl] : []
    
    // Debug: Log the body data
    console.log('📝 Form data received:', JSON.stringify(body, null, 2))
    
    // Validate input with better error handling
    let validatedData
    try {
      validatedData = villaRegistrationSchema.parse(body)
    } catch (error: any) {
      // Handle Zod validation errors
      console.log('❌ Validation error:', error)
      if (error.errors) {
        const validationErrors: Record<string, string> = {}
        error.errors.forEach((err: any) => {
          const field = err.path.join('.')
          validationErrors[field] = err.message
          console.log(`❌ Field "${field}": ${err.message}`)
        })
        
        return NextResponse.json(
          { 
            error: 'Validation failed',
            validation: validationErrors 
          },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Invalid data provided' },
        { status: 400 }
      )
    }
    
    // Extract fields
    const { 
      name, 
      description, 
      location, 
      address, 
      maxGuests, 
      bedrooms, 
      bathrooms, 
      amenities, 
      images, 
      pricePerNight,
      // New fields
      ownerPhone,
      ownerEmail,
      weekdayPrice,
      fridayPrice,
      saturdayPrice,
      sundayPrice,
      checkInTime,
      checkOutTime,
      // Admin fields
      adminWeekdayPrice,
      adminSaturdayPrice,
      adminSundayPrice,
      googleDriveLink
    } = validatedData

    // Create villa data
    const villaData = {
      name,
      description,
      location,
      address,
      maxGuests,
      bedrooms,
      bathrooms,
      // Handle arrays - SQLite uses JSON strings, PostgreSQL uses native arrays
      amenities: Array.isArray(amenities) ? JSON.stringify(amenities) : amenities,
      images: Array.isArray(images) ? JSON.stringify(images) : images,
      pricePerNight,
      // New fields
      ownerPhone,
      ownerEmail,
      weekdayPrice,
      fridayPrice,
      saturdayPrice,
      sundayPrice,
      checkInTime,
      checkOutTime,
      // Admin fields (only if user is admin)
      adminWeekdayPrice: session.user.role === 'ADMIN' ? adminWeekdayPrice : null,
      adminSaturdayPrice: session.user.role === 'ADMIN' ? adminSaturdayPrice : null,
      adminSundayPrice: session.user.role === 'ADMIN' ? adminSundayPrice : null,
      googleDriveLink: session.user.role === 'ADMIN' ? googleDriveLink : null,
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
