import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - List all spec keys
export async function GET() {
  try {
    const specKeys = await prisma.specKey.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(specKeys)
  } catch (error: any) {
    console.error('Error fetching spec keys:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch spec keys' },
      { status: 500 }
    )
  }
}

// POST - Create new spec key
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Check if already exists
    const existing = await prisma.specKey.findUnique({
      where: { name: name.trim() },
    })

    if (existing) {
      return NextResponse.json({ error: 'Spec key already exists' }, { status: 400 })
    }

    // Get max order
    const maxOrder = await prisma.specKey.aggregate({
      _max: { order: true },
    })

    const specKey = await prisma.specKey.create({
      data: {
        name: name.trim(),
        order: (maxOrder._max.order || 0) + 1,
      },
    })

    return NextResponse.json(specKey)
  } catch (error: any) {
    console.error('Error creating spec key:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create spec key' },
      { status: 500 }
    )
  }
}

// DELETE - Delete spec key
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await prisma.specKey.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting spec key:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete spec key' },
      { status: 500 }
    )
  }
}
