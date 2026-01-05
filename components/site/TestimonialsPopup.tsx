'use client'

import { useState, useEffect } from 'react'
import { X, Star, Quote, CheckCircle } from 'lucide-react'

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
          const filtered = data.filter((r: Review) => r.message && r.message.trim() !== '')
          setReviews(filtered)
          setIsLoading(false)
        })
        .catch(() => setIsLoading(false))
    }
  }, [isOpen])

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0'

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal - Clean & Minimal */}
      <div className="relative bg-[#FAFAF8] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        
        {/* Header - Simple & Elegant */}
        <div className="relative bg-[#AFA65F] px-8 py-8">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-black/10 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          {/* Title */}
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white font-display mb-2">
              Testimonials
            </h2>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-white text-white" />
                ))}
              </div>
              <span className="text-white font-semibold">{avgRating}</span>
              <span className="text-white/70">({reviews.length} reviews)</span>
            </div>
          </div>

          {/* Intro Text */}
          <p className="text-white/90 text-sm md:text-base text-center max-w-2xl mx-auto leading-relaxed font-body">
            Our reputation has been built over the years through consistent quality and trust earned from musicians worldwide. 
            All testimonials come from verified buyers and students, reflecting real experiences with our instruments, 
            repair services, and lessons.
          </p>
        </div>

        {/* Reviews List - Clean Cards */}
        <div className="overflow-y-auto max-h-[calc(90vh-220px)] p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#AFA65F] border-t-transparent" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {reviews.map((review, index) => (
                <div
                  key={index}
                  className="bg-white p-5 border border-gray-100 hover:border-[#AFA65F]/30 hover:shadow-md transition-all duration-300"
                >
                  {/* Top Row: Avatar + Name + Rating */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#AFA65F] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {getInitials(review.author_name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 text-sm">{review.author_name}</span>
                          <CheckCircle className="h-3.5 w-3.5 text-[#AFA65F]" />
                        </div>
                        <p className="text-xs text-gray-500">{review.order_title}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < review.rating
                              ? 'fill-[#D4AF37] text-[#D4AF37]'
                              : 'fill-gray-200 text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-gray-600 text-sm leading-relaxed font-body">
                    "{review.message}"
                  </p>

                  {/* Date */}
                  <p className="text-xs text-gray-400 mt-3">
                    {new Date(review.created_at).toLocaleDateString('en-US', { 
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}

          {!isLoading && reviews.length === 0 && (
            <div className="text-center py-16">
              <Quote className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No testimonials available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
