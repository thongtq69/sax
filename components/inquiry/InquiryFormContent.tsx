'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MessageCircle, Phone, Mail, MapPin, Send, Loader2, CheckCircle, ChevronDown } from 'lucide-react'

interface InquiryTitle {
  id: string
  title: string
  isActive: boolean
  order: number
}

interface SiteSettings {
  email: string
  phone: string
  address: string
}

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
  const [selectedTitle, setSelectedTitle] = useState('')
  const [inquiryTitles, setInquiryTitles] = useState<InquiryTitle[]>([])
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    email: 'sales@jamessaxcorner.com',
    phone: '+84-82-678-8899',
    address: 'Hanoi, Vietnam',
  })
  const [message, setMessage] = useState(
    `Hi, I'm interested in${prefillProduct ? ` ${prefillProduct}` : ' this instrument'}.`
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)

  // Fetch inquiry titles and site settings from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [titlesRes, settingsRes] = await Promise.all([
          fetch('/api/admin/inquiry-titles'),
          fetch('/api/admin/site-settings'),
        ])
        
        if (titlesRes.ok) {
          const data = await titlesRes.json()
          const activeTitles = data.filter((t: InquiryTitle) => t.isActive).sort((a: InquiryTitle, b: InquiryTitle) => a.order - b.order)
          setInquiryTitles(activeTitles)
          if (activeTitles.length > 0) {
            setSelectedTitle(activeTitles[0].title)
          }
        }
        
        if (settingsRes.ok) {
          const settings = await settingsRes.json()
          setSiteSettings({
            email: settings.email || 'sales@jamessaxcorner.com',
            phone: settings.phone || '+84-82-678-8899',
            address: settings.address || 'Hanoi, Vietnam',
          })
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  const subject = useMemo(() => {
    const titlePart = selectedTitle ? `[${selectedTitle}] ` : ''
    const base = prefillProduct ? `${titlePart}Product Inquiry: ${prefillProduct}` : `${titlePart}Product Inquiry`
    return prefillSku ? `${base} (${prefillSku})` : base
  }, [prefillProduct, prefillSku, selectedTitle])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError('')
    
    try {
      // Save to database
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          inquiryType: selectedTitle,
          message,
          productName: prefillProduct || null,
          productSku: prefillSku || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit inquiry')
      }

      setIsSubmitted(true)
      
    } catch (error: any) {
      console.error('Error submitting inquiry:', error)
      setSubmitError('Failed to submit inquiry. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show success message if submitted
  if (isSubmitted) {
    return (
      <div className="bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden animate-fade-in-up">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-5 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Inquiry Sent!</h1>
            <p className="text-sm text-white/90">We'll get back to you soon.</p>
          </div>
        </div>
        <div className="p-5 md:p-8 text-center">
          <p className="text-gray-600 mb-4">
            Thank you for your inquiry. Our team will review it and respond to your email shortly.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => { setIsSubmitted(false); setName(''); setEmail(''); setMessage(''); }}>
              Send Another Inquiry
            </Button>
            {showBackToShop && (
              <Button variant="outline" asChild>
                <Link href="/shop">Back to Shop</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden animate-fade-in-up">
      {/* Header with gold/primary gradient */}
      <div className="bg-gradient-to-r from-primary via-primary/95 to-amber-500 text-white px-5 py-5 flex items-center gap-3 relative overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-2 right-10 text-2xl animate-float">♪</div>
          <div className="absolute bottom-2 right-20 text-xl animate-float" style={{ animationDelay: '0.5s' }}>♫</div>
        </div>
        
        <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center animate-pulse-soft">
          <MessageCircle className="h-6 w-6" />
        </div>
        <div className="relative z-10">
          <h1 className="text-xl md:text-2xl font-bold">Inquiry</h1>
          <p className="text-sm text-white/90">Ask about availability, setup, or shipping.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 md:p-8 space-y-6">
        {/* Error message */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {submitError}
          </div>
        )}
        
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

        {/* Inquiry Title dropdown */}
        {inquiryTitles.length > 0 && (
          <div className="space-y-1 animate-fade-in-up" style={{ animationDelay: '0.17s' }}>
            <label className="text-sm font-medium text-secondary flex items-center gap-1">
              Inquiry Type
              <span className="text-red-500">*</span>
            </label>
            <div className={`relative transition-all duration-300 ${focusedField === 'title' ? 'scale-[1.01]' : ''}`}>
              <select
                required
                value={selectedTitle}
                onChange={(e) => setSelectedTitle(e.target.value)}
                onFocus={() => setFocusedField('title')}
                onBlur={() => setFocusedField(null)}
                className={`w-full rounded-xl border-2 px-4 py-3 text-sm transition-all duration-300 focus:outline-none appearance-none bg-white cursor-pointer ${
                  focusedField === 'title' 
                    ? 'border-primary shadow-lg shadow-primary/20' 
                    : 'border-gray-200 hover:border-primary/50'
                }`}
              >
                {inquiryTitles.map((title) => (
                  <option key={title.id} value={title.title}>
                    {title.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

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
              { icon: Mail, text: siteSettings.email },
              { icon: Phone, text: siteSettings.phone },
              { icon: MapPin, text: siteSettings.address },
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
