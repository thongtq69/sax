import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all popup ads
export async function GET() {
  try {
    const popupAds = await prisma.popupAd.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(popupAds)
  } catch (error) {
    console.error('Error fetching popup ads:', error)
    return NextResponse.json({ error: 'Failed to fetch popup ads' }, { status: 500 })
  }
}

// POST create new popup ad
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, image, ctaText, ctaLink, isActive } = body

    if (!title || !image) {
      return NextResponse.json({ error: 'Title and image are required' }, { status: 400 })
    }

    const popupAd = await prisma.popupAd.create({
      data: {
        title,
        description: description || '',
        image,
        ctaText: ctaText || 'Xem ngay',
        ctaLink: ctaLink || '/',
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(popupAd, { status: 201 })
  } catch (error) {
    console.error('Error creating popup ad:', error)
    return NextResponse.json({ error: 'Failed to create popup ad' }, { status: 500 })
  }
}
