import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

type CartValidationInput = {
  cartItemId?: string
  productId?: string
  id?: string
  quantity?: number
}

function normalizeQuantity(value: unknown) {
  const quantity = typeof value === 'number' ? value : parseInt(String(value || '1'), 10)
  return Math.max(1, Number.isFinite(quantity) ? quantity : 1)
}

function validateProduct(product: any, quantity: number) {
  if (!product) {
    return {
      available: false,
      reason: 'not-found',
      message: 'This product no longer exists.',
    }
  }

  if (product.status === 'draft' || product.isVisible === false || product.stockStatus === 'archived') {
    return {
      available: false,
      reason: 'hidden',
      message: 'This product is no longer available for purchase.',
    }
  }

  if (product.stockStatus === 'pre-order') {
    return {
      available: true,
      reason: 'pre-order',
      message: 'Available for pre-order.',
    }
  }

  if (product.stockStatus === 'sold-out' || product.inStock === false) {
    return {
      available: false,
      reason: 'sold-out',
      message: 'This instrument is sold out.',
    }
  }

  const stock = typeof product.stock === 'number' ? product.stock : 0
  if (stock < quantity) {
    return {
      available: false,
      reason: stock <= 0 ? 'sold-out' : 'insufficient-stock',
      message: stock <= 0 ? 'This instrument is sold out.' : `Only ${stock} available.`,
    }
  }

  return {
    available: true,
    reason: 'available',
    message: stock <= 5 ? `Only ${stock} available.` : 'Available.',
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const rawItems: CartValidationInput[] = Array.isArray(body?.items) ? body.items : []

    const items = rawItems
      .map((item) => {
        const productId = item.productId || item.id
        return {
          cartItemId: item.cartItemId || item.id || productId || '',
          productId,
          quantity: normalizeQuantity(item.quantity),
        }
      })
      .filter((item): item is { cartItemId: string; productId: string; quantity: number } => {
        return Boolean(item.productId && /^[a-f\d]{24}$/i.test(item.productId))
      })

    if (items.length === 0) {
      return NextResponse.json({ items: [], hasUnavailable: false })
    }

    const productIds = Array.from(new Set(items.map((item) => item.productId)))
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        price: true,
        stock: true,
        stockStatus: true,
        inStock: true,
        isVisible: true,
        status: true,
      },
    })

    const productMap = new Map(products.map((product) => [product.id, product]))

    const validatedItems = items.map((item) => {
      const product = productMap.get(item.productId)
      const validation = validateProduct(product, item.quantity)
      return {
        cartItemId: item.cartItemId,
        productId: item.productId,
        quantity: item.quantity,
        product: product
          ? {
              id: product.id,
              name: product.name,
              slug: product.slug,
              sku: product.sku,
              price: product.price,
              stock: product.stock,
              stockStatus: product.stockStatus,
              inStock: product.inStock,
              isVisible: product.isVisible,
              status: product.status,
            }
          : null,
        ...validation,
      }
    })

    return NextResponse.json({
      items: validatedItems,
      hasUnavailable: validatedItems.some((item) => !item.available),
    })
  } catch (error: any) {
    console.error('Cart validation error:', error)
    return NextResponse.json(
      { error: 'Failed to validate cart', message: error?.message || 'Unknown error' },
      { status: 500 },
    )
  }
}
