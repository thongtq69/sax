'use client'

import { useState, useEffect } from 'react'
import { X, Star, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Review {
  message: string
  rating: number
  author_name: string
  order_title: string
  created_at: string
}

interface TestimonialsPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function TestimonialsPopup({ isOpen, onClose }: TestimonialsPopupProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      fetch('/api/reviews')
        .then(res => res.json())
        .then(data => {
          // Filter reviews with messages only
          const filtered = data.filter((r: Review) => r.message && r.message.trim() !== '')
          setReviews(filtered)
          setIsLoading(false)
        })
        .catch(() => setIsLoading(false))
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Quote className="h-6 w-6 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Customer Testimonials</h2>
              <p className="text-white/80 text-sm">{reviews.length} verified reviews</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Reviews List */}
        <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent" />
            </div>
          ) : (
            <div className="grid gap-4">
              {reviews.map((review, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-xl p-5 hover:shadow-md transition-shadow border border-gray-100"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-secondary">{review.author_name}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{review.order_title}</p>
                    </div>
                    <div className="flex gap-0.5 shrink-0">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-gray-200 text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{review.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
