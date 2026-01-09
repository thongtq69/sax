import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Default sections for auto-creation
const defaultSections: Record<string, any> = {
  'hero': {
    sectionKey: 'hero',
    title: 'James Sax Corner',
    subtitle: 'Premium Japanese saxophones, expertly maintained for peak performance.',
    content: '',
    image: '/homepage3.png',
    isVisible: true,
    order: 0,
    metadata: { 
      buttonText: 'Buy with confidence!', 
      buttonLink: '/shop',
      logoImage: '/jsc-logo-cropped.svg'
    },
  },
  'why-choose-us': {
    sectionKey: 'why-choose-us',
    title: 'Why Musicians Choose Us',
    subtitle: '',
    content: '',
    image: '',
    isVisible: true,
    order: 1,
    metadata: {},
  },
  'featured-review': {
    sectionKey: 'featured-review',
    title: 'Featured Review',
    subtitle: '',
    content: '',
    image: '',
    isVisible: true,
    order: 2,
    metadata: { authorName: '', rating: 5 },
  },
  'newsletter': {
    sectionKey: 'newsletter',
    title: 'Join Our Musical Community',
    subtitle: 'Get exclusive deals, tips, and industry news',
    content: '',
    image: '',
    isVisible: true,
    order: 3,
    metadata: { buttonText: 'Subscribe' },
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
        { error: 'Không tìm thấy section', message: 'Section với key này không tồn tại trong hệ thống' },
        { status: 404 }
      )
    }

    return NextResponse.json(section)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error fetching homepage section:', error)
    return NextResponse.json(
      { error: 'Lỗi tải section', message: 'Không thể tải thông tin section. Vui lòng thử lại sau.' },
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
        { error: 'Không tìm thấy section', message: 'Section với key này không tồn tại trong hệ thống' },
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
  } catch (error: unknown) {
    const prismaError = error as { code?: string }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error updating homepage section:', error)
    if (prismaError.code === 'P2025') {
      return NextResponse.json(
        { error: 'Không tìm thấy section', message: 'Section với key này không tồn tại trong hệ thống' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Lỗi cập nhật section', message: 'Không thể cập nhật section. Vui lòng thử lại sau.' },
      { status: 500 }
    )
  }
}
