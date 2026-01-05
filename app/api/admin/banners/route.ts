import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/banners - Get all banners
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const where: any = {}
    if (activeOnly) {
      where.isActive = true
    }

    const banners = await prisma.banner.findMany({
      where,
      orderBy: {
        order: 'asc',
      },
    })

    return NextResponse.json(banners)
  } catch (error: any) {
    console.error('Error fetching banners:', error)
    return NextResponse.json(
      { error: 'Failed to fetch banners', message: error?.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/banners - Create a new banner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, subtitle, image, link, buttonText, order, isActive } = body

    // Validate required fields
    if (!title || !image) {
      return NextResponse.json(
        { error: 'Validation failed', details: ['title and image are required'] },
        { status: 400 }
      )
    }

    // Get the highest order number if not provided
    let bannerOrder = order
    if (bannerOrder === undefined || bannerOrder === null) {
      const lastBanner = await prisma.banner.findFirst({
        orderBy: { order: 'desc' },
        select: { order: true },
      })
      bannerOrder = (lastBanner?.order ?? -1) + 1
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle: subtitle || null,
        image,
        link: link || null,
        buttonText: buttonText || null,
        order: bannerOrder,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json(banner, { status: 201 })
  } catch (error: any) {
    console.error('Error creating banner:', error)
    return NextResponse.json(
      { error: 'Failed to create banner', message: error?.message },
      { status: 500 }
    )
  }
}
