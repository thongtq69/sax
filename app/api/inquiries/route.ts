import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendInquiryConfirmationEmail } from '@/lib/email'

// POST - Create new inquiry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, inquiryType, message, productName, productSku } = body

    if (!name || !email || !inquiryType) {
      return NextResponse.json(
        { error: 'Name, email, and inquiry type are required' },
        { status: 400 }
      )
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        name,
        email,
        inquiryType,
        message: message || '',
        productName: productName || null,
        productSku: productSku || null,
        status: 'new',
      },
    })

    // Send confirmation email to customer
    try {
      await sendInquiryConfirmationEmail({
        name,
        email,
        inquiryType,
        message: message || '',
        productName: productName || undefined,
        productSku: productSku || undefined,
      })
    } catch (emailError) {
      console.error('Error sending inquiry confirmation email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({ success: true, inquiry })
  } catch (error: any) {
    console.error('Error creating inquiry:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create inquiry' },
      { status: 500 }
    )
  }
}

// GET - List all inquiries (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: any = {}

    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
        { productName: { contains: search, mode: 'insensitive' } },
        { productSku: { contains: search, mode: 'insensitive' } },
      ]
    }

    const inquiries = await prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ inquiries })
  } catch (error: any) {
    console.error('Error fetching inquiries:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch inquiries' },
      { status: 500 }
    )
  }
}

// PATCH - Update inquiry status/notes
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, notes } = body

    if (!id) {
      return NextResponse.json({ error: 'Inquiry ID required' }, { status: 400 })
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (notes !== undefined) updateData.notes = notes

    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, inquiry })
  } catch (error: any) {
    console.error('Error updating inquiry:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update inquiry' },
      { status: 500 }
    )
  }
}

// DELETE - Delete inquiry
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Inquiry ID required' }, { status: 400 })
    }

    await prisma.inquiry.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting inquiry:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete inquiry' },
      { status: 500 }
    )
  }
}
