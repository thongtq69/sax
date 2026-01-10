import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - List all description templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'header' | 'footer' | null (all)

    const where: any = { isActive: true }
    if (type) {
      where.type = type
    }

    const templates = await prisma.descriptionTemplate.findMany({
      where,
      orderBy: [{ type: 'asc' }, { order: 'asc' }],
    })
    return NextResponse.json(templates)
  } catch (error: any) {
    console.error('Error fetching description templates:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

// POST - Create new template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, content, type } = body

    if (!name?.trim() || !content?.trim() || !type) {
      return NextResponse.json(
        { error: 'Name, content, and type are required' },
        { status: 400 }
      )
    }

    if (!['header', 'footer'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be "header" or "footer"' },
        { status: 400 }
      )
    }

    // Get max order for this type
    const maxOrder = await prisma.descriptionTemplate.aggregate({
      where: { type },
      _max: { order: true },
    })

    const template = await prisma.descriptionTemplate.create({
      data: {
        name: name.trim(),
        content: content.trim(),
        type,
        order: (maxOrder._max.order || 0) + 1,
      },
    })

    return NextResponse.json(template)
  } catch (error: any) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create template' },
      { status: 500 }
    )
  }
}

// PATCH - Update template
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, content, isActive } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim()
    if (content !== undefined) updateData.content = content.trim()
    if (isActive !== undefined) updateData.isActive = isActive

    const template = await prisma.descriptionTemplate.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(template)
  } catch (error: any) {
    console.error('Error updating template:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update template' },
      { status: 500 }
    )
  }
}

// DELETE - Delete template
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await prisma.descriptionTemplate.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting template:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete template' },
      { status: 500 }
    )
  }
}
