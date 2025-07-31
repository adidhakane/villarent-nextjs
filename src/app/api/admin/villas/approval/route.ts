import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { villaId, isApproved } = await request.json()

    if (!villaId || typeof isApproved !== 'boolean') {
      return NextResponse.json(
        { error: 'Villa ID and approval status are required' },
        { status: 400 }
      )
    }

    const updatedVilla = await prisma.villa.update({
      where: { id: villaId },
      data: { isApproved },
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
      villa: updatedVilla,
      message: `Villa ${isApproved ? 'approved' : 'rejected'} successfully`
    })
  } catch (error) {
    console.error('Villa approval update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
