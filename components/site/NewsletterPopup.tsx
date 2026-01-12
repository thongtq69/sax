'use client'

import { useState } from 'react'
import { X, Mail, Sparkles, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface NewsletterPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function NewsletterPopup({ isOpen, onClose }: NewsletterPopupProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe')
      }

      setIsSuccess(true)
      setEmail('')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setIsSuccess(false)
    setError('')
    setEmail('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in-up">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-primary to-primary/80 px-6 py-8 text-center text-white">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Join Our Musical Community</h2>
          <p className="text-white/80 text-sm">
            Get exclusive deals, new arrivals & expert tips
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                You're In! 🎷
              </h3>
              <p className="text-gray-600 mb-4">
                Check your inbox for a welcome email with exclusive content.
              </p>
              <Button onClick={handleClose} className="w-full">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Be first to know about new instruments</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Exclusive subscriber-only discounts</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Expert saxophone tips & care guides</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12"
                  />
                  {error && (
                    <p className="text-red-500 text-sm mt-2">{error}</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    'Subscribe Now'
                  )}
                </Button>
              </form>

              <p className="text-xs text-gray-400 text-center mt-4">
                We respect your privacy. Unsubscribe anytime.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
