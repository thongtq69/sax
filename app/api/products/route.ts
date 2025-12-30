import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
      where.categoryId = category
    }

    if (subcategory) {
      where.subcategoryId = subcategory
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
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
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
      badge,
      inStock,
      stock,
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
        badge: badge || null,
        inStock: inStock !== undefined ? inStock : true,
        stock: stock ? parseInt(stock) : 0,
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

