import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/subcategories - Get all subcategories
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const categoryId = searchParams.get('categoryId')

    const where: any = {}
    if (categoryId) {
      where.categoryId = categoryId
    }

    const subcategories = await prisma.subCategory.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(subcategories)
  } catch (error: any) {
    console.error('Error fetching subcategories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subcategories', message: error?.message },
      { status: 500 }
    )
  }
}

// POST /api/subcategories - Create a new subcategory
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, path, categoryId } = body

    if (!name || !categoryId) {
      const missingFields: string[] = []
      if (!name) missingFields.push('Name')
      if (!categoryId) missingFields.push('Category')
      return NextResponse.json(
        { 
          error: 'Missing required fields', 
          message: `Please fill in the following required fields: ${missingFields.join(', ')}`,
          missingFields 
        },
        { status: 400 }
      )
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Generate slug if not provided
    const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    
    // Generate path if not provided
    const finalPath = path || `${category.path}/${finalSlug}`

    const subcategory = await prisma.subCategory.create({
      data: {
        name,
        slug: finalSlug,
        path: finalPath,
        categoryId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json(subcategory, { status: 201 })
  } catch (error: any) {
    console.error('Error creating subcategory:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { 
          error: 'Duplicate entry', 
          message: 'A subcategory with this slug already exists. Please use a different name or slug.' 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create subcategory', 
        message: error?.message || 'An unexpected error occurred. Please try again.' 
      },
      { status: 500 }
    )
  }
}
