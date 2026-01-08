import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/admin/featured-collections/[slug] - Get a specific collection
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const collection = await prisma.featuredCollection.findUnique({
      where: { slug },
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    // Get product details
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
        retailPrice: true,
        images: true,
        badge: true,
        inStock: true,
        stock: true,
        stockStatus: true,
        rating: true,
        reviewCount: true,
        condition: true,
        productType: true,
      },
    })

    // Sort products by the order in productIds
    const sortedProducts = collection.productIds
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean)

    return NextResponse.json({
      ...collection,
      products: sortedProducts,
    })
  } catch (error: any) {
    console.error('Error fetching featured collection:', error)
    return NextResponse.json(
      { error: 'Failed to fetch featured collection', message: error?.message },
      { status: 500 }
    )
  }
}

// PUT /api/admin/featured-collections/[slug] - Update a collection
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json()
    const { name, productIds } = body

    const collection = await prisma.featuredCollection.findUnique({
      where: { slug },
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    const updated = await prisma.featuredCollection.update({
      where: { slug },
      data: {
        ...(name && { name }),
        ...(productIds !== undefined && { productIds }),
      },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error updating featured collection:', error)
    return NextResponse.json(
      { error: 'Failed to update featured collection', message: error?.message },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/featured-collections/[slug] - Delete a collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const collection = await prisma.featuredCollection.findUnique({
      where: { slug },
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    await prisma.featuredCollection.delete({
      where: { slug },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting featured collection:', error)
    return NextResponse.json(
      { error: 'Failed to delete featured collection', message: error?.message },
      { status: 500 }
    )
  }
}
