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
        { orderNumber: { contains: search, mode: 'insensitive' } },
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
          items: {
            include: {
              // Note: OrderItem doesn't have direct relation to Product in schema
              // We'll need to fetch product info separately
            }
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    // Fetch product SKUs for all order items
    const productIds = orders.flatMap(order => order.items.map(item => item.productId))
    const uniqueProductIds = [...new Set(productIds)]
    
    const products = await prisma.product.findMany({
      where: { id: { in: uniqueProductIds } },
      select: { id: true, sku: true, name: true },
    })
    
    const productMap = new Map(products.map(p => [p.id, { sku: p.sku, name: p.name }]))
    
    // Add SKU info to order items
    const ordersWithSku = orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        productSku: productMap.get(item.productId)?.sku || 'N/A',
        productName: productMap.get(item.productId)?.name || 'Unknown Product',
      })),
    }))

    return NextResponse.json({
      orders: ordersWithSku,
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


export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Thiếu thông tin', message: 'Vui lòng cung cấp ID đơn hàng' },
        { status: 400 }
      )
    }

    // Delete order items first (due to foreign key constraint)
    await prisma.orderItem.deleteMany({
      where: { orderId: id },
    })

    // Then delete the order
    await prisma.order.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Đơn hàng đã được xóa' })
  } catch (error: any) {
    console.error('Error deleting order:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Không tìm thấy đơn hàng', message: 'Đơn hàng với ID này không tồn tại trong hệ thống' },
        { status: 404 }
      )
    }
    return NextResponse.json({ error: 'Lỗi xóa đơn hàng', message: 'Không thể xóa đơn hàng. Vui lòng thử lại sau.' }, { status: 500 })
  }
}
