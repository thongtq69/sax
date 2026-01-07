import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/products - Get all products with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const subcategory = searchParams.get('subcategory')
    const brand = searchParams.get('brand')
    const search = searchParams.get('search')
    const inStock = searchParams.get('inStock')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const badge = searchParams.get('badge')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const where: any = {}

    if (category) {
      // Check if category is a slug or ID
      const categoryRecord = await prisma.category.findFirst({
        where: {
          OR: [
            { slug: category },
            { id: category }
          ]
        }
      })
      if (categoryRecord) {
        where.categoryId = categoryRecord.id
      }
    }

    if (subcategory) {
      // Check if subcategory is a slug or ID
      const subcategoryRecord = await prisma.subCategory.findFirst({
        where: {
          OR: [
            { slug: subcategory },
            { id: subcategory }
          ]
        }
      })
      if (subcategoryRecord) {
        where.subcategoryId = subcategoryRecord.id
      }
    }

    if (brand) {
      where.brand = brand
    }

    if (badge) {
      where.badge = badge
    }

    if (inStock !== null) {
      where.inStock = inStock === 'true'
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Don't call $connect() explicitly - Prisma will connect on first query
    // This works better with serverless environments like Vercel
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          subcategory: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        message: error?.message || 'Unknown error',
        code: error?.code || 'UNKNOWN_ERROR',
      },
      { status: 500 }
    )
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
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
      videoUrl,
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
    } = body

    // Validate required fields
    if (!name || !slug || !brand || !price || !categoryId || !description || !sku) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate product type
    const validProductType = productType === 'used' ? 'used' : 'new'
    
    // Validate condition for used products
    const validConditions = ['mint', 'excellent', 'very-good', 'good', 'fair']
    let validCondition = null
    if (validProductType === 'used') {
      if (!condition || !validConditions.includes(condition)) {
        validCondition = 'excellent' // Default condition for used products
      } else {
        validCondition = condition
      }
    }

    // Auto-set stock to 1 for used products
    const finalStock = validProductType === 'used' ? 1 : (stock ? parseInt(stock) : 0)

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        brand,
        price: parseFloat(price),
        retailPrice: retailPrice ? parseFloat(retailPrice) : null,
        categoryId,
        subcategoryId: subcategoryId || null,
        images: images || [],
        videoUrl: videoUrl || null,
        badge: badge || null,
        inStock: inStock !== undefined ? inStock : true,
        stock: finalStock,
        stockStatus: stockStatus || 'in-stock',
        productType: validProductType,
        condition: validCondition,
        conditionNotes: validProductType === 'used' ? (conditionNotes || null) : null,
        description,
        specs: specs || null,
        included: included || [],
        warranty: warranty || null,
        sku,
        rating: rating ? parseFloat(rating) : 0,
        reviewCount: reviewCount ? parseInt(reviewCount) : 0,
      },
      include: {
        category: true,
        subcategory: true,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    console.error('Error creating product:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Product with this slug or SKU already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

