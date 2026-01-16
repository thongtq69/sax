import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET all brands
export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ]
    })
    return NextResponse.json(brands)
  } catch (error) {
    console.error('Error fetching brands:', error)
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 })
  }
}

// POST create new brand
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, logo, models = [], isActive = true, order = 0 } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Brand name is required' }, { status: 400 })
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    // Check if brand already exists
    const existing = await prisma.brand.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: 'insensitive' } },
          { slug }
        ]
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'Brand already exists' }, { status: 400 })
    }

    const brand = await prisma.brand.create({
      data: {
        name: name.trim(),
        slug,
        logo: logo || null,
        models: models || [],
        isActive,
        order
      }
    })

    return NextResponse.json(brand, { status: 201 })
  } catch (error) {
    console.error('Error creating brand:', error)
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 })
  }
}
