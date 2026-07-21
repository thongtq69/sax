'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ExternalLink, LockKeyhole, LogIn, Package, ShieldAlert, Truck, UserPlus } from 'lucide-react'
import { InvoiceFrame } from '@/components/order/InvoiceFrame'

function AddressBlock({ title, address }: { title: string; address: any }) {
  if (!address) return null
  const name = address.name || `${address.firstName || ''} ${address.lastName || ''}`.trim()
  return (
    <section className="rounded-2xl border bg-white p-6 text-sm text-slate-600 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</p>
      <div className="mt-4 space-y-2">
        {name && <p className="font-medium text-slate-900">{name}</p>}
        {address.company && <p>{address.company}</p>}
        {address.address1 && <p>{address.address1}</p>}
        {address.address2 && <p>{address.address2}</p>}
        <p>{[address.city, address.state, address.zip].filter(Boolean).join(', ')}</p>
        {address.country && <p>{address.country}</p>}
        {address.email && <p>{address.email}</p>}
        {address.phone && <p>{address.phone}</p>}
      </div>
    </section>
  )
}

export function SecureOrderViewer({ orderNumber, token }: { orderNumber: string; token: string }) {
  const [code, setCode] = useState('')
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const accountOrderPath = `/account/orders/${encodeURIComponent(orderNumber)}`
  const loginPath = `/auth/login?callbackUrl=${encodeURIComponent(accountOrderPath)}`
  const signupPath = `/auth/register?callbackUrl=${encodeURIComponent(accountOrderPath)}`

  const verify = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/order-secure/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, token, code }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Verification failed')
      setOrder(data.order)
    } catch (caught: any) {
      setError(caught.message)
    } finally {
      setLoading(false)
    }
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <div className="rounded-2xl border bg-white p-7 shadow-sm">
          <LockKeyhole className="mb-4 h-10 w-10 text-primary" />
          <h1 className="text-2xl font-bold text-secondary">Security Verification</h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Create an account with the same email address to keep this order in your account, or enter the private access code below.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button asChild variant="outline"><Link href={loginPath}><LogIn className="mr-2 h-4 w-4" />Log in</Link></Button>
            <Button asChild variant="outline"><Link href={signupPath}><UserPlus className="mr-2 h-4 w-4" />Sign up</Link></Button>
          </div>
          <div className="my-6 border-t" />
          <p className="text-sm leading-6 text-gray-600">
            Enter the 8-character code made from the first 5 characters of your ZIP/postal code and the last 3 digits of phone number from your billing address.
          </p>
          <Input
            className="mt-6 font-mono uppercase tracking-[0.25em]"
            maxLength={8}
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            onKeyDown={(event) => event.key === 'Enter' && verify()}
            placeholder="12345890"
            autoComplete="one-time-code"
          />
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <Button className="mt-4 w-full" disabled={loading || code.length !== 8} onClick={verify}>
            {loading ? 'Verifying…' : 'View Order Securely'}
          </Button>
          <div className="mt-5 flex gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <p><strong>Security Note:</strong> This is a private access link. Do not share or forward this page.</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Order</p>
              <h1 className="text-3xl font-bold text-slate-900">#{order.orderNumber}</h1>
              <p className="mt-1 text-sm text-slate-500">
                {new Date(order.createdAt).toLocaleString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
            <div className="text-right"><p className="text-sm capitalize text-slate-500">{order.status}</p><p className="text-2xl font-bold text-slate-900">${Number(order.total).toLocaleString()}</p></div>
          </div>

          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div><p className="font-semibold text-slate-900">Keep this order in your account</p><p className="mt-1 text-sm text-slate-600">Log in or sign up with the same email address. The order will appear automatically after verification.</p></div>
              <div className="flex gap-2"><Button asChild variant="outline"><Link href={loginPath}>Log in</Link></Button><Button asChild><Link href={signupPath}>Sign up</Link></Button></div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-6">
              <section className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-lg font-semibold text-slate-900"><Package className="h-5 w-5 text-primary" />Purchased Items</div>
                <div className="mt-5 space-y-4">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="rounded-2xl border p-4">
                      <div className="flex items-start gap-4">
                        {item.image && <Image src={item.image} alt={item.name} width={88} height={88} className="h-20 w-20 rounded-lg object-cover" />}
                        <div className="min-w-0 flex-1">
                          {item.slug ? <Link href={`/item/${item.slug}`} className="font-semibold text-slate-900 hover:text-primary">{item.name}</Link> : <p className="font-semibold text-slate-900">{item.name}</p>}
                          <p className="mt-1 text-xs text-slate-500">SKU: {item.sku}</p>
                          <p className="mt-1 text-sm text-slate-500">Qty: {item.quantity} × ${Number(item.price).toLocaleString()}</p>
                        </div>
                        <p className="font-semibold text-slate-900">${Number(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {order.invoice?.html && <InvoiceFrame html={order.invoice.html} invoiceNumber={order.invoice.invoiceNumber || `INV-${order.orderNumber}`} />}
            </div>

            <div className="space-y-6">
              <section className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Order Status</p>
                <p className="mt-3 text-2xl font-bold capitalize text-slate-900">{order.status}</p>
                {order.tracking?.trackingNumber && <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm text-blue-800"><div className="flex items-center gap-2 font-medium"><Truck className="h-4 w-4" />{order.tracking.carrier?.toUpperCase()} tracking</div><p className="mt-2 font-mono">{order.tracking.trackingNumber}</p>{order.tracking.trackingUrl && <Link href={order.tracking.trackingUrl} target="_blank" className="mt-3 inline-flex items-center gap-2 font-medium hover:underline">Track shipment<ExternalLink className="h-4 w-4" /></Link>}</div>}
              </section>
              <AddressBlock title="Shipping Address" address={order.shippingAddress} />
              <AddressBlock title="Billing Address" address={order.billingAddress} />
              <section className="rounded-2xl border bg-white p-6 text-sm text-slate-600 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Payment Summary</p>
                <div className="mt-4 space-y-3"><div className="flex justify-between"><span>Payment method</span><span className="font-medium text-slate-900">{order.paymentMethod}</span></div><div className="flex justify-between"><span>Product value</span><span className="font-medium text-slate-900">${Number(order.subtotal).toLocaleString()}</span></div><div className="flex justify-between text-red-600"><span>Discount{order.couponCode ? ` (${order.couponCode})` : ''}</span><span>-${Number(order.discount).toLocaleString()}</span></div><div className="flex justify-between"><span>Shipping</span><span className="font-medium text-slate-900">${Number(order.shipping).toLocaleString()}</span></div><div className="border-t pt-3"><div className="flex justify-between text-base font-semibold text-slate-900"><span>Total paid</span><span>${Number(order.total).toLocaleString()}</span></div></div></div>
              </section>
              <div className="flex gap-2 rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-900"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" /><p><strong>Security Note:</strong> This is a private access link. Do not share or forward this page.</p></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
