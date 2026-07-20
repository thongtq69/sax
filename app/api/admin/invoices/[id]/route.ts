import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { renderInvoiceHtml } from '@/lib/invoice'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await request.json()
  const invoice = await prisma.invoice.findUnique({ where: { id }, include: { order: true } })
  if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  if (invoice.status !== 'draft') return NextResponse.json({ error: 'Finalized invoices are immutable' }, { status: 409 })

  const snapshot = body.snapshot || invoice.snapshot
  if (body.action !== 'finalize') {
    return NextResponse.json(await prisma.invoice.update({ where: { id }, data: { snapshot } }))
  }

  const orderNumber = invoice.order.orderNumber || invoice.order.id
  const invoiceNumber = `INV-${orderNumber}${invoice.revision ? `-REV${invoice.revision}` : ''}`
  const finalizedAt = new Date()
  const html = renderInvoiceHtml(snapshot, invoiceNumber, orderNumber, finalizedAt)
  if (invoice.supersedesInvoiceId) {
    await prisma.invoice.updateMany({
      where: { id: invoice.supersedesInvoiceId, status: 'finalized' },
      data: { status: 'superseded' },
    })
  }
  const finalized = await prisma.invoice.update({
    where: { id },
    data: { snapshot, status: 'finalized', invoiceNumber, finalizedAt, html },
  })
  return NextResponse.json(finalized)
}
