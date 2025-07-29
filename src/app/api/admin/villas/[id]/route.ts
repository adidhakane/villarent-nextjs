import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { villaRegistrationSchema } from '@/lib/validations'

// GET - Fetch single villa for editing
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const villa = await prisma.villa.findUnique({
      where: { id: params.id },
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

    if (!villa) {
      return NextResponse.json(
        { error: 'Villa not found' },
        { status: 404 }
      )
    }

    // Parse JSON fields for frontend
    const transformedVilla = {
      ...villa,
      amenities: villa.amenities ? JSON.parse(villa.amenities as string) : [],
      images: villa.images ? JSON.parse(villa.images as string) : []
    }

    return NextResponse.json({ villa: transformedVilla })
  } catch (error) {
    console.error('Error fetching villa:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update villa
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    // Handle both JSON and FormData
    let body: any = {}
    const contentType = request.headers.get('content-type')
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle FormData for file uploads
      const formData = await request.formData()
      
      const textFields = [
        'name', 'description', 'location', 'address', 'maxGuests', 'bedrooms', 
        'bathrooms', 'pricePerNight', 'ownerPhone', 'ownerEmail', 'weekdayPrice',
        'fridayPrice', 'saturdayPrice', 'sundayPrice', 'checkInTime', 'checkOutTime',
        'adminWeekdayPrice', 'adminSaturdayPrice', 'adminSundayPrice', 'googleDriveLink'
      ]
      
      textFields.forEach(field => {
        const value = formData.get(field)
        if (value !== null && value !== '') {
          if (['maxGuests', 'bedrooms', 'bathrooms'].includes(field)) {
            body[field] = parseInt(value as string) || 0
          } else if (['pricePerNight', 'weekdayPrice', 'fridayPrice', 'saturdayPrice', 'sundayPrice', 'adminWeekdayPrice', 'adminSaturdayPrice', 'adminSundayPrice'].includes(field)) {
            const numValue = parseFloat(value as string)
            if (!isNaN(numValue)) {
              body[field] = numValue
            }
          } else {
            body[field] = value
          }
        }
      })
      
      // Handle amenities
      const amenitiesJson = formData.get('amenitiesJson')
      if (amenitiesJson) {
        try {
          body.amenities = JSON.parse(amenitiesJson as string)
        } catch (e) {
          body.amenities = []
        }
      }
      
      // Handle new cover image if uploaded
      const coverImage = formData.get('coverImage') as File
      if (coverImage && coverImage.size > 0) {
        try {
          const timestamp = Date.now()
          const fileExtension = coverImage.name.split('.').pop() || 'jpg'
          const fileName = `villa-${timestamp}.${fileExtension}`
          
          const bytes = await coverImage.arrayBuffer()
          const buffer = Buffer.from(bytes)
          
          const fs = require('fs')
          const path = require('path')
          const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'villas')
          
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true })
          }
          
          const filePath = path.join(uploadsDir, fileName)
          fs.writeFileSync(filePath, buffer)
          
          const imageUrl = `/uploads/villas/${fileName}`
          body.images = [imageUrl]
          
          console.log('✅ New image saved:', imageUrl)
        } catch (error) {
          console.error('❌ Error saving new image:', error)
        }
      }
    } else {
      // Handle JSON
      body = await request.json()
    }

    // Get existing villa to preserve images if no new image uploaded
    const existingVilla = await prisma.villa.findUnique({
      where: { id: params.id }
    })

    if (!existingVilla) {
      return NextResponse.json(
        { error: 'Villa not found' },
        { status: 404 }
      )
    }

    // If no new images provided, keep existing ones
    if (!body.images) {
      body.images = existingVilla.images ? JSON.parse(existingVilla.images as string) : []
    }

    console.log('📝 Villa update data:', JSON.stringify(body, null, 2))

    // Validate data
    let validatedData
    try {
      validatedData = villaRegistrationSchema.parse(body)
    } catch (error: any) {
      if (error.errors) {
        const validationErrors: Record<string, string> = {}
        error.errors.forEach((err: any) => {
          const field = err.path.join('.')
          validationErrors[field] = err.message
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

    // Update villa
    const updatedVilla = await prisma.villa.update({
      where: { id: params.id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        location: validatedData.location,
        address: validatedData.address,
        maxGuests: validatedData.maxGuests,
        bedrooms: validatedData.bedrooms,
        bathrooms: validatedData.bathrooms,
        amenities: Array.isArray(validatedData.amenities) ? JSON.stringify(validatedData.amenities) : validatedData.amenities,
        images: Array.isArray(validatedData.images) ? JSON.stringify(validatedData.images) : validatedData.images,
        pricePerNight: validatedData.pricePerNight,
        ownerPhone: validatedData.ownerPhone,
        ownerEmail: validatedData.ownerEmail,
        weekdayPrice: validatedData.weekdayPrice,
        fridayPrice: validatedData.fridayPrice,
        saturdayPrice: validatedData.saturdayPrice,
        sundayPrice: validatedData.sundayPrice,
        checkInTime: validatedData.checkInTime,
        checkOutTime: validatedData.checkOutTime,
        // Admin fields
        adminWeekdayPrice: validatedData.adminWeekdayPrice,
        adminSaturdayPrice: validatedData.adminSaturdayPrice,
        adminSundayPrice: validatedData.adminSundayPrice,
        googleDriveLink: validatedData.googleDriveLink
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

    return NextResponse.json({
      success: true,
      message: 'Villa updated successfully',
      villa: updatedVilla
    })
  } catch (error) {
    console.error('Villa update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
