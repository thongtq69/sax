'use client'

import { useState, useEffect } from 'react'
import { X, Star, Quote, CheckCircle, Music } from 'lucide-react'

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

  const getAvatarColor = (name: string) => {
    const colors = ['bg-amber-600', 'bg-emerald-600', 'bg-blue-600', 'bg-purple-600', 'bg-rose-600', 'bg-cyan-600']
    return colors[name.charCodeAt(0) % colors.length]
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
      <div className="relative bg-[#FAFAF8] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl rounded-lg">
        
        {/* Header - với hiệu ứng nhạc */}
        <div className="relative bg-gradient-to-br from-[#AFA65F] via-[#9a9254] to-[#8a8347] px-8 py-8 overflow-hidden">
          {/* Floating musical notes - hiệu ứng liên quan đến nhạc cụ */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <span className="absolute top-3 left-6 text-white/10 text-4xl animate-pulse">♪</span>
            <span className="absolute top-8 right-12 text-white/10 text-3xl animate-pulse" style={{ animationDelay: '0.5s' }}>♫</span>
            <span className="absolute bottom-4 left-1/4 text-white/10 text-5xl animate-pulse" style={{ animationDelay: '1s' }}>♬</span>
            <span className="absolute bottom-6 right-6 text-white/10 text-6xl animate-pulse" style={{ animationDelay: '1.5s' }}>𝄞</span>
            <span className="absolute top-1/2 left-8 text-white/5 text-3xl animate-bounce" style={{ animationDuration: '3s' }}>🎷</span>
            <span className="absolute top-1/3 right-8 text-white/5 text-2xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>🎵</span>
          </div>
          
          {/* Decorative circles */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/5 rounded-full" />
          <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-white/5 rounded-full" />
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-all duration-300 z-10 hover:rotate-90"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          {/* Title */}
          <div className="text-center relative z-10">
            <div className="inline-flex items-center gap-2 mb-3">
              <Music className="h-5 w-5 text-white/80" />
              <span className="text-white/80 text-sm font-medium uppercase tracking-wider">Verified Reviews</span>
              <Music className="h-5 w-5 text-white/80" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white font-display mb-2">
              Testimonials
            </h2>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-white text-white drop-shadow-sm" />
                ))}
              </div>
              <span className="text-white font-semibold">{avgRating}</span>
            </div>
          </div>

          {/* Intro Text */}
          <p className="text-white/90 text-sm md:text-base text-center max-w-2xl mx-auto leading-relaxed font-body relative z-10">
            Our reputation has been built over the years through consistent quality and trust earned from musicians worldwide. 
            All testimonials come from verified buyers and students, reflecting real experiences with our instruments, 
            repair services, and lessons.
          </p>
        </div>

        {/* Reviews List - Clean Cards với hover effects */}
        <div className="overflow-y-auto max-h-[calc(90vh-220px)] p-6 bg-gradient-to-b from-gray-50 to-white">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-3 border-[#AFA65F] border-t-transparent mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Loading testimonials...</p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {reviews.map((review, index) => (
                <div
                  key={index}
                  className="group bg-white p-5 border border-gray-100 hover:border-[#AFA65F]/40 hover:shadow-lg transition-all duration-300 rounded-lg relative overflow-hidden"
                >
                  {/* Decorative quote icon */}
                  <Quote className="absolute -top-2 -right-2 h-16 w-16 text-[#AFA65F]/5 rotate-12 group-hover:text-[#AFA65F]/10 transition-colors" />
                  
                  {/* Top Row: Avatar + Name + Rating */}
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 ${getAvatarColor(review.author_name)} rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md group-hover:scale-110 transition-transform duration-300`}>
                        {getInitials(review.author_name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 text-sm">{review.author_name}</span>
                          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full">
                            <CheckCircle className="h-3 w-3" />
                            <span className="text-xs font-medium">Verified</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">{review.order_title}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 transition-transform group-hover:scale-110 ${
                            i < review.rating
                              ? 'fill-[#D4AF37] text-[#D4AF37]'
                              : 'fill-gray-200 text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-gray-600 text-sm leading-relaxed font-body relative z-10">
                    &quot;{review.message}&quot;
                  </p>

                  {/* Date */}
                  <p className="text-xs text-gray-400 mt-3 relative z-10">
                    {new Date(review.created_at).toLocaleDateString('en-US', { 
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}}

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
