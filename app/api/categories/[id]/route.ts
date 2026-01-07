import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/categories/[id] - Get a single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        subcategories: {
          orderBy: {
            name: 'asc',
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error: any) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category', message: error?.message },
      { status: 500 }
    )
  }
}

// PUT /api/categories/[id] - Update a category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, slug, path } = body

    // Check if category exists
    const existing = await prisma.category.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(path && { path }),
      },
      include: {
        subcategories: {
          orderBy: {
            name: 'asc',
          },
        },
      },
    })

    return NextResponse.json(category)
  } catch (error: any) {
    console.error('Error updating category:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A category with this slug already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update category', message: error?.message },
      { status: 500 }
    )
  }
}

// DELETE /api/categories/[id] - Delete a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if category exists
    const existing = await prisma.category.findUnique({
      where: { id },
      include: {
        subcategories: true,
        products: true,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Check if any products are using this category
    if (existing.products.length > 0) {
      return NextResponse.json(
        { error: `Cannot delete category. ${existing.products.length} product(s) are using it.` },
        { status: 400 }
      )
    }

    // Delete subcategories first (cascade should handle this, but being explicit)
    if (existing.subcategories.length > 0) {
      await prisma.subCategory.deleteMany({
        where: { categoryId: id },
      })
    }

    await prisma.category.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Category deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category', message: error?.message },
      { status: 500 }
    )
  }
}
