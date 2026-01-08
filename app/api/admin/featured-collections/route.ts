import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/admin/featured-collections - Get all featured collections
export async function GET() {
  try {
    const collections = await prisma.featuredCollection.findMany({
      orderBy: { name: 'asc' },
    })

    // Get product details for each collection
    const collectionsWithProducts = await Promise.all(
      collections.map(async (collection) => {
        const products = await prisma.product.findMany({
          where: {
            id: { in: collection.productIds },
          },
          select: {
            id: true,
            name: true,
            slug: true,
            brand: true,
            price: true,
            images: true,
            badge: true,
          },
        })

        // Sort products by the order in productIds
        const sortedProducts = collection.productIds
          .map((id) => products.find((p) => p.id === id))
          .filter(Boolean)

        return {
          ...collection,
          products: sortedProducts,
        }
      })
    )

    return NextResponse.json(collectionsWithProducts)
  } catch (error: any) {
    console.error('Error fetching featured collections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch featured collections', message: error?.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/featured-collections - Create a new featured collection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, productIds } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existing = await prisma.featuredCollection.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A collection with this slug already exists' },
        { status: 400 }
      )
    }

    const collection = await prisma.featuredCollection.create({
      data: {
        name,
        slug,
        productIds: productIds || [],
      },
    })

    return NextResponse.json(collection, { status: 201 })
  } catch (error: any) {
    console.error('Error creating featured collection:', error)
    return NextResponse.json(
      { error: 'Failed to create featured collection', message: error?.message },
      { status: 500 }
    )
  }
}
