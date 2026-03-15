import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

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
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to write a review.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { buyerName, rating, message, date } = body
    const ratingValue = parseInt(rating)

    if (!message || Number.isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return NextResponse.json(
        { error: 'Invalid input', message: 'Rating must be from 1 to 5 and message is required.' },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      select: { id: true },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const purchasedOrderItem = await prisma.orderItem.findFirst({
      where: {
        productId: params.id,
        order: {
          userId: session.user.id,
          status: {
            in: ['paid', 'processing', 'shipped', 'delivered'],
          },
        },
      },
      select: { id: true },
    })

    if (!purchasedOrderItem) {
      return NextResponse.json(
        {
          error: 'Review not eligible',
          message: 'You can review this product after purchase.',
        },
        { status: 403 }
      )
    }

    const reviewerToken = `verified:${session.user.id}`
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: params.id,
        sourceApi: reviewerToken,
      },
      select: { id: true },
    })

    if (existingReview) {
      return NextResponse.json(
        {
          error: 'Duplicate review',
          message: 'You have already reviewed this product.',
        },
        { status: 409 }
      )
    }

    const review = await prisma.review.create({
      data: {
        productId: params.id,
        buyerName: session.user.name || buyerName || 'Verified Buyer',
        rating: ratingValue,
        message,
        date: date ? new Date(date) : new Date(),
        sourceApi: reviewerToken,
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
