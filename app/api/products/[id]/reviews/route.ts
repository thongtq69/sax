import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/products/[id]/reviews - Get reviews for a product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: params.id },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(reviews)
  } catch (error: any) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST /api/products/[id]/reviews - Create a new review
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { buyerName, rating, message, date } = body

    if (!buyerName || !rating || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const review = await prisma.review.create({
      data: {
        productId: params.id,
        buyerName,
        rating: parseInt(rating),
        message,
        date: date ? new Date(date) : new Date(),
      },
    })

    // Update product rating and review count
    const allReviews = await prisma.review.findMany({
      where: { productId: params.id },
      select: { rating: true },
    })

    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0)
    const avgRating = totalRating / allReviews.length

    await prisma.product.update({
      where: { id: params.id },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length,
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error: any) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}

