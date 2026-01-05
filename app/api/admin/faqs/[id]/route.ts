import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/faqs/[id] - Get a single FAQ
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params

    const faq = await prisma.fAQ.findUnique({
      where: { id },
    })

    if (!faq) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(faq)
  } catch (error: any) {
    console.error('Error fetching FAQ:', error)
    return NextResponse.json(
      { error: 'Failed to fetch FAQ', message: error?.message },
      { status: 500 }
    )
  }
}

// PUT /api/admin/faqs/[id] - Update a FAQ
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { question, answer, category, order, isActive } = body

    const existingFaq = await prisma.fAQ.findUnique({
      where: { id },
    })

    if (!existingFaq) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      )
    }

    const faq = await prisma.fAQ.update({
      where: { id },
      data: {
        ...(question !== undefined && { question }),
        ...(answer !== undefined && { answer }),
        ...(category !== undefined && { category }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(faq)
  } catch (error: any) {
    console.error('Error updating FAQ:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update FAQ', message: error?.message },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/faqs/[id] - Delete a FAQ
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params

    const existingFaq = await prisma.fAQ.findUnique({
      where: { id },
    })

    if (!existingFaq) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      )
    }

    await prisma.fAQ.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'FAQ deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting FAQ:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to delete FAQ', message: error?.message },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/faqs/[id] - Toggle FAQ active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params

    const existingFaq = await prisma.fAQ.findUnique({
      where: { id },
    })

    if (!existingFaq) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      )
    }

    const faq = await prisma.fAQ.update({
      where: { id },
      data: {
        isActive: !existingFaq.isActive,
      },
    })

    return NextResponse.json(faq)
  } catch (error: any) {
    console.error('Error toggling FAQ status:', error)
    return NextResponse.json(
      { error: 'Failed to toggle FAQ status', message: error?.message },
      { status: 500 }
    )
  }
}
