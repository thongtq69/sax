import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}

    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { shippingAddress: { path: ['email'], string_contains: search } },
        { shippingAddress: { path: ['firstName'], string_contains: search } },
        { shippingAddress: { path: ['lastName'], string_contains: search } },
      ]
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Lỗi tải đơn hàng', message: 'Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Thiếu thông tin', message: 'Vui lòng cung cấp ID đơn hàng' },
        { status: 400 }
      )
    }

    if (!status) {
      return NextResponse.json(
        { error: 'Thiếu thông tin', message: 'Vui lòng chọn trạng thái đơn hàng' },
        { status: 400 }
      )
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Trạng thái không hợp lệ', message: `Trạng thái phải là một trong: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(order)
  } catch (error: any) {
    console.error('Error updating order:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Không tìm thấy đơn hàng', message: 'Đơn hàng với ID này không tồn tại trong hệ thống' },
        { status: 404 }
      )
    }
    return NextResponse.json({ error: 'Lỗi cập nhật đơn hàng', message: 'Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.' }, { status: 500 })
  }
}
