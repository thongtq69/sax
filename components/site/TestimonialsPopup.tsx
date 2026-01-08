'use client'

import { useState, useEffect } from 'react'
import { X, Star, Quote, CheckCircle, Music } from 'lucide-react'

interface Review {
  id: string
  message: string
  rating: number
  buyerName: string
  date: string
  product?: {
    name: string
  }
  customProductName?: string
  productName?: string
}

interface TestimonialsPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function TestimonialsPopup({ isOpen, onClose }: TestimonialsPopupProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set())

  const toggleExpand = (reviewId: string) => {
    setExpandedReviews(prev => {
      const next = new Set(prev)
      if (next.has(reviewId)) {
        next.delete(reviewId)
      } else {
        next.add(reviewId)
      }
      return next
    })
  }

  useEffect(() => {
    if (isOpen) {
      // Try database first, fallback to JSON file
      fetch('/api/admin/testimonials?limit=100')
        .then(res => res.json())
        .then(data => {
          if (data.reviews && data.reviews.length > 0) {
            const filtered = data.reviews.filter((r: any) => r.message && r.message.trim() !== '')
            // Transform API data to ensure product name is properly mapped
            const transformedReviews = filtered.map((r: any) => ({
              id: r.id,
              message: r.message,
              rating: r.rating,
              buyerName: r.buyerName,
              date: r.date,
              product: r.product ? { name: r.product.name } : undefined,
              customProductName: r.customProductName || undefined,
              // Compute productName from either product relation or customProductName
              productName: r.product?.name || r.customProductName || undefined,
            }))
            console.log('Testimonials loaded:', transformedReviews.slice(0, 2)) // Debug log - remove in production
            setReviews(transformedReviews)
          } else {
            // Fallback to JSON file
            return fetch('/api/reviews')
              .then(res => res.json())
              .then(jsonData => {
                const filtered = jsonData.filter((r: any) => r.message && r.message.trim() !== '')
                // Transform JSON format to match our interface
                setReviews(filtered.map((r: any) => ({
                  id: r.feedback_url || String(Math.random()),
                  message: r.message,
                  rating: r.rating,
                  buyerName: r.author_name,
                  date: r.created_at,
                  product: r.order_title ? { name: r.order_title } : undefined,
                  productName: r.order_title || undefined,
                })))
              })
          }
          setIsLoading(false)
        })
        .catch(() => {
          // Fallback to JSON file on error
          fetch('/api/reviews')
            .then(res => res.json())
            .then(jsonData => {
              const filtered = jsonData.filter((r: any) => r.message && r.message.trim() !== '')
              setReviews(filtered.map((r: any) => ({
                id: r.feedback_url || String(Math.random()),
                message: r.message,
                rating: r.rating,
                buyerName: r.author_name,
                date: r.created_at,
                product: r.order_title ? { name: r.order_title } : undefined,
                productName: r.order_title || undefined,
              })))
              setIsLoading(false)
            })
            .catch(() => setIsLoading(false))
        })
    }
  }, [isOpen])

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0'

  const getInitials = (name: string) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getAvatarColor = (name: string) => {
    const colors = ['bg-amber-600', 'bg-emerald-600', 'bg-blue-600', 'bg-purple-600', 'bg-rose-600', 'bg-cyan-600']
    return colors[(name?.charCodeAt(0) || 0) % colors.length]
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal - Clean & Minimal */}
      <div className="relative bg-[#FAFAF8] w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] overflow-hidden shadow-2xl rounded-lg">

        {/* Header - với hiệu ứng nhạc */}
        <div className="relative bg-gradient-to-br from-[#AFA65F] via-[#9a9254] to-[#8a8347] px-4 py-3 md:px-8 md:py-6 overflow-hidden">
          {/* Floating musical notes - hiệu ứng liên quan đến nhạc cụ */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <span className="absolute top-3 left-6 text-white/10 text-2xl md:text-4xl animate-pulse">♪</span>
            <span className="absolute top-8 right-12 text-white/10 text-xl md:text-3xl animate-pulse" style={{ animationDelay: '0.5s' }}>♫</span>
            <span className="absolute bottom-4 left-1/4 text-white/10 text-3xl md:text-5xl animate-pulse" style={{ animationDelay: '1s' }}>♬</span>
            <span className="absolute bottom-6 right-6 text-white/10 text-4xl md:text-6xl animate-pulse" style={{ animationDelay: '1.5s' }}>𝄞</span>
            <span className="absolute top-1/2 left-8 text-white/5 text-xl md:text-3xl animate-bounce" style={{ animationDuration: '3s' }}>🎷</span>
            <span className="absolute top-1/3 right-8 text-white/5 text-lg md:text-2xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>🎵</span>
          </div>

          {/* Decorative circles */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/5 rounded-full" />
          <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-white/5 rounded-full" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 md:top-4 md:right-4 p-1.5 md:p-2 hover:bg-white/20 rounded-full transition-all duration-300 z-10 hover:rotate-90"
          >
            <X className="h-4 w-4 md:h-5 md:w-5 text-white" />
          </button>

          {/* Title */}
          <div className="text-center relative z-10">
            <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-white font-display mb-2 md:mb-4">
              Testimonials
            </h2>
          </div>

          {/* Intro Text */}
          <p className="text-white/90 text-xs md:text-sm lg:text-base text-center max-w-2xl mx-auto leading-relaxed font-body relative z-10 px-2">
            Our reputation has been built over the years through consistent quality and trust earned from musicians worldwide.
            All testimonials come from verified buyers and students, reflecting real experiences with our instruments,
            repair services, and lessons.
          </p>
        </div>

        {/* Reviews List - Clean Cards với hover effects */}
        <div className="overflow-y-auto max-h-[calc(95vh-180px)] md:max-h-[calc(90vh-220px)] p-3 md:p-6 bg-gradient-to-b from-gray-50 to-white">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 md:py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 border-3 border-[#AFA65F] border-t-transparent mx-auto mb-3" />
                <p className="text-gray-500 text-xs md:text-sm">Loading testimonials...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
              {reviews.map((review, index) => (
                <div
                  key={index}
                  className="group bg-white p-3 md:p-5 border border-gray-100 hover:border-[#AFA65F]/40 hover:shadow-lg transition-all duration-300 rounded-lg relative overflow-hidden"
                >
                  {/* Decorative quote icon */}
                  <Quote className="absolute -top-1 -right-1 md:-top-2 md:-right-2 h-10 w-10 md:h-16 md:w-16 text-[#AFA65F]/5 rotate-12 group-hover:text-[#AFA65F]/10 transition-colors" />

                  {/* Top Row: Avatar + Name */}
                  <div className="flex items-start justify-between mb-2 md:mb-3 relative z-10 gap-2">
                    <div className="flex items-start gap-2 md:gap-3 min-w-0 flex-1">
                      <div className={`w-8 h-8 md:w-11 md:h-11 ${getAvatarColor(review.buyerName)} rounded-full flex items-center justify-center text-white font-semibold text-xs md:text-sm shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                        {getInitials(review.buyerName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900 text-xs md:text-sm truncate">{review.buyerName}</span>
                          <div className="flex items-center gap-0.5 md:gap-1 bg-emerald-50 text-emerald-600 px-1 md:px-1.5 py-0.5 rounded-full flex-shrink-0">
                            <CheckCircle className="h-2.5 w-2.5 md:h-3 md:w-3" />
                            <span className="text-[10px] md:text-xs font-medium">Verified</span>
                          </div>
                        </div>
                        {review.productName && (
                          <p className="text-[10px] md:text-xs text-[#AFA65F] font-medium mt-0.5 line-clamp-1 truncate">Product: {review.productName}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Review Text - Clickable on mobile to expand */}
                  <div
                    className="relative z-10 cursor-pointer md:cursor-default"
                    onClick={() => toggleExpand(review.id)}
                  >
                    <p className={`text-gray-600 text-xs md:text-sm leading-relaxed font-body transition-all duration-300 ${expandedReviews.has(review.id) ? '' : 'line-clamp-4 md:line-clamp-none'
                      }`}>
                      &quot;{review.message}&quot;
                    </p>
                    {/* Show "Tap to read more" hint on mobile for long reviews */}
                    {!expandedReviews.has(review.id) && review.message.length > 150 && (
                      <span className="text-[10px] text-[#AFA65F] font-medium mt-1 inline-block md:hidden">
                        Tap to read more...
                      </span>
                    )}
                    {expandedReviews.has(review.id) && (
                      <span className="text-[10px] text-gray-400 font-medium mt-1 inline-block md:hidden">
                        Tap to collapse
                      </span>
                    )}
                  </div>

                  {/* Date */}
                  <p className="text-[10px] md:text-xs text-gray-400 mt-2 md:mt-3 relative z-10">
                    {new Date(review.date).toLocaleDateString('en-US', {
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
            <div className="text-center py-8 md:py-16">
              <Quote className="h-8 w-8 md:h-10 md:w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-xs md:text-sm">No testimonials available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
