import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/blog - Get all blog posts with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {}

    if (category) {
      where.categories = {
        has: category,
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Don't call $connect() explicitly - Prisma will connect on first query
    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          date: 'desc',
        },
      }),
      prisma.blogPost.count({ where }),
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { 
        error: 'Lỗi tải bài viết',
        message: 'Không thể tải danh sách bài viết. Vui lòng thử lại sau.',
      },
      { status: 500 }
    )
  }
}

// POST /api/blog - Create a new blog post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, slug, excerpt, content, date, author, categories, image, readTime } = body

    if (!title || !slug || !excerpt || !content || !date || !author) {
      const missingFields = []
      if (!title) missingFields.push('Tiêu đề (title)')
      if (!slug) missingFields.push('Đường dẫn (slug)')
      if (!excerpt) missingFields.push('Tóm tắt (excerpt)')
      if (!content) missingFields.push('Nội dung (content)')
      if (!date) missingFields.push('Ngày đăng (date)')
      if (!author) missingFields.push('Tác giả (author)')
      
      return NextResponse.json(
        { 
          error: 'Thiếu thông tin bắt buộc', 
          message: `Vui lòng điền đầy đủ các trường: ${missingFields.join(', ')}`,
          missingFields 
        },
        { status: 400 }
      )
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        date: new Date(date),
        author,
        categories: categories || [],
        image: image || null,
        readTime: readTime ? parseInt(readTime) : null,
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error: any) {
    console.error('Error creating blog post:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Đường dẫn đã tồn tại', message: 'Bài viết với đường dẫn (slug) này đã tồn tại. Vui lòng chọn đường dẫn khác.' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Lỗi tạo bài viết', message: 'Không thể tạo bài viết. Vui lòng thử lại sau.' },
      { status: 500 }
    )
  }
}

