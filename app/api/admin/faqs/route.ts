import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/admin/faqs - Get all FAQs
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const where: any = {}
    if (category) {
      where.category = category
    }
    if (activeOnly) {
      where.isActive = true
    }

    const faqs = await prisma.fAQ.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { order: 'asc' },
      ],
    })

    // Get unique categories
    const categories = await prisma.fAQ.findMany({
      select: { category: true },
      distinct: ['category'],
    })

    return NextResponse.json({
      faqs,
      categories: categories.map(c => c.category),
    })
  } catch (error: any) {
    console.error('Error fetching FAQs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch FAQs', message: error?.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/faqs - Create a new FAQ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, answer, category, order, isActive } = body

    if (!question || !answer) {
      const missingFields: string[] = []
      if (!question) missingFields.push('Question')
      if (!answer) missingFields.push('Answer')
      return NextResponse.json(
        { 
          error: 'Missing required fields', 
          message: `Please fill in the following required fields: ${missingFields.join(', ')}`,
          missingFields 
        },
        { status: 400 }
      )
    }

    // Get the highest order number if not provided
    let faqOrder = order
    if (faqOrder === undefined || faqOrder === null) {
      const lastFaq = await prisma.fAQ.findFirst({
        where: { category: category || 'General' },
        orderBy: { order: 'desc' },
        select: { order: true },
      })
      faqOrder = (lastFaq?.order ?? -1) + 1
    }

    const faq = await prisma.fAQ.create({
      data: {
        question,
        answer,
        category: category || 'General',
        order: faqOrder,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json(faq, { status: 201 })
  } catch (error: any) {
    console.error('Error creating FAQ:', error)
    return NextResponse.json(
      { error: 'Failed to create FAQ', message: error?.message },
      { status: 500 }
    )
  }
}
