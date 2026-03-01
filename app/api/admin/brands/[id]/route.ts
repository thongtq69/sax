import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { getBrandDescriptionTemplate } from '@/lib/brand-description'

// GET single brand
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const brand = await prisma.brand.findUnique({
      where: { id }
    })

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    return NextResponse.json(brand)
  } catch (error) {
    console.error('Error fetching brand:', error)
    return NextResponse.json({ error: 'Failed to fetch brand' }, { status: 500 })
  }
}

// PUT update brand
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, logo, description, models, isActive, order } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Brand name is required' }, { status: 400 })
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    // Check if another brand with same name/slug exists
    const existing = await prisma.brand.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              { name: { equals: name, mode: 'insensitive' } },
              { slug }
            ]
          }
        ]
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'Another brand with this name already exists' }, { status: 400 })
    }

    const finalName = name.trim()
    const finalDescription =
      (typeof description === 'string' && description.trim()) ||
      getBrandDescriptionTemplate(finalName) ||
      null

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        name: finalName,
        slug,
        logo: logo || null,
        description: finalDescription,
        models: models || [],
        isActive: isActive ?? true,
        order: order ?? 0
      }
    })

    return NextResponse.json(brand)
  } catch (error) {
    console.error('Error updating brand:', error)
    return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 })
  }
}

// DELETE brand
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if any products use this brand
    const brand = await prisma.brand.findUnique({
      where: { id }
    })

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    const productsCount = await prisma.product.count({
      where: { brand: brand.name }
    })

    if (productsCount > 0) {
      return NextResponse.json({ 
        error: `Cannot delete brand. ${productsCount} product(s) are using this brand.` 
      }, { status: 400 })
    }

    await prisma.brand.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting brand:', error)
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 })
  }
}
