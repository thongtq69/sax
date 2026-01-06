import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/testimonials - Get all reviews/testimonials
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const rating = searchParams.get('rating')
    const productId = searchParams.get('productId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const where: any = {}
    
    if (rating) {
      where.rating = parseInt(rating)
    }
    
    if (productId) {
      where.productId = productId
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ])

    // Get rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      _count: {
        rating: true,
      },
    })

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      ratingDistribution: ratingDistribution.reduce((acc, item) => {
        acc[item.rating] = item._count.rating
        return acc
      }, {} as Record<number, number>),
    })
  } catch (error: any) {
    console.error('Error fetching testimonials:', error)
    return NextResponse.json(
      { error: 'Failed to fetch testimonials', message: error?.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/testimonials - Create a new review/testimonial
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { buyerName, message, rating, productId, customProductName, date } = body

    // Validate required fields - either productId or customProductName is required
    if (!buyerName || !message || (!productId && !customProductName)) {
      return NextResponse.json(
        { error: 'Validation failed', details: ['buyerName, message, and either productId or customProductName are required'] },
        { status: 400 }
      )
    }

    // Validate rating
    const ratingValue = rating ? parseInt(rating) : 5
    if (ratingValue < 1 || ratingValue > 5) {
      return NextResponse.json(
        { error: 'Validation failed', details: ['rating must be between 1 and 5'] },
        { status: 400 }
      )
    }

    // If productId is provided, check if product exists
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      })

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }
    }

    const review = await prisma.review.create({
      data: {
        buyerName,
        message,
        rating: ratingValue,
        productId: productId || null,
        customProductName: customProductName || null,
        date: date ? new Date(date) : new Date(),
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    // Update product review count and rating if productId is provided
    if (productId) {
      const productReviews = await prisma.review.findMany({
        where: { productId },
        select: { rating: true },
      })
      
      const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
      
      await prisma.product.update({
        where: { id: productId },
        data: {
          reviewCount: productReviews.length,
          rating: Math.round(avgRating * 10) / 10,
        },
      })
    }

    return NextResponse.json(review, { status: 201 })
  } catch (error: any) {
    console.error('Error creating testimonial:', error)
    return NextResponse.json(
      { error: 'Failed to create testimonial', message: error?.message },
      { status: 500 }
    )
  }
}
