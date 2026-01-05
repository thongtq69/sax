import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Default homepage sections
const defaultSections = [
  {
    sectionKey: 'hero',
    title: 'Premium Saxophones & Woodwinds',
    subtitle: 'Discover our curated collection of professional instruments',
    content: '',
    image: '',
    isVisible: true,
    order: 0,
    metadata: { buttonText: 'Shop Now', buttonLink: '/shop' },
  },
  {
    sectionKey: 'about',
    title: 'About James Sax Corner',
    subtitle: 'Your trusted source for quality instruments',
    content: 'We specialize in premium saxophones, flutes, clarinets, and other woodwind instruments. With years of experience, we provide musicians with the finest instruments and exceptional service.',
    image: '',
    isVisible: true,
    order: 1,
    metadata: {},
  },
  {
    sectionKey: 'features',
    title: 'Why Choose Us',
    subtitle: '',
    content: '',
    image: '',
    isVisible: true,
    order: 2,
    metadata: {
      features: [
        { icon: 'Shield', title: 'Quality Guaranteed', description: 'All instruments are professionally inspected' },
        { icon: 'Truck', title: 'Free Shipping', description: 'On orders over $500' },
        { icon: 'HeadphonesIcon', title: 'Expert Support', description: '24/7 customer service' },
      ],
    },
  },
  {
    sectionKey: 'cta',
    title: 'Ready to Find Your Perfect Instrument?',
    subtitle: 'Browse our collection or contact us for personalized recommendations',
    content: '',
    image: '',
    isVisible: true,
    order: 3,
    metadata: { buttonText: 'Contact Us', buttonLink: '/inquiry' },
  },
]

// GET /api/admin/homepage-content - Get all homepage sections
export async function GET() {
  try {
    let sections = await prisma.homepageContent.findMany({
      orderBy: { order: 'asc' },
    })

    // If no sections exist, create defaults
    if (sections.length === 0) {
      for (const section of defaultSections) {
        await prisma.homepageContent.create({
          data: section,
        })
      }
      sections = await prisma.homepageContent.findMany({
        orderBy: { order: 'asc' },
      })
    }

    return NextResponse.json(sections)
  } catch (error: any) {
    console.error('Error fetching homepage content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch homepage content', message: error?.message },
      { status: 500 }
    )
  }
}
