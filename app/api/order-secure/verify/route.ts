import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getGuestVerificationCode } from '@/lib/guest-order'
import { getOrderTrackingMeta } from '@/lib/order-utils'
import { getVerificationAddress, normalizeOrderAddress } from '@/lib/order-address'
import { timingSafeEqual } from 'crypto'
import { renderInvoiceRecord, getOrderPaymentMethod } from '@/lib/invoice'

export const dynamic = 'force-dynamic'

const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 8
type Attempt = { count: number; resetAt: number }
const globalForGuestVerification = globalThis as typeof globalThis & {
  guestVerificationAttempts?: Map<string, Attempt>
}
const attempts = globalForGuestVerification.guestVerificationAttempts ?? new Map<string, Attempt>()
globalForGuestVerification.guestVerificationAttempts = attempts

function isEqual(left: string, right: string) {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(request: NextRequest) {
  try {
    const { orderNumber, token, code } = await request.json()
    if (!orderNumber || !token || !code) {
      return NextResponse.json({ error: 'Missing verification information' }, { status: 400 })
    }

    const normalizedToken = String(token).replace(/\s+/g, '').toUpperCase()
    if (!/^(?:[A-F0-9]{8}|[A-F0-9]{32})$/.test(normalizedToken)) {
      return NextResponse.json({ error: 'The order link or verification code is incorrect' }, { status: 401 })
    }

    const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const attemptKey = `${forwardedFor}:${String(orderNumber)}:${normalizedToken}`
    const now = Date.now()
    if (attempts.size > 5_000) {
      for (const [key, value] of attempts) {
        if (value.resetAt <= now) attempts.delete(key)
      }
      while (attempts.size > 5_000) {
        const oldestKey = attempts.keys().next().value
        if (!oldestKey) break
        attempts.delete(oldestKey)
      }
    }
    const currentAttempt = attempts.get(attemptKey)
    if (currentAttempt && currentAttempt.resetAt > now && currentAttempt.count >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: 'Too many verification attempts. Please wait 15 minutes and try again.' },
        { status: 429, headers: { 'Retry-After': '900' } },
      )
    }
    if (!currentAttempt || currentAttempt.resetAt <= now) {
      attempts.set(attemptKey, { count: 0, resetAt: now + WINDOW_MS })
    }

    const order = await prisma.order.findFirst({
      where: {
        orderNumber: String(orderNumber),
        guestAccessToken: normalizedToken,
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
    const address = getVerificationAddress(order?.billingAddress, order?.shippingAddress)
    const expectedCode = getGuestVerificationCode(address)
    const suppliedCode = String(code).replace(/\s+/g, '').toUpperCase()
    if (!order || !isEqual(expectedCode, suppliedCode)) {
      const entry = attempts.get(attemptKey) || { count: 0, resetAt: now + WINDOW_MS }
      entry.count += 1
      attempts.set(attemptKey, entry)
      return NextResponse.json({ error: 'The order link or verification code is incorrect' }, { status: 401 })
    }
    attempts.delete(attemptKey)

    const products = await prisma.product.findMany({
      where: { id: { in: order.items.map((item) => item.productId) } },
      select: { id: true, name: true, sku: true, images: true, slug: true, specs: true },
    })
    const productMap = new Map(products.map((product) => [product.id, product]))
    const shippingAddress = normalizeOrderAddress(order.shippingAddress)
    const billingAddress = normalizeOrderAddress(order.billingAddress)
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const discount = order.discount || 0
    const shipping = Math.max(0, order.total + discount - subtotal)

    return NextResponse.json({
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        subtotal,
        shipping,
        discount,
        couponCode: order.couponCode,
        paymentMethod: getOrderPaymentMethod(order),
        createdAt: order.createdAt,
        billingAddress,
        shippingAddress,
        tracking: getOrderTrackingMeta(shippingAddress),
        items: order.items.map((item) => ({
          ...item,
          name: productMap.get(item.productId)?.name || 'Product',
          sku: productMap.get(item.productId)?.sku || 'N/A',
          image: productMap.get(item.productId)?.images?.[0] || null,
          slug: productMap.get(item.productId)?.slug || null,
          specs: productMap.get(item.productId)?.specs || null,
        })),
        invoice: order.invoices[0]
          ? {
              invoiceNumber: order.invoices[0].invoiceNumber,
              html: renderInvoiceRecord(order.invoices[0], order),
            }
          : null,
      },
    })
  } catch (error) {
    console.error('Secure order verification failed:', error)
    return NextResponse.json({ error: 'Unable to verify this order' }, { status: 500 })
  }
}
