import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/promos/[id] - Get a single promo banner
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const promo = await prisma.promoBanner.findUnique({
      where: { id: params.id },
    })

    if (!promo) {
      return NextResponse.json(
        { error: 'Promo banner not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(promo)
  } catch (error) {
    console.error('Error fetching promo banner:', error)
    return NextResponse.json(
      { error: 'Failed to fetch promo banner' },
      { status: 500 }
    )
  }
}

// PUT /api/promos/[id] - Update a promo banner
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, description, image, ctaText, ctaLink } = body

    const promo = await prisma.promoBanner.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(image && { image }),
        ...(ctaText && { ctaText }),
        ...(ctaLink && { ctaLink }),
      },
    })

    return NextResponse.json(promo)
  } catch (error: any) {
    console.error('Error updating promo banner:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Promo banner not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update promo banner' },
      { status: 500 }
    )
  }
}

// DELETE /api/promos/[id] - Delete a promo banner
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.promoBanner.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Promo banner deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting promo banner:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Promo banner not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to delete promo banner' },
      { status: 500 }
    )
  }
}

