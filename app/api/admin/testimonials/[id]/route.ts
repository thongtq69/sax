import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/admin/testimonials/[id] - Get a single review/testimonial
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const review = await prisma.review.findUnique({
      where: { id },
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

    if (!review) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(review)
  } catch (error: any) {
    console.error('Error fetching testimonial:', error)
    return NextResponse.json(
      { error: 'Failed to fetch testimonial', message: error?.message },
      { status: 500 }
    )
  }
}

// PUT /api/admin/testimonials/[id] - Update a review/testimonial
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { buyerName, message, rating, productId, customProductName, date } = body

    // Check if review exists
    const existingReview = await prisma.review.findUnique({
      where: { id },
    })

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      )
    }

    // Validate rating if provided
    if (rating !== undefined) {
      const ratingValue = parseInt(rating)
      if (ratingValue < 1 || ratingValue > 5) {
        return NextResponse.json(
          { 
            error: 'Invalid rating', 
            message: 'Rating must be between 1 and 5 stars' 
          },
          { status: 400 }
        )
      }
    }

    // If changing product, verify new product exists
    if (productId && productId !== existingReview.productId) {
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

    // Build update data - handle customProductName clearing productId and vice versa
    const updateData: any = {}
    if (buyerName !== undefined) updateData.buyerName = buyerName
    if (message !== undefined) updateData.message = message
    if (rating !== undefined) updateData.rating = parseInt(rating)
    if (date !== undefined) updateData.date = new Date(date)
    
    // Handle productId and customProductName - they are mutually exclusive
    if (customProductName) {
      updateData.customProductName = customProductName
      updateData.productId = null
    } else if (productId) {
      updateData.productId = productId
      updateData.customProductName = null
    }

    const review = await prisma.review.update({
      where: { id },
      data: updateData,
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

    // Update product review stats for both old and new product if changed
    const productsToUpdate: string[] = []
    if (review.productId) productsToUpdate.push(review.productId)
    if (existingReview.productId && existingReview.productId !== review.productId) {
      productsToUpdate.push(existingReview.productId)
    }

    for (const pid of productsToUpdate) {
      if (!pid) continue
      const productReviews = await prisma.review.findMany({
        where: { productId: pid },
        select: { rating: true },
      })
      
      if (productReviews.length > 0) {
        const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
        await prisma.product.update({
          where: { id: pid },
          data: {
            reviewCount: productReviews.length,
            rating: Math.round(avgRating * 10) / 10,
          },
        })
      } else {
        await prisma.product.update({
          where: { id: pid },
          data: {
            reviewCount: 0,
            rating: 0,
          },
        })
      }
    }

    return NextResponse.json(review)
  } catch (error: any) {
    console.error('Error updating testimonial:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update testimonial', message: error?.message },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/testimonials/[id] - Delete a review/testimonial
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if review exists
    const existingReview = await prisma.review.findUnique({
      where: { id },
    })

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      )
    }

    const productId = existingReview.productId

    await prisma.review.delete({
      where: { id },
    })

    // Update product review stats only if productId exists
    if (productId) {
      const productReviews = await prisma.review.findMany({
        where: { productId },
        select: { rating: true },
      })
      
      if (productReviews.length > 0) {
        const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
        await prisma.product.update({
          where: { id: productId },
          data: {
            reviewCount: productReviews.length,
            rating: Math.round(avgRating * 10) / 10,
          },
        })
      } else {
        await prisma.product.update({
          where: { id: productId },
          data: {
            reviewCount: 0,
            rating: 0,
          },
        })
      }
    }

    return NextResponse.json({ message: 'Testimonial deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting testimonial:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to delete testimonial', message: error?.message },
      { status: 500 }
    )
  }
}
