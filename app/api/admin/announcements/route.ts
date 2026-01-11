import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all announcements
export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(announcements)
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 })
  }
}

// POST create new announcement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, ctaText, ctaLink, order, isActive } = body

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        description,
        ctaText: ctaText || null,
        ctaLink: ctaLink || null,
        order: order ?? 0,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(announcement, { status: 201 })
  } catch (error) {
    console.error('Error creating announcement:', error)
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 })
  }
}
