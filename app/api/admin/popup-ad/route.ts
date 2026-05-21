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
    const { title, description, image, ctaText, ctaLink, isActive, isHtml, htmlContent } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (isHtml) {
      if (!htmlContent) {
        return NextResponse.json({ error: 'HTML content is required for HTML popups' }, { status: 400 })
      }
    } else {
      if (!image) {
        return NextResponse.json({ error: 'Image is required for standard template' }, { status: 400 })
      }
    }

    const popupAd = await prisma.popupAd.create({
      data: {
        title,
        description: description || '',
        image: image || null,
        ctaText: ctaText || 'Xem ngay',
        ctaLink: ctaLink || '/',
        isHtml: isHtml ?? false,
        htmlContent: htmlContent || null,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(popupAd, { status: 201 })
  } catch (error) {
    console.error('Error creating popup ad:', error)
    return NextResponse.json({ error: 'Failed to create popup ad' }, { status: 500 })
  }
}
