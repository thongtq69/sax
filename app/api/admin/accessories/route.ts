import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all accessories
export async function GET() {
  try {
    const accessories = await prisma.accessory.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    })
    return NextResponse.json(accessories)
  } catch (error) {
    console.error('Error fetching accessories:', error)
    return NextResponse.json({ error: 'Failed to fetch accessories' }, { status: 500 })
  }
}

// POST create new accessory
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Check if accessory already exists
    const existing = await prisma.accessory.findUnique({
      where: { name: name.trim() },
    })

    if (existing) {
      return NextResponse.json({ error: 'Accessory already exists' }, { status: 400 })
    }

    const accessory = await prisma.accessory.create({
      data: { name: name.trim() },
    })

    return NextResponse.json(accessory)
  } catch (error) {
    console.error('Error creating accessory:', error)
    return NextResponse.json({ error: 'Failed to create accessory' }, { status: 500 })
  }
}

// DELETE accessory
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await prisma.accessory.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting accessory:', error)
    return NextResponse.json({ error: 'Failed to delete accessory' }, { status: 500 })
  }
}
