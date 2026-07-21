import { prisma } from '@/lib/prisma'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { generateGuestAccessToken, getSecureOrderPath } from '@/lib/guest-order'
import { getBaseUrl } from '@/lib/seo'
import { normalizeOrderAddress } from '@/lib/order-address'

const EMAIL_CLAIM_TIMEOUT_MS = 10 * 60 * 1000

function displayName(address: Record<string, any>) {
  return address.name || [address.firstName, address.lastName].filter(Boolean).join(' ') || ''
}

async function ensureSecureToken(orderId: string, currentToken?: string | null) {
  if (currentToken) return currentToken
  const candidate = generateGuestAccessToken()
  await prisma.order.updateMany({
    where: {
      id: orderId,
      OR: [
        { guestAccessToken: null },
        { guestAccessToken: { isSet: false } },
      ],
    },
    data: { guestAccessToken: candidate },
  })
  const current = await prisma.order.findUnique({
    where: { id: orderId },
    select: { guestAccessToken: true },
  })
  if (!current?.guestAccessToken) throw new Error('Unable to create a secure order link')
  return current.guestAccessToken
}

export async function sendOrderConfirmationOnce(orderId: string) {
  const claimedAt = new Date()
  const staleBefore = new Date(claimedAt.getTime() - EMAIL_CLAIM_TIMEOUT_MS)
  const claim = await prisma.order.updateMany({
    where: {
      id: orderId,
      AND: [
        {
          OR: [
            { confirmationEmailSentAt: null },
            { confirmationEmailSentAt: { isSet: false } },
          ],
        },
        {
          OR: [
            { confirmationEmailClaimedAt: null },
            { confirmationEmailClaimedAt: { isSet: false } },
            { confirmationEmailClaimedAt: { lt: staleBefore } },
          ],
        },
      ],
    },
    data: { confirmationEmailClaimedAt: claimedAt },
  })

  if (!claim.count) return { sent: false, reason: 'already-sent-or-in-progress' as const }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: { select: { email: true, name: true } } },
    })
    if (!order) throw new Error('Order not found')

    const secureToken = await ensureSecureToken(order.id, order.guestAccessToken)
    const billing = normalizeOrderAddress(order.billingAddress)
    const shipping = normalizeOrderAddress(order.shippingAddress)
    const contacts = new Map<string, string>()
    const addContact = (email?: string | null, name?: string | null) => {
      const normalizedEmail = String(email || '').trim().toLowerCase()
      if (!normalizedEmail || !normalizedEmail.includes('@')) return
      if (!contacts.has(normalizedEmail)) contacts.set(normalizedEmail, String(name || '').trim())
    }
    addContact(order.user?.email, order.user?.name)
    addContact(billing.email, displayName(billing))
    addContact(billing.paypalEmail || billing.payerEmail, billing.paypalName || displayName(billing))
    addContact(shipping.email, displayName(shipping))
    addContact(shipping.paypalEmail || shipping.payerEmail, shipping.paypalName || displayName(shipping))

    if (!contacts.size) {
      await prisma.order.update({
        where: { id: order.id },
        data: { confirmationEmailClaimedAt: null },
      })
      return { sent: false, reason: 'no-recipient' as const }
    }

    const products = await prisma.product.findMany({
      where: { id: { in: order.items.map((item) => item.productId) } },
      select: { id: true, name: true, sku: true, images: true },
    })
    const productMap = new Map(products.map((product) => [product.id, product]))
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const discount = order.discount || 0
    const shippingCost = Math.max(0, order.total + discount - subtotal)
    const orderNumber = order.orderNumber || order.id

    await sendOrderConfirmationEmail({
      orderId: order.id,
      orderNumber,
      customerEmail: Array.from(contacts.keys()),
      customerName: Array.from(new Set(Array.from(contacts.values()).filter(Boolean))),
      items: order.items.map((item) => ({
        name: productMap.get(item.productId)?.name || 'Product',
        sku: productMap.get(item.productId)?.sku || 'N/A',
        quantity: item.quantity,
        price: item.price,
        image: productMap.get(item.productId)?.images?.[0] || undefined,
      })),
      subtotal,
      shipping: shippingCost,
      tax: 0,
      total: order.total,
      discount,
      couponCode: order.couponCode || undefined,
      secureOrderUrl: `${getBaseUrl()}${getSecureOrderPath(orderNumber, secureToken)}`,
    })

    await prisma.order.update({
      where: { id: order.id },
      data: { confirmationEmailClaimedAt: null, confirmationEmailSentAt: new Date() },
    })
    return { sent: true, recipients: Array.from(contacts.keys()) }
  } catch (error) {
    await prisma.order.updateMany({
      where: {
        id: orderId,
        OR: [
          { confirmationEmailSentAt: null },
          { confirmationEmailSentAt: { isSet: false } },
        ],
      },
      data: { confirmationEmailClaimedAt: null },
    })
    throw error
  }
}
