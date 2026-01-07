import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single inquiry title
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const title = await prisma.inquiryTitle.findUnique({ where: { id } })
    
    if (!title) {
      return NextResponse.json({ error: 'Inquiry title not found' }, { status: 404 })
    }
    
    return NextResponse.json(title)
  } catch (error) {
    console.error('Error fetching inquiry title:', error)
    return NextResponse.json({ error: 'Failed to fetch inquiry title' }, { status: 500 })
  }
}

// PUT update inquiry title
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, order, isActive } = body

    const updated = await prisma.inquiryTitle.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating inquiry title:', error)
    return NextResponse.json({ error: 'Failed to update inquiry title' }, { status: 500 })
  }
}

// DELETE inquiry title
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.inquiryTitle.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting inquiry title:', error)
    return NextResponse.json({ error: 'Failed to delete inquiry title' }, { status: 500 })
  }
}
