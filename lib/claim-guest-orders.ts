import { prisma } from '@/lib/prisma'

export async function claimGuestOrders(userId: string, email?: string | null) {
  if (!email) return 0
  const normalized = email.trim().toLowerCase()
  const candidates = await prisma.order.findMany({
    where: { userId: null },
    select: { id: true, shippingAddress: true, billingAddress: true },
  })
  const ids = candidates
    .filter((order) => {
      const shippingEmail = String((order.shippingAddress as any)?.email || '').toLowerCase()
      const billingEmail = String((order.billingAddress as any)?.email || '').toLowerCase()
      return shippingEmail === normalized || billingEmail === normalized
    })
    .map((order) => order.id)

  if (!ids.length) return 0
  const result = await prisma.order.updateMany({
    where: { id: { in: ids }, userId: null },
    data: { userId },
  })
  return result.count
}
