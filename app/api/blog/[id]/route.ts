import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/blog/[id] - Get a single blog post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { id: params.id },
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Không tìm thấy bài viết', message: 'Bài viết với ID này không tồn tại trong hệ thống' },
        { status: 404 }
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json(
      { error: 'Lỗi tải bài viết', message: 'Không thể tải thông tin bài viết. Vui lòng thử lại sau.' },
      { status: 500 }
    )
  }
}

// PUT /api/blog/[id] - Update a blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, slug, excerpt, content, date, author, categories, image, readTime } = body

    const post = await prisma.blogPost.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(excerpt && { excerpt }),
        ...(content && { content }),
        ...(date && { date: new Date(date) }),
        ...(author && { author }),
        ...(categories !== undefined && { categories }),
        ...(image !== undefined && { image: image || null }),
        ...(readTime !== undefined && { readTime: readTime ? parseInt(readTime) : null }),
      },
    })

    return NextResponse.json(post)
  } catch (error: any) {
    console.error('Error updating blog post:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Không tìm thấy bài viết', message: 'Bài viết với ID này không tồn tại trong hệ thống' },
        { status: 404 }
      )
    }
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Đường dẫn đã tồn tại', message: 'Bài viết với đường dẫn (slug) này đã tồn tại. Vui lòng chọn đường dẫn khác.' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Lỗi cập nhật bài viết', message: 'Không thể cập nhật bài viết. Vui lòng thử lại sau.' },
      { status: 500 }
    )
  }
}

// DELETE /api/blog/[id] - Delete a blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.blogPost.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Xóa bài viết thành công' })
  } catch (error: any) {
    console.error('Error deleting blog post:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Không tìm thấy bài viết', message: 'Bài viết với ID này không tồn tại trong hệ thống' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Lỗi xóa bài viết', message: 'Không thể xóa bài viết. Vui lòng thử lại sau.' },
      { status: 500 }
    )
  }
}

