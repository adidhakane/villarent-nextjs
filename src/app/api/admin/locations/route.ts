import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'

// GET all locations
export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      orderBy: { name: 'asc' }
    })
    
    return NextResponse.json({ locations })
  } catch (error) {
    console.error('Get locations error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    )
  }
}

// POST - Add new location (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { name } = await request.json()

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Location name is required' },
        { status: 400 }
      )
    }

    const trimmedName = name.trim()

    // Check if location already exists
    const existingLocation = await prisma.location.findUnique({
      where: { name: trimmedName }
    })

    if (existingLocation) {
      return NextResponse.json(
        { error: 'Location already exists' },
        { status: 409 }
      )
    }

    // Create new location
    const location = await prisma.location.create({
      data: { name: trimmedName }
    })

    return NextResponse.json({ 
      message: 'Location added successfully',
      location 
    })
  } catch (error) {
    console.error('Add location error:', error)
    return NextResponse.json(
      { error: 'Failed to add location' },
      { status: 500 }
    )
  }
}
