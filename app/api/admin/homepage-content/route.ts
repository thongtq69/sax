import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Default hero section
const defaultHero = {
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
}

// GET /api/admin/homepage-content - Get hero section
export async function GET() {
  try {
    let hero = await prisma.homepageContent.findUnique({
      where: { sectionKey: 'hero' },
    })

    // If hero doesn't exist, create it
    if (!hero) {
      hero = await prisma.homepageContent.create({
        data: defaultHero,
      })
    }

    return NextResponse.json([hero])
  } catch (error: any) {
    console.error('Error fetching homepage content:', error)
    return NextResponse.json(
      { error: 'Failed to load homepage content' },
      { status: 500 }
    )
  }
}
