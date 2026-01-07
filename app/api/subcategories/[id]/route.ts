import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/subcategories/[id] - Get a single subcategory
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const subcategory = await prisma.subCategory.findUnique({
      where: { id },
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

    if (!subcategory) {
      return NextResponse.json(
        { error: 'Subcategory not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(subcategory)
  } catch (error: any) {
    console.error('Error fetching subcategory:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subcategory', message: error?.message },
      { status: 500 }
    )
  }
}

// PUT /api/subcategories/[id] - Update a subcategory
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, slug, path, categoryId } = body

    // Check if subcategory exists
    const existing = await prisma.subCategory.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Subcategory not found' },
        { status: 404 }
      )
    }

    // If categoryId is changing, verify new category exists
    if (categoryId && categoryId !== existing.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      })
      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        )
      }
    }

    const subcategory = await prisma.subCategory.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(path && { path }),
        ...(categoryId && { categoryId }),
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

    return NextResponse.json(subcategory)
  } catch (error: any) {
    console.error('Error updating subcategory:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A subcategory with this slug already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update subcategory', message: error?.message },
      { status: 500 }
    )
  }
}

// DELETE /api/subcategories/[id] - Delete a subcategory
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if subcategory exists
    const existing = await prisma.subCategory.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Subcategory not found' },
        { status: 404 }
      )
    }

    // Check if any products are using this subcategory
    const productsCount = await prisma.product.count({
      where: { subcategoryId: id },
    })

    if (productsCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete subcategory. ${productsCount} product(s) are using it.` },
        { status: 400 }
      )
    }

    await prisma.subCategory.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Subcategory deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting subcategory:', error)
    return NextResponse.json(
      { error: 'Failed to delete subcategory', message: error?.message },
      { status: 500 }
    )
  }
}
