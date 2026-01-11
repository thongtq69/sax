import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Default homepage sections - based on actual website content
const defaultSections = [
  {
    sectionKey: 'hero',
    title: 'James Sax Corner',
    subtitle: 'Premium Japanese saxophones, expertly maintained for peak performance. Trusted by musicians worldwide, backed by outstanding reviews. Unmatched customer service—your satisfaction comes first! Buy with confidence!',
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
  {
    sectionKey: 'why-choose-us',
    title: 'WHY CHOOSE US',
    subtitle: '',
    content: '',
    image: '',
    isVisible: true,
    order: 1,
    metadata: {
      features: [
        { title: 'Saxophone Specialists', description: 'We focus exclusively on saxophones, allowing us to maintain high standards in selection and preparation.' },
        { title: 'Individually Prepared', description: 'Each instrument is inspected and adjusted before sale to ensure reliable playability.' },
        { title: 'Honest & Clear Listings', description: 'Every saxophone is listed as a unique instrument with accurate descriptions.' },
        { title: 'Secure Purchasing', description: 'All payments are processed through PayPal with full buyer protection.' },
        { title: 'Trusted Worldwide', description: 'Serving players from different countries and musical backgrounds.' },
      ],
    },
  },
  {
    sectionKey: 'featured-review',
    title: 'Featured Review',
    subtitle: '',
    content: 'This was the single best transaction I\'ve had with an online seller. James sent me a 10 minute video minutes after contacting him detailing the horn and exhibiting the condition. Shipping from Vietnam to the US east coast took 3 days and the packaging was impeccable. The horn arrived exactly as described and plays just as well as it should; James did an excellent job replacing pads and adjusting. There are no visible or audible leaks. I would purchase from him again in a heartbeat.',
    image: '',
    isVisible: true,
    order: 2,
    metadata: { 
      authorName: 'Zach E.',
      rating: 5
    },
  },
  {
    sectionKey: 'newsletter',
    title: 'Join Our Musical Community',
    subtitle: '',
    content: '',
    image: '',
    isVisible: true,
    order: 3,
    metadata: { buttonText: 'Subscribe' },
  },
]

// POST /api/admin/homepage-content/reset - Reset all homepage content to defaults
export async function POST() {
  try {
    // Delete all existing homepage content
    await prisma.homepageContent.deleteMany({})
    
    // Create new defaults
    for (const section of defaultSections) {
      await prisma.homepageContent.create({
        data: section,
      })
    }
    
    const sections = await prisma.homepageContent.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Homepage content reset to defaults',
      sections 
    })
  } catch (error: any) {
    console.error('Error resetting homepage content:', error)
    return NextResponse.json(
      { error: 'Failed to reset homepage content' },
      { status: 500 }
    )
  }
}
