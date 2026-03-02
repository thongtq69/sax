import { prisma } from '@/lib/prisma'

type StockDeductionResult = {
  success: boolean
  alreadyProcessed: boolean
  failures: Array<{ productId: string; quantity: number; reason: string }>
}

export async function deductOrderStock(orderId: string, trigger: string): Promise<StockDeductionResult> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  })

  if (!order) {
    return {
      success: false,
      alreadyProcessed: false,
      failures: [{ productId: '', quantity: 0, reason: 'Order not found' }],
    }
  }

  const billingAddress = (order.billingAddress as Record<string, any>) || {}
  if (billingAddress.stockDeductedAt) {
    return { success: true, alreadyProcessed: true, failures: [] }
  }

  const failures: Array<{ productId: string; quantity: number; reason: string }> = []

  for (const item of order.items) {
    const quantity = Math.max(1, item.quantity || 1)

    const decrementResult = await prisma.product.updateMany({
      where: {
        id: item.productId,
        stockStatus: { not: 'sold-out' },
        stock: { gte: quantity },
      },
      data: {
        stock: { decrement: quantity },
      },
    })

    if (decrementResult.count === 0) {
      failures.push({
        productId: item.productId,
        quantity,
        reason: 'Out of stock or already sold',
      })
      continue
    }

    const updated = await prisma.product.findUnique({
      where: { id: item.productId },
      select: {
        id: true,
        stock: true,
        stockStatus: true,
      },
    })

    if (!updated) {
      failures.push({
        productId: item.productId,
        quantity,
        reason: 'Product not found after update',
      })
      continue
    }

    const stockLeft = Math.max(0, updated.stock || 0)
    if (stockLeft <= 0) {
      await prisma.product.update({
        where: { id: updated.id },
        data: {
          stock: 0,
          stockStatus: 'sold-out',
          inStock: false,
        },
      })
    } else {
      await prisma.product.update({
        where: { id: updated.id },
        data: {
          inStock: true,
          stockStatus: updated.stockStatus === 'pre-order' ? 'pre-order' : 'in-stock',
        },
      })
    }
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      billingAddress: {
        ...billingAddress,
        stockDeductedAt: failures.length === 0 ? new Date().toISOString() : null,
        stockDeductionFailed: failures.length > 0,
        stockDeductionTrigger: trigger,
        stockDeductionFailures: failures,
      },
    },
  })

  return {
    success: failures.length === 0,
    alreadyProcessed: false,
    failures,
  }
}
