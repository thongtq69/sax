import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/homepage-data - Combined endpoint for homepage data
// This reduces 6 separate API calls to 1 for the homepage
export async function GET() {
    try {
        const collectionSlugs = [
            'new-arrivals',
            'featured-instruments',
            'on-sale',
            'professional-flutes',
            'saxophones',
            'student-instruments',
        ]

        // Fetch all collections in a single query
        const collections = await prisma.featuredCollection.findMany({
            where: {
                slug: { in: collectionSlugs },
            },
        })

        // Get all unique product IDs across all collections
        const allProductIds = collections.flatMap((c) => c.productIds)
        const uniqueProductIds = [...new Set(allProductIds)]

        // Fetch all products in a single query
        const products = await prisma.product.findMany({
            where: {
                id: { in: uniqueProductIds },
            },
            select: {
                id: true,
                name: true,
                slug: true,
                sku: true,
                brand: true,
                price: true,
                shippingCost: true,
                images: true,
                badge: true,
                inStock: true,
                stock: true,
                stockStatus: true,
                rating: true,
                reviewCount: true,
                condition: true,
                productType: true,
                categoryId: true,
                subcategoryId: true,
                category: {
                    select: { slug: true },
                },
                subcategory: {
                    select: { slug: true },
                },
            },
        })

        // Build a product map for quick lookup
        const productMap = new Map(products.map((p) => [p.id, p]))

        // Build the response with products sorted by their order in each collection
        const result: Record<string, any> = {}

        for (const collection of collections) {
            const sortedProducts = collection.productIds
                .map((id) => productMap.get(id))
                .filter(Boolean)

            result[collection.slug] = {
                name: collection.name,
                slug: collection.slug,
                backgroundImage: collection.backgroundImage,
                products: sortedProducts,
            }
        }

        // Return without cache to ensure fresh data
        return NextResponse.json(result, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
        })
    } catch (error: unknown) {
        console.error('Error fetching homepage data:', error)
        return NextResponse.json(
            { error: 'Failed to fetch homepage data' },
            { status: 500 }
        )
    }
}
