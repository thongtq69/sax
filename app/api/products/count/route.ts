import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Helper function to check if a string is a valid MongoDB ObjectID
function isValidObjectId(str: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(str)
}

// GET /api/products/count - Get product counts by category/subcategory
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const batch = searchParams.get('batch')
    const inStock = searchParams.get('inStock')

    // Handle batch request
    if (batch === 'true') {
      const where: any = {}
      if (inStock !== null) {
        where.inStock = inStock === 'true'
      }

      // Run independent queries in parallel
      const [
        categoryCounts,
        subcategoryCounts,
        categories,
        subcategories
      ] = await Promise.all([
        prisma.product.groupBy({
          by: ['categoryId'],
          where: {
            ...where,
          },
          _count: {
            categoryId: true
          }
        }),
        prisma.product.groupBy({
          by: ['subcategoryId'],
          where: {
            ...where,
            subcategoryId: { not: null }
          },
          _count: {
            subcategoryId: true
          }
        }),
        prisma.category.findMany({ select: { id: true, slug: true } }),
        prisma.subCategory.findMany({ select: { id: true, slug: true } })
      ])

      // Create lookups
      const categorySlugMap = new Map(categories.map(c => [c.id, c.slug]))
      const subcategorySlugMap = new Map(subcategories.map(s => [s.id, s.slug]))

      // Map results
      const categoryResults: Record<string, number> = {}
      categoryCounts.forEach(item => {
        if (item.categoryId) {
          const slug = categorySlugMap.get(item.categoryId)
          if (slug) {
            categoryResults[slug] = item._count.categoryId
          }
        }
      })

      const subcategoryResults: Record<string, number> = {}
      subcategoryCounts.forEach(item => {
        if (item.subcategoryId) {
          const slug = subcategorySlugMap.get(item.subcategoryId)
          if (slug) {
            subcategoryResults[slug] = item._count.subcategoryId
          }
        }
      })

      return NextResponse.json({
        categories: categoryResults,
        subcategories: subcategoryResults
      })
    }

    // Existing single count logic
    const category = searchParams.get('category')
    const subcategory = searchParams.get('subcategory')

    const where: any = {}

    if (category) {
      // Check if it's a valid ObjectID, otherwise treat as slug
      const categoryWhere = isValidObjectId(category)
        ? { id: category }
        : { slug: category }

      const categoryRecord = await prisma.category.findFirst({
        where: categoryWhere
      })
      if (categoryRecord) {
        where.categoryId = categoryRecord.id
      }
    }

    if (subcategory) {
      // Check if it's a valid ObjectID, otherwise treat as slug
      const subcategoryWhere = isValidObjectId(subcategory)
        ? { id: subcategory }
        : { slug: subcategory }

      const subcategoryRecord = await prisma.subCategory.findFirst({
        where: subcategoryWhere
      })
      if (subcategoryRecord) {
        where.subcategoryId = subcategoryRecord.id
      }
    }

    if (inStock !== null) {
      where.inStock = inStock === 'true'
    }

    const count = await prisma.product.count({ where })

    return NextResponse.json({ count })
  } catch (error: any) {
    console.error('Error counting products:', error)
    return NextResponse.json(
      {
        error: 'Failed to count products',
        message: error?.message || 'Unknown error',
        code: error?.code || 'UNKNOWN_ERROR',
      },
      { status: 500 }
    )
  }
}
