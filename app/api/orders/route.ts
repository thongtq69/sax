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

    // Fetch product Serials for all order items
    const productIds = orders.flatMap(order => order.items.map(item => item.productId))
    const uniqueProductIds = [...new Set(productIds)]

    const products = await prisma.product.findMany({
      where: { id: { in: uniqueProductIds } },
      select: { id: true, sku: true, name: true },
    })

    const productMap = new Map(products.map(p => [p.id, { sku: p.sku, name: p.name }]))

    // Add Serial info to order items
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

    const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
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

    // Update order status
    const order = await prisma.order.update({
      where: { id },
      data: { status },
    })

    // Send order confirmation email when status changes to "paid"
    if (status === 'paid' && existingOrder.status !== 'paid') {
      try {
        // Get customer email from multiple sources (priority order)
        const shippingAddress = existingOrder.shippingAddress as any
        const customerEmail = existingOrder.user?.email || shippingAddress?.email || null

        if (customerEmail) {
          // Fetch product details for order items
          const productIds = existingOrder.items.map(item => item.productId)
          const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true, sku: true },
          })

          const productMap = new Map(products.map(p => [p.id, p]))

          // Prepare email data
          const { sendOrderConfirmationEmail } = await import('@/lib/email')

          // For email: show full payment amount (including shipping)
          // Customer paid $30 total, so show $30 in email
          const subtotal = existingOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
          const shipping = existingOrder.total - subtotal // Calculate actual shipping cost
          const tax = 0
          const totalForEmail = existingOrder.total // Full amount customer paid

          await sendOrderConfirmationEmail({
            orderNumber: existingOrder.orderNumber || existingOrder.id,
            customerEmail,
            customerName: shippingAddress?.firstName
              ? `${shippingAddress.firstName} ${shippingAddress.lastName || ''}`.trim()
              : existingOrder.user?.name || 'Valued Customer',
            items: existingOrder.items.map(item => {
              const product = productMap.get(item.productId)
              return {
                name: product?.name || 'Product',
                sku: product?.sku || 'N/A',
                quantity: item.quantity,
                price: item.price,
              }
            }),
            subtotal,
            shipping,
            tax,
            total: totalForEmail, // Show full payment amount in email
            shippingAddress: shippingAddress ? {
              firstName: shippingAddress.firstName || '',
              lastName: shippingAddress.lastName || '',
              address1: shippingAddress.address1 || '',
              address2: shippingAddress.address2 || '',
              city: shippingAddress.city || '',
              state: shippingAddress.state || '',
              zip: shippingAddress.zip || '',
              country: shippingAddress.country || '',
              phone: shippingAddress.phone || '',
            } : undefined,
          })

          console.log(`✅ Order confirmation email sent to ${customerEmail} for order ${existingOrder.orderNumber || existingOrder.id}`)
        } else {
          console.warn(`⚠️ No email found for order ${existingOrder.orderNumber || existingOrder.id}`)
        }
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
