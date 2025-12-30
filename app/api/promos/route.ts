import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/promos - Get all promo banners
export async function GET(request: NextRequest) {
  try {
    const promos = await prisma.promoBanner.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(promos)
  } catch (error) {
    console.error('Error fetching promo banners:', error)
    return NextResponse.json(
      { error: 'Failed to fetch promo banners' },
      { status: 500 }
    )
  }
}

// POST /api/promos - Create a new promo banner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, image, ctaText, ctaLink } = body

    if (!title || !description || !image || !ctaText || !ctaLink) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const promo = await prisma.promoBanner.create({
      data: {
        title,
        description,
        image,
        ctaText,
        ctaLink,
      },
    })

    return NextResponse.json(promo, { status: 201 })
  } catch (error) {
    console.error('Error creating promo banner:', error)
    return NextResponse.json(
      { error: 'Failed to create promo banner' },
      { status: 500 }
    )
  }
}

