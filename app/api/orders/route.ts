import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { deductOrderStock } from '@/lib/order-stock'
import { requireAdmin } from '@/lib/admin-auth'
import { sendOrderConfirmationOnce } from '@/lib/order-confirmation'
import { renderInvoiceRecord } from '@/lib/invoice'

export const dynamic = 'force-dynamic'

async function enrichOrdersWithProducts(orders: any[]) {
  const productIds = orders.flatMap(order => order.items.map((item: any) => item.productId))
  const uniqueProductIds = [...new Set(productIds)]

  const products = await prisma.product.findMany({
    where: { id: { in: uniqueProductIds } },
    select: { id: true, sku: true, name: true },
  })

  const productMap = new Map(products.map(p => [p.id, { sku: p.sku, name: p.name }]))

  return orders.map(order => ({
    ...order,
    invoices: order.invoices?.map((invoice: any) => invoice.status === 'finalized'
      ? { ...invoice, html: renderInvoiceRecord(invoice, order) }
      : invoice),
    items: order.items.map((item: any) => ({
      ...item,
      productSku: productMap.get(item.productId)?.sku || 'N/A',
      productName: productMap.get(item.productId)?.name || 'Unknown Product',
    })),
  }))
}

export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const identifier = searchParams.get('identifier') // orderNumber or _id
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (id || identifier) {
      // Look up by orderNumber preferred, fall back to MongoDB _id for legacy callers.
      // MongoDB ObjectId must be 24 hex chars; querying { id: <non-hex> } makes
      // Prisma throw at the driver layer, so only include the id branch when valid.
      const lookupValue = identifier || id || ''
      const isObjectId = /^[a-f0-9]{24}$/i.test(lookupValue)
      const orConditions: any[] = [{ orderNumber: lookupValue }]
      if (isObjectId) orConditions.push({ id: lookupValue })

      const order = await prisma.order.findFirst({
        where: { OR: orConditions },
        include: {
          items: true,
          user: {
            select: { id: true, name: true, email: true },
          },
          invoices: { orderBy: { revision: 'desc' } },
        },
      })

      if (!order) {
        return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 })
      }

      const [enrichedOrder] = await enrichOrdersWithProducts([order])
      return NextResponse.json({ order: enrichedOrder })
    }

    const where: any = {}

    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      // Note: MongoDB ObjectId fields (id) cannot use contains/insensitive,
      // and exact id match needs the 24-hex format. Only add the id branch
      // when the search term looks like an ObjectId.
      const isObjectId = /^[a-f0-9]{24}$/i.test(search)
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        ...(isObjectId ? [{ id: search }] : []),
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

    const ordersWithSku = await enrichOrdersWithProducts(orders)

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
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id, status, carrier, trackingNumber, notes } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Thiếu thông tin', message: 'Vui lòng cung cấp ID đơn hàng' },
        { status: 400 }
      )
    }

    if (!status && carrier === undefined && trackingNumber === undefined && notes === undefined) {
      return NextResponse.json(
        { error: 'Thiếu thông tin', message: 'Vui lòng cập nhật ít nhất một trường đơn hàng' },
        { status: 400 }
      )
    }

    const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Trạng thái không hợp lệ', message: `Trạng thái phải là một trong: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Get order details before updating (to check previous status)
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: true,
      },
    })

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Không tìm thấy đơn hàng', message: 'Đơn hàng với ID này không tồn tại trong hệ thống' },
        { status: 404 }
      )
    }

    const nextShippingAddress = {
      ...((existingOrder.shippingAddress as any) || {}),
      ...(carrier !== undefined ? { carrier: carrier || null } : {}),
      ...(trackingNumber !== undefined ? { trackingNumber: trackingNumber || null } : {}),
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(carrier !== undefined || trackingNumber !== undefined ? { shippingAddress: nextShippingAddress } : {}),
        ...(notes !== undefined ? { notes: notes || null } : {}),
      },
    })

    const shouldDeductStock = status ? ['paid', 'processing', 'shipped', 'delivered'].includes(status) : false
    if (shouldDeductStock) {
      try {
        const stockResult = await deductOrderStock(id, `admin-order-status-${status}`)
        if (!stockResult.success) {
          console.warn(`Stock deduction issues for order ${id}:`, stockResult.failures)
        }
      } catch (stockError) {
        console.error(`Failed to deduct stock for order ${id}:`, stockError)
      }
    }

    // Send order confirmation email when status changes to "paid"
    if (status === 'paid' && existingOrder.status !== 'paid') {
      try {
        const emailResult = await sendOrderConfirmationOnce(existingOrder.id)
        console.log(`Order confirmation result for ${existingOrder.orderNumber || existingOrder.id}:`, emailResult)
      } catch (emailError) {
        console.error('Error sending order confirmation email:', emailError)
        // Don't fail the status update if email fails
      }
    }

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
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
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
