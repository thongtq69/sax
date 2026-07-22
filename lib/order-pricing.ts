import { prisma } from '@/lib/prisma'
import { findShippingZone, normalizeShippingCountry } from '@/lib/shipping-country'

type RequestedItem = { productId?: string; id?: string; quantity?: number }

export async function calculateServerOrderPricing(
  requestedItems: RequestedItem[],
  country: string,
  couponCode?: string | null,
) {
  const normalized = requestedItems.map((item) => ({
    productId: item.productId || item.id || '',
    quantity: Math.max(1, Math.min(10, Number(item.quantity) || 1)),
  }))
  const productIds = normalized.map((item) => item.productId)
  if (!productIds.every((id) => /^[a-f\d]{24}$/i.test(id))) throw new Error('Invalid cart items')

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true, name: true, sku: true, price: true, discount: true, shippingCost: true,
      stock: true, stockStatus: true, inStock: true, isVisible: true, status: true,
    },
  })
  const map = new Map(products.map((product) => [product.id, product]))
  const items = normalized.map((item) => {
    const product = map.get(item.productId)
    if (!product || product.status === 'draft' || product.isVisible === false || product.stockStatus === 'archived') {
      throw new Error('A product is no longer available')
    }
    if (product.stockStatus === 'sold-out' || product.inStock === false ||
      (product.stockStatus !== 'pre-order' && (product.stock ?? 0) < item.quantity)) {
      throw new Error(`${product.name} is sold out or has insufficient stock`)
    }
    return {
      productId: product.id,
      name: product.name,
      sku: product.sku,
      quantity: item.quantity,
      price: Math.max(0, product.price - (product.discount || 0)),
      shippingCost: product.shippingCost,
    }
  })

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const [settings, zones, couponSection] = await Promise.all([
    prisma.siteSettings.findFirst(),
    prisma.shippingZone.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
    prisma.homepageContent.findUnique({ where: { sectionKey: 'rewards-vouchers' } }),
  ])

  const countryCode = normalizeShippingCountry(country)
  let shipping = 0
  if (countryCode === 'VN') {
    shipping = settings?.domesticShippingCost ?? 25
  } else {
    const zone = findShippingZone(zones, countryCode)
    const base = zone?.shippingCost ?? 200
    const productRates = items.map((item) => item.shippingCost || 0).filter(Boolean)
    shipping = productRates.length ? Math.max(base, ...productRates) : base
  }

  let discount = 0
  let acceptedCoupon: string | null = null
  const coupons = ((couponSection?.metadata as any)?.coupons || []) as any[]
  const coupon = couponCode ? coupons.find((entry) => String(entry.code).toUpperCase() === couponCode.toUpperCase()) : null
  if (coupon) {
    const applicableItems = coupon.applicableProducts?.length
      ? items.filter((item) => coupon.applicableProducts.includes(item.productId))
      : items
    const applicableSubtotal = applicableItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    if (applicableSubtotal >= Number(coupon.minSpend || 0)) {
      discount = String(coupon.amount).endsWith('%')
        ? applicableSubtotal * (Number.parseFloat(coupon.amount) / 100)
        : Math.min(Number.parseFloat(String(coupon.amount).replace(/[^0-9.]/g, '')) || 0, applicableSubtotal)
      acceptedCoupon = coupon.code
    }
  }

  return {
    items,
    subtotal,
    shipping,
    discount,
    couponCode: acceptedCoupon,
    total: Math.max(0, subtotal + shipping - discount),
  }
}
