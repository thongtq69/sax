import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/promos - Get all promo banners
export async function GET(request: NextRequest) {
  try {
    // Don't call $connect() explicitly - Prisma will connect on first query
    const promos = await prisma.promoBanner.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(promos)
  } catch (error: any) {
    console.error('Error fetching promo banners:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch promo banners',
        message: error?.message || 'Unknown error',
        code: error?.code || 'UNKNOWN_ERROR',
      },
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

