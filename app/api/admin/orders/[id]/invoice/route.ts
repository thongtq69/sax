import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { buildInvoiceSnapshot } from '@/lib/invoice'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { action = 'create' } = await request.json().catch(() => ({}))
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true, invoices: { orderBy: { revision: 'desc' } } } })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (!['paid', 'processing', 'shipped', 'delivered'].includes(order.status)) {
    return NextResponse.json({ error: 'An invoice can only be created after payment' }, { status: 409 })
  }
  const latest = order.invoices[0]
  if (latest?.status === 'draft') return NextResponse.json(latest)
  if (latest && action !== 'revision') return NextResponse.json({ error: 'Use Create Revision for a finalized invoice' }, { status: 409 })
  const products = await prisma.product.findMany({
    where: { id: { in: order.items.map((item) => item.productId) } },
    select: { id: true, name: true, sku: true },
  })
  const productMap = new Map(products.map((product) => [product.id, product]))
  const orderForSnapshot = {
    ...order,
    items: order.items.map((item) => ({
      ...item,
      productName: productMap.get(item.productId)?.name,
      productSku: productMap.get(item.productId)?.sku,
    })),
  }
  const invoice = await prisma.invoice.create({
    data: {
      orderId: order.id,
      revision: latest ? latest.revision + 1 : 0,
      supersedesInvoiceId: latest?.id || null,
      snapshot: buildInvoiceSnapshot(orderForSnapshot),
    },
  })
  return NextResponse.json(invoice, { status: 201 })
}
