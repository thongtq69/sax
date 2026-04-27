import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET /api/products/[id]/can-review
// Returns whether the current user can submit a review for this product
// (i.e., logged in, purchased it, and hasn't reviewed it yet).
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ canReview: false, hasPurchased: false, hasReviewed: false, reason: 'unauthenticated' })
    }

    const [purchasedItem, existingReview] = await Promise.all([
      prisma.orderItem.findFirst({
        where: {
          productId: params.id,
          order: {
            userId: session.user.id,
            status: { in: ['paid', 'processing', 'shipped', 'delivered'] },
          },
        },
        select: { id: true },
      }),
      prisma.review.findFirst({
        where: {
          productId: params.id,
          OR: [
            { userId: session.user.id },
            { sourceApi: `verified:${session.user.id}` },
          ],
        },
        select: { id: true },
      }),
    ])

    return NextResponse.json({
      canReview: Boolean(purchasedItem) && !existingReview,
      hasPurchased: Boolean(purchasedItem),
      hasReviewed: Boolean(existingReview),
    })
  } catch (error) {
    console.error('Error checking review eligibility:', error)
    return NextResponse.json(
      { canReview: false, hasPurchased: false, hasReviewed: false, error: 'Failed' },
      { status: 500 }
    )
  }
}
