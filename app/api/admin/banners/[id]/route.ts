import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

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
        { error: 'Không tìm thấy banner', message: 'Banner với ID này không tồn tại trong hệ thống' },
        { status: 404 }
      )
    }

    return NextResponse.json(banner)
  } catch (error: any) {
    console.error('Error fetching banner:', error)
    return NextResponse.json(
      { error: 'Lỗi tải banner', message: 'Không thể tải thông tin banner. Vui lòng thử lại sau.' },
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
        { error: 'Không tìm thấy banner', message: 'Banner với ID này không tồn tại trong hệ thống' },
        { status: 404 }
      )
    }

    // Validate title if provided
    if (title !== undefined && (!title || title.trim() === '')) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', message: 'Tiêu đề banner không được để trống' },
        { status: 400 }
      )
    }

    // Validate image if provided
    if (image !== undefined && (!image || image.trim() === '')) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', message: 'Hình ảnh banner không được để trống' },
        { status: 400 }
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
        { error: 'Không tìm thấy banner', message: 'Banner với ID này không tồn tại trong hệ thống' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Lỗi cập nhật banner', message: 'Không thể cập nhật banner. Vui lòng thử lại sau.' },
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
        { error: 'Không tìm thấy banner', message: 'Banner với ID này không tồn tại trong hệ thống' },
        { status: 404 }
      )
    }

    await prisma.banner.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Xóa banner thành công' })
  } catch (error: any) {
    console.error('Error deleting banner:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Không tìm thấy banner', message: 'Banner với ID này không tồn tại trong hệ thống' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Lỗi xóa banner', message: 'Không thể xóa banner. Vui lòng thử lại sau.' },
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
        { error: 'Không tìm thấy banner', message: 'Banner với ID này không tồn tại trong hệ thống' },
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
        { error: 'Không tìm thấy banner', message: 'Banner với ID này không tồn tại trong hệ thống' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Lỗi thay đổi trạng thái', message: 'Không thể thay đổi trạng thái banner. Vui lòng thử lại sau.' },
      { status: 500 }
    )
  }
}
