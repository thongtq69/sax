import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/slug-utils'

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
    const showArchived = searchParams.get('showArchived')

    // Mặc định ẩn sản phẩm archived khỏi danh sách
    if (showArchived !== 'true') {
      where.stockStatus = { not: 'archived' }
    }

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
      subBrand,
      price,
      shippingCost,
      categoryId,
      subcategoryId,
      images,
      videoUrls,
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

    // Fallbacks for missing fields to allow partial creation
    const finalName = name || 'New Product'
    const finalBrand = brand || 'Unknown Brand'
    const finalPrice = (price !== undefined && price !== null && price !== '') ? parseFloat(price) : 0
    const finalDescription = description || ''
    const finalSku = sku || `SN-${Date.now()}`

    let finalCategoryId = categoryId
    if (!finalCategoryId) {
      // Find the first available category as fallback
      const defaultCategory = await prisma.category.findFirst()
      if (defaultCategory) {
        finalCategoryId = defaultCategory.id
      } else {
        // Create a default category if none exists
        const newCat = await prisma.category.create({
          data: {
            name: 'Uncategorized',
            slug: 'uncategorized',
            path: '/shop/uncategorized'
          }
        })
        finalCategoryId = newCat.id
      }
    }

    // Auto-generate slug from name if not provided
    let finalSlug = slug
    if (!finalSlug || finalSlug.trim() === '' || finalSlug === 'Auto-generated from name') {
      const baseSlug = generateSlug(finalName)

      // Check if slug exists and make it unique
      let slugToCheck = baseSlug
      let counter = 1
      while (await prisma.product.findUnique({ where: { slug: slugToCheck } })) {
        slugToCheck = `${baseSlug}-${counter}`
        counter++
        if (counter > 100) {
          slugToCheck = `${baseSlug}-${Date.now()}`
          break
        }
      }
      finalSlug = slugToCheck
    }

    const validProductType = productType === 'used' ? 'used' : 'new'
    const finalStock = validProductType === 'used' ? 1 : (stock ? parseInt(stock) : 0)

    const product = await prisma.product.create({
      data: {
        name: finalName,
        slug: finalSlug,
        brand: finalBrand,
        subBrand: subBrand || null,
        price: finalPrice,
        shippingCost: shippingCost ? parseFloat(shippingCost) : null,
        categoryId: finalCategoryId,
        subcategoryId: subcategoryId || null,
        images: images || [],
        videoUrls: videoUrls || (videoUrl ? [videoUrl] : []),
        badge: badge || null,
        inStock: inStock !== undefined ? inStock : true,
        stock: finalStock,
        stockStatus: stockStatus || 'in-stock',
        productType: validProductType,
        condition: validProductType === 'used' ? (condition || 'excellent') : null,
        conditionNotes: validProductType === 'used' ? (conditionNotes || null) : null,
        description: finalDescription,
        specs: specs || null,
        included: included || [],
        warranty: warranty || null,
        sku: finalSku,
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
      const field = error.meta?.target?.[0] || 'field'
      return NextResponse.json(
        {
          error: 'Duplicate entry',
          message: `A product with this ${field === 'sku' ? 'Serial' : field === 'slug' ? 'Slug' : field} already exists.`
        },
        { status: 409 }
      )
    }
    return NextResponse.json(
      {
        error: 'Failed to create product',
        message: error?.message || 'An unexpected error occurred. Please try again.'
      },
      { status: 500 }
    )
  }
}
