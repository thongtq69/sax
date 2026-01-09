'use client'

import { useState, useEffect } from 'react'
import { X, Star, Quote, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'

interface Review {
  id: string
  message: string
  rating: number
  buyerName: string
  date: string
  product?: {
    name: string
  }
}

interface TestimonialsPopupProps {
  isOpen: boolean
  onClose: () => void
}

// Component for individual review card with expand/collapse functionality
function ReviewCard({ review }: { review: Review }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const MAX_LENGTH = 150 // Characters before truncating

  const getInitials = (name: string) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getAvatarColor = (name: string) => {
    const colors = ['bg-amber-600', 'bg-emerald-600', 'bg-blue-600', 'bg-purple-600', 'bg-rose-600', 'bg-cyan-600']
    return colors[(name?.charCodeAt(0) || 0) % colors.length]
  }

  const isLongMessage = review.message && review.message.length > MAX_LENGTH
  const displayMessage = isExpanded || !isLongMessage
    ? review.message
    : review.message.slice(0, MAX_LENGTH).trim() + '...'

  return (
    <div
      className="group bg-white p-4 sm:p-5 border border-gray-100 hover:border-[#AFA65F]/40 hover:shadow-lg transition-all duration-300 rounded-lg relative overflow-hidden"
    >
      {/* Decorative quote icon */}
      <Quote className="absolute -top-2 -right-2 h-12 w-12 sm:h-16 sm:w-16 text-[#AFA65F]/5 rotate-12 group-hover:text-[#AFA65F]/10 transition-colors" />

      {/* Top Row: Avatar + Name */}
      <div className="flex items-start justify-between mb-2 sm:mb-3 relative z-10">
        <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
          <div className={`w-9 h-9 sm:w-11 sm:h-11 ${getAvatarColor(review.buyerName)} rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
            {getInitials(review.buyerName)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 text-xs sm:text-sm">{review.buyerName}</span>
              <div className="flex items-center gap-0.5 sm:gap-1 bg-emerald-50 text-emerald-600 px-1 sm:px-1.5 py-0.5 rounded-full">
                <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span className="text-[10px] sm:text-xs font-medium">Verified</span>
              </div>
            </div>
            {review.product?.name && (
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 line-clamp-2 leading-tight">
                {review.product.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stars */}
      <div className="flex gap-0.5 mb-2">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 sm:h-4 sm:w-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
          />
        ))}
      </div>

      {/* Review Text */}
      <div className="relative z-10">
        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed font-body">
          &quot;{displayMessage}&quot;
        </p>
        {isLongMessage && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[#AFA65F] hover:text-[#8a8347] text-xs font-medium mt-1 flex items-center gap-0.5 transition-colors"
          >
            {isExpanded ? (
              <>Show less <ChevronUp className="h-3 w-3" /></>
            ) : (
              <>Read more <ChevronDown className="h-3 w-3" /></>
            )}
          </button>
        )}
      </div>

      {/* Date */}
      <p className="text-[10px] sm:text-xs text-gray-400 mt-2 sm:mt-3 relative z-10">
        {new Date(review.date).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })}
      </p>
    </div>
  )
}

export function TestimonialsPopup({ isOpen, onClose }: TestimonialsPopupProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      fetch('/api/admin/testimonials?limit=100')
        .then(res => res.json())
        .then(data => {
          if (data.reviews && data.reviews.length > 0) {
            const filtered = data.reviews.filter((r: Review) => r.message && r.message.trim() !== '')
            // Map testimonials to include product name from customProductName
            const mapped = filtered.map((r: any) => ({
              ...r,
              product: r.customProductName ? { name: r.customProductName } : (r.product || undefined)
            }))
            setReviews(mapped)
          } else {
            return fetch('/api/reviews')
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
                })))
              })
          }
          setIsLoading(false)
        })
        .catch(() => {
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
              })))
              setIsLoading(false)
            })
            .catch(() => setIsLoading(false))
        })
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#FAFAF8] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl rounded-lg">

        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#AFA65F] via-[#9a9254] to-[#8a8347] px-4 sm:px-8 py-4 sm:py-6 overflow-hidden">
          {/* Floating musical notes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <span className="absolute top-3 left-6 text-white/10 text-2xl sm:text-4xl animate-pulse">♪</span>
            <span className="absolute top-8 right-12 text-white/10 text-xl sm:text-3xl animate-pulse" style={{ animationDelay: '0.5s' }}>♫</span>
            <span className="absolute bottom-4 left-1/4 text-white/10 text-3xl sm:text-5xl animate-pulse" style={{ animationDelay: '1s' }}>♬</span>
          </div>

          {/* Decorative circles */}
          <div className="absolute -top-16 -right-16 w-32 sm:w-48 h-32 sm:h-48 bg-white/5 rounded-full" />
          <div className="absolute -bottom-12 -left-12 w-24 sm:w-36 h-24 sm:h-36 bg-white/5 rounded-full" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 hover:bg-white/20 rounded-full transition-all duration-300 z-10 hover:rotate-90"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </button>

          {/* Title */}
          <div className="text-center relative z-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white font-display mb-2 sm:mb-4">
              Testimonials
            </h2>
          </div>

          {/* Intro Text */}
          <p className="text-white/90 text-xs sm:text-sm md:text-base text-center max-w-2xl mx-auto leading-relaxed font-body relative z-10">
            Our reputation has been built over the years through consistent quality and trust earned from musicians worldwide.
            All testimonials come from verified buyers and students.
          </p>
        </div>

        {/* Reviews List */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] sm:max-h-[calc(90vh-220px)] p-3 sm:p-6 bg-gradient-to-b from-gray-50 to-white">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-3 border-[#AFA65F] border-t-transparent mx-auto mb-3" />
                <p className="text-gray-500 text-xs sm:text-sm">Loading testimonials...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {reviews.map((review, index) => (
                <ReviewCard key={index} review={review} />
              ))}
            </div>
          )}

          {!isLoading && reviews.length === 0 && (
            <div className="text-center py-16">
              <Quote className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No testimonials available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
