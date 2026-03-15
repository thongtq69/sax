'use client'

import { useState } from 'react'
import { Loader2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function OrderReviewForm({
  productId,
  disabled = false,
  disabledMessage,
}: {
  productId: string
  disabled?: boolean
  disabledMessage?: string
}) {
  const [rating, setRating] = useState(5)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (disabled || !message.trim()) return

    setSubmitting(true)
    setFeedback(null)

    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, message }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to submit review')
      }

      setMessage('')
      setRating(5)
      setFeedback({ type: 'success', message: 'Thanks - your review has been submitted.' })
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to submit review',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border bg-slate-50 p-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">Leave a review</p>
        <p className="mt-1 text-xs text-slate-500">
          {disabled ? disabledMessage || 'Review is not available yet.' : 'Share your experience now that this order has been purchased.'}
        </p>
      </div>

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => !disabled && setRating(value)}
            className="disabled:cursor-not-allowed"
            disabled={disabled}
          >
            <Star className={`h-5 w-5 ${value <= rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-slate-300'}`} />
          </button>
        ))}
      </div>

      <Textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Share your experience with this instrument"
        disabled={disabled || submitting}
        className="min-h-[110px] bg-white"
      />

      {feedback && (
        <div className={`text-sm ${feedback.type === 'success' ? 'text-emerald-700' : 'text-red-600'}`}>
          {feedback.message}
        </div>
      )}

      <Button type="submit" disabled={disabled || submitting || !message.trim()}>
        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Submit review
      </Button>
    </form>
  )
}
