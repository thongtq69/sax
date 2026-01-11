import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Default sections for auto-creation
const defaultSections: Record<string, any> = {
  'hero': {
    sectionKey: 'hero',
    title: 'James Sax Corner',
    subtitle: 'Premium saxophones, expertly maintained for peak performance. Trusted by musicians worldwide, backed by outstanding reviews. Unmatched customer service—your satisfaction comes first! Buy with confidence!',
    content: '',
    image: '/homepage3.png',
    isVisible: true,
    order: 0,
    metadata: { 
      buttonText: 'Shop now!', 
      buttonLink: '/shop',
      logoImage: '/jsc-logo-transparent.svg'
    },
  },
}

// GET /api/admin/homepage-content/[key] - Get a single section
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params

    let section = await prisma.homepageContent.findUnique({
      where: { sectionKey: key },
    })

    // If section doesn't exist but we have a default, create it
    if (!section && defaultSections[key]) {
      section = await prisma.homepageContent.create({
        data: defaultSections[key],
      })
    }

    if (!section) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(section)
  } catch (error: unknown) {
    console.error('Error fetching homepage section:', error)
    return NextResponse.json(
      { error: 'Failed to load section' },
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

    // Merge metadata instead of replacing
    const existingMetadata = (existingSection.metadata as Record<string, any>) || {}
    const mergedMetadata = metadata !== undefined 
      ? { ...existingMetadata, ...metadata }
      : existingMetadata

    const section = await prisma.homepageContent.update({
      where: { sectionKey: key },
      data: {
        ...(title !== undefined && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(content !== undefined && { content }),
        ...(image !== undefined && { image }),
        ...(isVisible !== undefined && { isVisible }),
        ...(order !== undefined && { order }),
        metadata: mergedMetadata,
      },
    })

    return NextResponse.json(section)
  } catch (error: unknown) {
    const prismaError = error as { code?: string }
    console.error('Error updating homepage section:', error)
    if (prismaError.code === 'P2025') {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update section' },
      { status: 500 }
    )
  }
}
