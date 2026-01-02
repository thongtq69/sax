'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MessageCircle, Phone, Mail, MapPin } from 'lucide-react'

interface InquiryFormContentProps {
  prefillProduct?: string
  prefillSku?: string
  onClose?: () => void
  showBackToShop?: boolean
}

export function InquiryFormContent({
  prefillProduct = '',
  prefillSku = '',
  onClose,
  showBackToShop = false,
}: InquiryFormContentProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(
    `Hi, I'm interested in${prefillProduct ? ` ${prefillProduct}` : ' this instrument'}.`
  )

  const subject = useMemo(() => {
    const base = prefillProduct ? `Product Inquiry: ${prefillProduct}` : 'Product Inquiry'
    return prefillSku ? `${base} (${prefillSku})` : base
  }, [prefillProduct, prefillSku])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const bodyLines = [
      `Name: ${name || 'N/A'}`,
      `Email: ${email || 'N/A'}`,
      prefillProduct ? `Product: ${prefillProduct}` : '',
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
            <label className="text-sm font-medium text-secondary">Name</label>
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
              <MapPin className="h-4 w-4" /> Ha Noi, Viet Nam
            </span>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="bg-primary text-white hover:bg-primary/90">
              Send Inquiry
            </Button>
            {onClose ? (
              <Button type="button" variant="outline" onClick={onClose}>
                Close
              </Button>
            ) : (
              showBackToShop && (
                <Button variant="outline" asChild>
                  <Link href="/shop">Back to Shop</Link>
                </Button>
              )
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
