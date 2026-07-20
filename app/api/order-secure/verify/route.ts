import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getGuestVerificationCode } from '@/lib/guest-order'
import { getOrderTrackingMeta } from '@/lib/order-utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { orderNumber, token, code } = await request.json()
    if (!orderNumber || !token || !code) {
      return NextResponse.json({ error: 'Missing verification information' }, { status: 400 })
    }

    const order = await prisma.order.findFirst({
      where: {
        orderNumber: String(orderNumber),
        guestAccessToken: String(token).toUpperCase(),
      },
      include: {
        items: true,
        invoices: {
          where: { status: 'finalized' },
          orderBy: { revision: 'desc' },
          take: 1,
        },
      },
    })
    const address = (order?.billingAddress || order?.shippingAddress) as any
    if (!order || getGuestVerificationCode(address) !== String(code).replace(/\s+/g, '').toUpperCase()) {
      return NextResponse.json({ error: 'The order link or verification code is incorrect' }, { status: 401 })
    }

    const products = await prisma.product.findMany({
      where: { id: { in: order.items.map((item) => item.productId) } },
      select: { id: true, name: true, sku: true, images: true },
    })
    const productMap = new Map(products.map((product) => [product.id, product]))
    const shippingAddress = order.shippingAddress as any

    return NextResponse.json({
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        discount: order.discount || 0,
        createdAt: order.createdAt,
        billingAddress: order.billingAddress,
        shippingAddress: order.shippingAddress,
        tracking: getOrderTrackingMeta(shippingAddress),
        items: order.items.map((item) => ({
          ...item,
          name: productMap.get(item.productId)?.name || 'Product',
          sku: productMap.get(item.productId)?.sku || 'N/A',
          image: productMap.get(item.productId)?.images?.[0] || null,
        })),
        invoice: order.invoices[0]
          ? { invoiceNumber: order.invoices[0].invoiceNumber, html: order.invoices[0].html }
          : null,
      },
    })
  } catch (error) {
    console.error('Secure order verification failed:', error)
    return NextResponse.json({ error: 'Unable to verify this order' }, { status: 500 })
  }
}
