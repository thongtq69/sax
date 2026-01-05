import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/homepage-content/[key] - Get a single section
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params

    const section = await prisma.homepageContent.findUnique({
      where: { sectionKey: key },
    })

    if (!section) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(section)
  } catch (error: any) {
    console.error('Error fetching homepage section:', error)
    return NextResponse.json(
      { error: 'Failed to fetch homepage section', message: error?.message },
      { status: 500 }
    )
  }
}

// PUT /api/admin/homepage-content/[key] - Update a section
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params
    const body = await request.json()
    const { title, subtitle, content, image, isVisible, order, metadata } = body

    // Check if section exists
    const existingSection = await prisma.homepageContent.findUnique({
      where: { sectionKey: key },
    })

    if (!existingSection) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      )
    }

    const section = await prisma.homepageContent.update({
      where: { sectionKey: key },
      data: {
        ...(title !== undefined && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(content !== undefined && { content }),
        ...(image !== undefined && { image }),
        ...(isVisible !== undefined && { isVisible }),
        ...(order !== undefined && { order }),
        ...(metadata !== undefined && { metadata }),
      },
    })

    return NextResponse.json(section)
  } catch (error: any) {
    console.error('Error updating homepage section:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update homepage section', message: error?.message },
      { status: 500 }
    )
  }
}
