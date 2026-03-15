'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ExternalLink, Loader2, Package, RefreshCw, Save, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getTrackingUrl } from '@/lib/order-utils'

interface OrderItem {
  id: string
  productId: string
  productSku?: string
  productName?: string
  quantity: number
  price: number
}

interface Order {
  id: string
  orderNumber?: string
  status: string
  total: number
  discount?: number
  couponCode?: string
  user?: {
    id: string
    name?: string | null
    email?: string | null
  } | null
  shippingAddress: any
  billingAddress: any
  items: OrderItem[]
  createdAt: string
}

const statuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']
const carriers = ['fedex', 'ups', 'dhl']

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('pending')
  const [carrier, setCarrier] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/orders?id=${params.id}`)
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load order')
      }

      setOrder(data.order)
      setStatus(data.order.status)
      setCarrier(data.order.shippingAddress?.carrier || '')
      setTrackingNumber(data.order.shippingAddress?.trackingNumber || '')
    } catch (error) {
      console.error('Error fetching order:', error)
      alert(error instanceof Error ? error.message : 'Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  const subtotal = useMemo(
    () => order?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0,
    [order]
  )
  const discount = order?.discount || 0
  const shipping = Math.max(0, (order?.total || 0) + discount - subtotal)
  const netAmount = Math.max(0, subtotal - discount)
  const trackingUrl = getTrackingUrl(carrier, trackingNumber)

  const saveUpdates = async () => {
    if (!order) return

    setSaving(true)
    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: order.id,
          status,
          carrier: carrier || null,
          trackingNumber: trackingNumber || null,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update order')
      }

      alert('Order updated successfully')
      await fetchOrder()
    } catch (error) {
      console.error('Error updating order:', error)
      alert(error instanceof Error ? error.message : 'Failed to update order')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.push('/admin/orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">Order not found.</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <Button variant="ghost" className="mb-2 px-0 text-gray-500 hover:text-gray-900" onClick={() => router.push('/admin/orders')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">Order #{order.orderNumber || order.id.slice(-8)}</h1>
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

        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchOrder} disabled={saving}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={saveUpdates} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Truck className="h-5 w-5 text-primary" />
              Fulfillment
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Status</p>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Carrier</p>
                <Select value={carrier || '__none__'} onValueChange={(value) => setCarrier(value === '__none__' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select carrier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No carrier</SelectItem>
                    {carriers.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Tracking Number</p>
              <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())} placeholder="Enter tracking number" />
            </div>

            {trackingUrl && (
              <Link href={trackingUrl} target="_blank" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                Track on {carrier.toUpperCase()}
                <ExternalLink className="h-4 w-4" />
              </Link>
            )}
          </section>

          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Package className="h-5 w-5 text-primary" />
              Order Items
            </div>
            <div className="mt-5 divide-y rounded-2xl border">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-medium text-slate-900">{item.productName || 'Unknown Product'}</p>
                    <p className="text-sm text-slate-500">SKU: {item.productSku || 'N/A'}</p>
                    <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">${(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Customer</p>
            <p className="mt-3 text-lg font-semibold text-slate-900">
              {order.shippingAddress?.name || `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim() || order.user?.name || 'N/A'}
            </p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              {order.shippingAddress?.email && <p>{order.shippingAddress.email}</p>}
              {order.shippingAddress?.phone && <p>{order.shippingAddress.phone}</p>}
              {order.shippingAddress?.address1 && <p>{order.shippingAddress.address1}</p>}
              {order.shippingAddress?.address2 && <p>{order.shippingAddress.address2}</p>}
              <p>{[order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.zip].filter(Boolean).join(', ')}</p>
              {order.shippingAddress?.country && <p>{order.shippingAddress.country}</p>}
            </div>
          </section>

          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Payment Summary</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
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
                  <span>Customer paid</span>
                  <span>${order.total.toLocaleString()}</span>
                </div>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Net Amount</p>
                <p className="mt-2 text-3xl font-bold text-emerald-700">${netAmount.toLocaleString()}</p>
                <p className="mt-1 text-xs text-emerald-700">Product value after coupon deduction.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
