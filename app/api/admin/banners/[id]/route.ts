import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/banners/[id] - Get a single banner
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const banner = await prisma.banner.findUnique({
      where: { id },
    })

    if (!banner) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(banner)
  } catch (error: any) {
    console.error('Error fetching banner:', error)
    return NextResponse.json(
      { error: 'Failed to fetch banner', message: error?.message },
      { status: 500 }
    )
  }
}

// PUT /api/admin/banners/[id] - Update a banner
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, subtitle, image, link, buttonText, order, isActive } = body

    // Check if banner exists
    const existingBanner = await prisma.banner.findUnique({
      where: { id },
    })

    if (!existingBanner) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      )
    }

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(subtitle !== undefined && { subtitle: subtitle || null }),
        ...(image !== undefined && { image }),
        ...(link !== undefined && { link: link || null }),
        ...(buttonText !== undefined && { buttonText: buttonText || null }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(banner)
  } catch (error: any) {
    console.error('Error updating banner:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update banner', message: error?.message },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/banners/[id] - Delete a banner
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if banner exists
    const existingBanner = await prisma.banner.findUnique({
      where: { id },
    })

    if (!existingBanner) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      )
    }

    await prisma.banner.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Banner deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting banner:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to delete banner', message: error?.message },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/banners/[id] - Toggle banner active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get current banner
    const existingBanner = await prisma.banner.findUnique({
      where: { id },
    })

    if (!existingBanner) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      )
    }

    // Toggle isActive status
    const banner = await prisma.banner.update({
      where: { id },
      data: {
        isActive: !existingBanner.isActive,
      },
    })

    return NextResponse.json(banner)
  } catch (error: any) {
    console.error('Error toggling banner status:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to toggle banner status', message: error?.message },
      { status: 500 }
    )
  }
}
