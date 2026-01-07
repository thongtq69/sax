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
      productType,
      condition,
      conditionNotes,
      description,
      specs,
      included,
      warranty,
      sku,
      rating,
      reviewCount,
      videoUrls,
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
    if (videoUrls !== undefined) updateData.videoUrls = videoUrls || []
    if (badge !== undefined) updateData.badge = badge || null
    if (inStock !== undefined) updateData.inStock = inStock
    if (stockStatus !== undefined) updateData.stockStatus = stockStatus || 'in-stock'
    if (description) updateData.description = description
    if (specs !== undefined) updateData.specs = specs
    if (included !== undefined) updateData.included = included
    if (warranty !== undefined) updateData.warranty = warranty || null
    if (sku) updateData.sku = sku
    if (rating !== undefined) updateData.rating = parseFloat(rating)
    if (reviewCount !== undefined) updateData.reviewCount = parseInt(reviewCount)

    // Handle product type and condition
    if (productType !== undefined) {
      const validProductType = productType === 'used' ? 'used' : 'new'
      updateData.productType = validProductType
      
      if (validProductType === 'used') {
        // Auto-set stock to 1 for used products
        updateData.stock = 1
        
        // Validate and set condition
        const validConditions = ['mint', 'excellent', 'very-good', 'good', 'fair']
        if (condition && validConditions.includes(condition)) {
          updateData.condition = condition
        } else if (!condition) {
          updateData.condition = 'excellent' // Default
        }
        
        // Set condition notes
        if (conditionNotes !== undefined) {
          updateData.conditionNotes = conditionNotes || null
        }
      } else {
        // Clear condition fields for new products
        updateData.condition = null
        updateData.conditionNotes = null
        
        // Allow custom stock for new products
        if (stock !== undefined) {
          updateData.stock = parseInt(stock)
        }
      }
    } else {
      // If productType not being updated, just update stock normally
      if (stock !== undefined) updateData.stock = parseInt(stock)
      if (condition !== undefined) updateData.condition = condition || null
      if (conditionNotes !== undefined) updateData.conditionNotes = conditionNotes || null
    }

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
        { 
          error: 'Product not found', 
          message: 'The product you are trying to update does not exist or has been deleted.' 
        },
        { status: 404 }
      )
    }
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field'
      return NextResponse.json(
        { 
          error: 'Duplicate entry', 
          message: `A product with this ${field === 'sku' ? 'SKU' : field === 'slug' ? 'Slug' : field} already exists. Please use a different value.` 
        },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { 
        error: 'Failed to update product', 
        message: error?.message || 'An unexpected error occurred. Please try again.' 
      },
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
        { 
          error: 'Product not found', 
          message: 'The product you are trying to delete does not exist or has already been deleted.' 
        },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { 
        error: 'Failed to delete product', 
        message: error?.message || 'An unexpected error occurred. Please try again.' 
      },
      { status: 500 }
    )
  }
}

