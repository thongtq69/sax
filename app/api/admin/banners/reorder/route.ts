import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/admin/banners/reorder - Update banner order
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { bannerIds } = body

    // Validate input
    if (!Array.isArray(bannerIds) || bannerIds.length === 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: ['bannerIds must be a non-empty array'] },
        { status: 400 }
      )
    }

    // Update order for each banner
    const updatePromises = bannerIds.map((id: string, index: number) =>
      prisma.banner.update({
        where: { id },
        data: { order: index },
      })
    )

    await Promise.all(updatePromises)

    // Return updated banners in new order
    const banners = await prisma.banner.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(banners)
  } catch (error: any) {
    console.error('Error reordering banners:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'One or more banners not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to reorder banners', message: error?.message },
      { status: 500 }
    )
  }
}
