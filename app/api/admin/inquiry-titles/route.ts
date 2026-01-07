import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all inquiry titles
export async function GET() {
  try {
    const titles = await prisma.inquiryTitle.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(titles)
  } catch (error) {
    console.error('Error fetching inquiry titles:', error)
    return NextResponse.json({ error: 'Failed to fetch inquiry titles' }, { status: 500 })
  }
}

// POST create new inquiry title
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, order = 0, isActive = true } = body

    if (!title) {
      return NextResponse.json(
        { 
          error: 'Missing required field', 
          message: 'Please enter a title for the inquiry option' 
        }, 
        { status: 400 }
      )
    }

    const newTitle = await prisma.inquiryTitle.create({
      data: { title, order, isActive },
    })

    return NextResponse.json(newTitle, { status: 201 })
  } catch (error) {
    console.error('Error creating inquiry title:', error)
    return NextResponse.json({ error: 'Failed to create inquiry title' }, { status: 500 })
  }
}
