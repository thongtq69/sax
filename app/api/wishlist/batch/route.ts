import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/wishlist/batch?ids=id1,id2,id3
// Returns array of product IDs that are in user's wishlist
export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json([])
        }

        const productIds = request.nextUrl.searchParams.get('ids')?.split(',').filter(Boolean)

        if (!productIds || productIds.length === 0) {
            return NextResponse.json([])
        }

        const wishlistItems = await prisma.wishlist.findMany({
            where: {
                userId: session.user.id,
                productId: { in: productIds },
            },
            select: {
                productId: true,
            },
        })

        const wishlistedIds = wishlistItems.map((item: { productId: string }) => item.productId)

        return NextResponse.json(wishlistedIds, {
            headers: {
                'Cache-Control': 'private, max-age=30', // Cache for 30 seconds per user
            },
        })
    } catch (error) {
        console.error('Error fetching batch wishlist:', error)
        return NextResponse.json([])
    }
}
