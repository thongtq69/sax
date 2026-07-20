'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LockKeyhole, Printer, Truck } from 'lucide-react'

export function SecureOrderViewer({ orderNumber, token }: { orderNumber: string; token: string }) {
  const [code, setCode] = useState('')
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <LockKeyhole className="mb-4 h-10 w-10 text-primary" />
          <h1 className="text-2xl font-bold text-secondary">Security Verification</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter the 8-character code made from the first 5 characters of your billing ZIP/postal code and the last 3 digits of your phone number.
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
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">Order</p>
          <h1 className="text-3xl font-bold text-secondary">#{order.orderNumber}</h1>
          <p className="mt-1 capitalize text-gray-600">{order.status}</p>
        </div>
        <div className="text-right text-2xl font-bold">${Number(order.total).toLocaleString()}</div>
      </div>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold">Items</h2>
        <div className="divide-y">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex justify-between gap-4 py-3">
              <div><p className="font-medium">{item.name}</p><p className="text-xs text-gray-500">{item.sku} · Qty {item.quantity}</p></div>
              <p>${Number(item.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </section>

      {order.tracking?.trackingNumber && (
        <section className="rounded-xl border bg-white p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold"><Truck className="h-5 w-5" /> Tracking</h2>
          <p className="mt-2">{order.tracking.carrier}: {order.tracking.trackingNumber}</p>
          {order.tracking.trackingUrl && <a className="text-primary underline" href={order.tracking.trackingUrl} target="_blank" rel="noreferrer">Track shipment</a>}
        </section>
      )}

      {order.invoice?.html && (
        <section className="rounded-xl border bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Invoice {order.invoice.invoiceNumber}</h2>
            <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print / Save PDF</Button>
          </div>
          <iframe title="Invoice" srcDoc={order.invoice.html} className="h-[850px] w-full border" />
        </section>
      )}
    </main>
  )
}
