import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink, Package, Truck } from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getProductUrl } from '@/lib/api'
import { getOrderTrackingMeta } from '@/lib/order-utils'
import { OrderReviewForm } from '@/components/account/OrderReviewForm'

export default async function AccountOrderDetailPage(props: { params: Promise<{ orderNumber: string }> }) {
  const params = await props.params;
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  // Look up by orderNumber first; fall back to MongoDB _id for legacy URLs.
  // Only include the id branch for valid 24-hex ObjectIds — otherwise Prisma
  // throws at the driver layer when given a non-ObjectId string (e.g. the
  // 15-digit human-readable orderNumber that customer emails link to).
  const identifier = params.orderNumber
  const isObjectId = /^[a-f0-9]{24}$/i.test(identifier)
  const orConditions: any[] = [{ orderNumber: identifier }]
  if (isObjectId) orConditions.push({ id: identifier })

  const order = await prisma.order.findFirst({
    where: {
      userId: session.user.id,
      OR: orConditions,
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

  if (!order) {
    notFound()
  }

  const products = await prisma.product.findMany({
    where: { id: { in: order.items.map((item) => item.productId) } },
    select: { id: true, name: true, images: true, slug: true, sku: true, specs: true },
  })

  const productMap = new Map(products.map((product) => [product.id, product]))
  const shippingAddress = order.shippingAddress as any
  const trackingMeta = getOrderTrackingMeta(shippingAddress)
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = order.discount || 0
  const shipping = Math.max(0, order.total + discount - subtotal)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div>
            <Link href="/account/orders" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to orders
            </Link>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">Order #{order.orderNumber || order.id.slice(-8).toUpperCase()}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {new Date(order.createdAt).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-6">
              <section className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <Package className="h-5 w-5 text-primary" />
                  Purchased Items
                </div>
                <div className="mt-5 space-y-4">
                  {order.items.map((item) => {
                    const product = productMap.get(item.productId)
                    const canReview = ['paid', 'processing', 'shipped', 'delivered'].includes(order.status)

                    return (
                      <div key={item.id} className="rounded-2xl border p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            {product ? (
                              <Link
                                href={getProductUrl(product.sku, product.slug || '', typeof product.specs === 'object' && product.specs ? (product.specs as any).SN : '')}
                                className="font-semibold text-slate-900 hover:text-primary"
                              >
                                {product.name}
                              </Link>
                            ) : (
                              <p className="font-semibold text-slate-900">Product no longer available</p>
                            )}
                            <p className="mt-1 text-sm text-slate-500">Qty: {item.quantity} x ${item.price.toLocaleString()}</p>
                          </div>
                          <p className="text-lg font-semibold text-slate-900">${(item.price * item.quantity).toLocaleString()}</p>
                        </div>

                        <div className="mt-4">
                          <OrderReviewForm
                            productId={item.productId}
                            disabled={!canReview}
                            disabledMessage="Review unlocks once the order is paid."
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>

              {order.invoices[0]?.html && (
                <section className="rounded-2xl border bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">Invoice {order.invoices[0].invoiceNumber}</h2>
                    <span className="text-xs text-slate-500">Use your browser&apos;s Print command to save a PDF.</span>
                  </div>
                  <iframe title="Invoice" srcDoc={order.invoices[0].html} className="h-[800px] w-full rounded-lg border" />
                </section>
              )}
            </div>

            <div className="space-y-6">
              <section className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Order Status</p>
                <p className="mt-3 text-2xl font-bold capitalize text-slate-900">{order.status}</p>

                {trackingMeta.trackingNumber && (
                  <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm text-blue-800">
                    <div className="flex items-center gap-2 font-medium">
                      <Truck className="h-4 w-4" />
                      {trackingMeta.carrier?.toUpperCase()} tracking
                    </div>
                    <p className="mt-2 font-mono">{trackingMeta.trackingNumber}</p>
                    {trackingMeta.trackingUrl && (
                      <Link href={trackingMeta.trackingUrl} target="_blank" className="mt-3 inline-flex items-center gap-2 font-medium hover:underline">
                        Track shipment
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                )}
              </section>

              <section className="rounded-2xl border bg-white p-6 shadow-sm text-sm text-slate-600">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Shipping Address</p>
                <div className="mt-4 space-y-2">
                  <p className="font-medium text-slate-900">
                    {shippingAddress?.name || `${shippingAddress?.firstName || ''} ${shippingAddress?.lastName || ''}`.trim()}
                  </p>
                  {shippingAddress?.address1 && <p>{shippingAddress.address1}</p>}
                  {shippingAddress?.address2 && <p>{shippingAddress.address2}</p>}
                  <p>{[shippingAddress?.city, shippingAddress?.state, shippingAddress?.zip].filter(Boolean).join(', ')}</p>
                  {shippingAddress?.country && <p>{shippingAddress.country}</p>}
                  {shippingAddress?.email && <p>{shippingAddress.email}</p>}
                </div>
              </section>

              <section className="rounded-2xl border bg-white p-6 shadow-sm text-sm text-slate-600">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Payment Summary</p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Product value</span>
                    <span className="font-medium text-slate-900">${subtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex items-center justify-between text-red-600">
                      <span>Discount{order.couponCode ? ` (${order.couponCode})` : ''}</span>
                      <span>-${discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span>Shipping</span>
                    <span className="font-medium text-slate-900">${shipping.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between text-base font-semibold text-slate-900">
                      <span>Total paid</span>
                      <span>${order.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Order Details - James Sax Corner',
}
