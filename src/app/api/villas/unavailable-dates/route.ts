import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { villaId, date, reason } = await request.json()

    // Verify villa ownership or admin access
    if (session.user.role !== 'ADMIN') {
      const villa = await prisma.villa.findUnique({
        where: { id: villaId },
        select: { ownerId: true }
      })

      if (!villa || villa.ownerId !== session.user.id) {
        return NextResponse.json(
          { error: 'Unauthorized to modify this villa' },
          { status: 403 }
        )
      }
    }

    // Check if date is already booked
    const existingBooking = await prisma.booking.findFirst({
      where: {
        villaId,
        status: {
          in: ['CONFIRMED', 'PENDING']
        },
        checkIn: {
          lte: new Date(date)
        },
        checkOut: {
          gt: new Date(date)
        }
      }
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Cannot mark booked date as unavailable' },
        { status: 400 }
      )
    }

    // Create unavailable date
    const unavailableDate = await prisma.unavailableDate.create({
      data: {
        villaId,
        date: new Date(date),
        reason: reason || 'Manual block'
      }
    })

    return NextResponse.json({
      success: true,
      unavailableDate
    })
  } catch (error) {
    console.error('Error creating unavailable date:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { villaId, date } = await request.json()

    // Verify villa ownership or admin access
    if (session.user.role !== 'ADMIN') {
      const villa = await prisma.villa.findUnique({
        where: { id: villaId },
        select: { ownerId: true }
      })

      if (!villa || villa.ownerId !== session.user.id) {
        return NextResponse.json(
          { error: 'Unauthorized to modify this villa' },
          { status: 403 }
        )
      }
    }

    // Remove unavailable date
    await prisma.unavailableDate.deleteMany({
      where: {
        villaId,
        date: new Date(date)
      }
    })

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Error removing unavailable date:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
