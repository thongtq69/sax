import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/products/[id] - Get a single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        subcategory: true,
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      name,
      slug,
      brand,
      price,
      retailPrice,
      categoryId,
      subcategoryId,
      images,
      badge,
      inStock,
      stock,
      stockStatus,
      description,
      specs,
      included,
      warranty,
      sku,
      rating,
      reviewCount,
      videoUrl,
    } = body

    // Build update data - always include images if provided (even empty array)
    const updateData: any = {}
    
    if (name) updateData.name = name
    if (slug) updateData.slug = slug
    if (brand) updateData.brand = brand
    if (price !== undefined) updateData.price = parseFloat(price)
    if (retailPrice !== undefined) updateData.retailPrice = retailPrice ? parseFloat(retailPrice) : null
    if (categoryId) updateData.categoryId = categoryId
    if (subcategoryId !== undefined) updateData.subcategoryId = subcategoryId || null
    if (images !== undefined) updateData.images = images || []
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl || null
    if (badge !== undefined) updateData.badge = badge || null
    if (inStock !== undefined) updateData.inStock = inStock
    if (stock !== undefined) updateData.stock = parseInt(stock)
    if (stockStatus !== undefined) updateData.stockStatus = stockStatus || 'in-stock'
    if (description) updateData.description = description
    if (specs !== undefined) updateData.specs = specs
    if (included !== undefined) updateData.included = included
    if (warranty !== undefined) updateData.warranty = warranty || null
    if (sku) updateData.sku = sku
    if (rating !== undefined) updateData.rating = parseFloat(rating)
    if (reviewCount !== undefined) updateData.reviewCount = parseInt(reviewCount)

    const product = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
      include: {
        category: true,
        subcategory: true,
      },
    })

    return NextResponse.json(product)
  } catch (error: any) {
    console.error('Error updating product:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Product with this slug or SKU already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.product.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting product:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}

