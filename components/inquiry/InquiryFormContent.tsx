'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MessageCircle, Phone, Mail, MapPin, Send, Loader2, CheckCircle } from 'lucide-react'

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const subject = useMemo(() => {
    const base = prefillProduct ? `Product Inquiry: ${prefillProduct}` : 'Product Inquiry'
    return prefillSku ? `${base} (${prefillSku})` : base
  }, [prefillProduct, prefillSku])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate brief loading for better UX
    await new Promise(resolve => setTimeout(resolve, 500))
    
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
    setIsSubmitting(false)
  }

  return (
    <div className="bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden animate-fade-in-up">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-secondary via-secondary/95 to-secondary text-white px-5 py-5 flex items-center gap-3 relative overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 right-10 text-2xl animate-float">♪</div>
          <div className="absolute bottom-2 right-20 text-xl animate-float" style={{ animationDelay: '0.5s' }}>♫</div>
        </div>
        
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-pulse-soft">
          <MessageCircle className="h-6 w-6" />
        </div>
        <div className="relative z-10">
          <h1 className="text-xl md:text-2xl font-bold">Product Inquiry</h1>
          <p className="text-sm text-white/80">Ask about availability, setup, financing, or shipping.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name field */}
          <div className="space-y-1 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <label className="text-sm font-medium text-secondary flex items-center gap-1">
              Name
              <span className="text-red-500">*</span>
            </label>
            <div className={`relative transition-all duration-300 ${focusedField === 'name' ? 'scale-[1.02]' : ''}`}>
              <input
                type="text"
                required
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                className={`w-full rounded-xl border-2 px-4 py-3 text-sm transition-all duration-300 focus:outline-none ${
                  focusedField === 'name' 
                    ? 'border-primary shadow-lg shadow-primary/20' 
                    : 'border-gray-200 hover:border-primary/50'
                }`}
              />
              {name && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500 animate-scale-in" />
              )}
            </div>
          </div>
          
          {/* Email field */}
          <div className="space-y-1 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <label className="text-sm font-medium text-secondary flex items-center gap-1">
              Email
              <span className="text-red-500">*</span>
            </label>
            <div className={`relative transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.02]' : ''}`}>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className={`w-full rounded-xl border-2 px-4 py-3 text-sm transition-all duration-300 focus:outline-none ${
                  focusedField === 'email' 
                    ? 'border-primary shadow-lg shadow-primary/20' 
                    : 'border-gray-200 hover:border-primary/50'
                }`}
              />
              {email && email.includes('@') && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500 animate-scale-in" />
              )}
            </div>
          </div>
        </div>

        {/* Message field */}
        <div className="space-y-1 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <label className="text-sm font-medium text-secondary">Message</label>
          <div className={`relative transition-all duration-300 ${focusedField === 'message' ? 'scale-[1.01]' : ''}`}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={() => setFocusedField('message')}
              onBlur={() => setFocusedField(null)}
              rows={4}
              className={`w-full rounded-xl border-2 px-4 py-3 text-sm transition-all duration-300 focus:outline-none resize-none ${
                focusedField === 'message' 
                  ? 'border-primary shadow-lg shadow-primary/20' 
                  : 'border-gray-200 hover:border-primary/50'
              }`}
            />
          </div>
        </div>

        {/* Contact info & buttons */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between pt-2 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {[
              { icon: Mail, text: 'sales@jamessaxcorner.com' },
              { icon: Phone, text: '+84 909 000 000' },
              { icon: MapPin, text: 'Ha Noi, Viet Nam' },
            ].map((item, i) => (
              <span 
                key={i} 
                className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-default group"
              >
                <item.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span className="hidden sm:inline">{item.text}</span>
              </span>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  Send Inquiry
                </>
              )}
            </Button>
            {onClose ? (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="hover:bg-gray-100 transition-all duration-300"
              >
                Close
              </Button>
            ) : (
              showBackToShop && (
                <Button 
                  variant="outline" 
                  asChild
                  className="hover:bg-gray-100 transition-all duration-300"
                >
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
