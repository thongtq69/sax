'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MessageCircle, Home, Phone, Mail, MapPin } from 'lucide-react'

export default function InquiryPage() {
  const searchParams = useSearchParams()
  const prefillProduct = searchParams.get('product') || ''
  const prefillSku = searchParams.get('sku') || ''

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email')
  const [store, setStore] = useState('Ho Chi Minh City (Main Studio)')
  const [productName, setProductName] = useState(prefillProduct)
  const [message, setMessage] = useState(
    `Hi, I'm interested in${prefillProduct ? ` ${prefillProduct}` : ' this instrument'}.`
  )

  const subject = useMemo(() => {
    const chosen = productName || prefillProduct
    const base = chosen ? `Product Inquiry: ${chosen}` : 'Product Inquiry'
    return prefillSku ? `${base} (${prefillSku})` : base
  }, [prefillProduct, prefillSku, productName])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const bodyLines = [
      `Name: ${name || 'N/A'}`,
      `Email: ${email || 'N/A'}`,
      `Phone: ${phone || 'N/A'}`,
      `Preferred Contact: ${contactMethod}`,
      `Store Preference: ${store}`,
      productName ? `Product: ${productName}` : '',
      prefillSku ? `SKU: ${prefillSku}` : '',
      '',
      'Message:',
      message,
    ].filter(Boolean)

    const mailto = `mailto:sales@jamessaxcorner.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(bodyLines.join('\n'))}`
    window.location.href = mailto
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/40 via-white to-white">
      <div className="container mx-auto px-4 py-10 md:py-14 lg:py-16 max-w-5xl">
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="flex items-center gap-1 hover:text-primary">
            <Home className="h-4 w-4" />
            Home
          </Link>
          <span className="text-muted-foreground/50">/</span>
          <span className="text-secondary font-medium">Product Inquiry</span>
        </div>

        <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
          <div className="bg-secondary text-white px-5 py-4 flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Product Inquiry</h1>
              <p className="text-sm text-white/80">Ask about availability, setup, financing, or shipping.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-secondary">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-secondary">Email</label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-secondary">Phone</label>
                <input
                  type="tel"
                  placeholder="+84 909 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-secondary">Preferred Contact</label>
                <select
                  value={contactMethod}
                  onChange={(e) => setContactMethod(e.target.value as 'email' | 'phone')}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none bg-white"
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-secondary">Preferred Store / Location</label>
                <select
                  value={store}
                  onChange={(e) => setStore(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none bg-white"
                >
                  <option>Ho Chi Minh City (Main Studio)</option>
                  <option>Hanoi (Workshop)</option>
                  <option>Remote / Video Consultation</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-secondary">Product (optional)</label>
                <input
                  type="text"
                  placeholder="Model name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-secondary">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
              />
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" /> sales@jamessaxcorner.com
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4" /> +84 909 000 000
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> Vietnam
                </span>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-primary text-white hover:bg-primary/90">
                  Send Inquiry
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/shop">Back to Shop</Link>
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
