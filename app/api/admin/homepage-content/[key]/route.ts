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
      logoImage: '/LOGO JAMES (1).svg'
    },
  },
  'flash-sale': {
    sectionKey: 'flash-sale',
    title: 'Flash Sale Ending Soon',
    subtitle: 'Exclusive prices on selected professional instruments.',
    isVisible: true,
    metadata: {
      endDate: '2026-03-31T23:59:59',
      urgencyText: '🏃 HURRY! LOW STOCK',
      showTimer: true,
      buttonText: 'Grab Now',
    }
  },
  'rewards-vouchers': {
    sectionKey: 'rewards-vouchers',
    title: 'EXCLUSIVE PRIVILEGES FOR PROFESSIONAL MUSICIANS',
    subtitle: 'Unlock premium discounts and seasonal vouchers curated for our most valued collectors and performers.',
    isVisible: true,
    metadata: {
      coupons: [
        { id: '1', amount: '$500', code: 'SAX-MASTER-500', label: 'Pro Collection Voucher', description: 'Valid for all professional level alto and tenor saxophones.', minSpend: 5000, expiryDate: 'Mar 20, 2026' },
        { id: '2', amount: '15%', code: 'FLUTE-ARTIST', label: 'Artist Series Discount', description: 'Special discount for Altus and Haynes handmade flutes.', minSpend: 3000, expiryDate: 'Apr 15, 2026' },
        { id: '3', amount: '$200', code: 'WELCOME-PREMIUM', label: 'Welcome Bonus', description: 'A special gift for your first professional instrument purchase.', minSpend: 2000, expiryDate: 'Dec 31, 2026' }
      ]
    }
  }
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
