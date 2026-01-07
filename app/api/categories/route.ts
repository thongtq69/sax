import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/categories - Get all categories with subcategories
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: {
          orderBy: {
            name: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(categories)
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch categories',
        message: error?.message || 'Unknown error',
        code: error?.code || 'UNKNOWN_ERROR',
      },
      { status: 500 }
    )
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, path, subcategories } = body

    if (!name || !slug || !path) {
      const missingFields: string[] = []
      if (!name) missingFields.push('Name')
      if (!slug) missingFields.push('Slug')
      if (!path) missingFields.push('Path')
      return NextResponse.json(
        { 
          error: 'Missing required fields', 
          message: `Please fill in the following required fields: ${missingFields.join(', ')}`,
          missingFields 
        },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        path,
        subcategories: subcategories
          ? {
              create: subcategories.map((sub: any) => ({
                name: sub.name,
                slug: sub.slug,
                path: sub.path,
              })),
            }
          : undefined,
      },
      include: {
        subcategories: true,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
    console.error('Error creating category:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { 
          error: 'Duplicate entry', 
          message: 'A category with this slug already exists. Please use a different slug.' 
        },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { 
        error: 'Failed to create category', 
        message: error?.message || 'An unexpected error occurred. Please try again.' 
      },
      { status: 500 }
    )
  }
}

