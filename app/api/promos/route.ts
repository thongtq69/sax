import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/promos - Get all promo banners
export async function GET(request: NextRequest) {
  try {
    // Don't call $connect() explicitly - Prisma will connect on first query
    const promos = await prisma.promoBanner.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(promos)
  } catch (error: any) {
    console.error('Error fetching promo banners:', error)
    return NextResponse.json(
      { 
        error: 'Lỗi tải promo banners',
        message: 'Không thể tải danh sách promo banners. Vui lòng thử lại sau.',
      },
      { status: 500 }
    )
  }
}

// POST /api/promos - Create a new promo banner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, image, ctaText, ctaLink } = body

    if (!title || !description || !image || !ctaText || !ctaLink) {
      const missingFields = []
      if (!title) missingFields.push('Tiêu đề (title)')
      if (!description) missingFields.push('Mô tả (description)')
      if (!image) missingFields.push('Hình ảnh (image)')
      if (!ctaText) missingFields.push('Nút CTA (ctaText)')
      if (!ctaLink) missingFields.push('Link CTA (ctaLink)')
      
      return NextResponse.json(
        { 
          error: 'Thiếu thông tin bắt buộc', 
          message: `Vui lòng điền đầy đủ các trường: ${missingFields.join(', ')}`,
          missingFields 
        },
        { status: 400 }
      )
    }

    const promo = await prisma.promoBanner.create({
      data: {
        title,
        description,
        image,
        ctaText,
        ctaLink,
      },
    })

    return NextResponse.json(promo, { status: 201 })
  } catch (error) {
    console.error('Error creating promo banner:', error)
    return NextResponse.json(
      { error: 'Lỗi tạo promo banner', message: 'Không thể tạo promo banner. Vui lòng thử lại sau.' },
      { status: 500 }
    )
  }
}

