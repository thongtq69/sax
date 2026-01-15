'use client'

import { useState, useEffect, useRef } from 'react'
import { Star } from 'lucide-react'
import type { Review } from '@/lib/reviews'

interface ReviewsCarouselProps {
    reviews: Review[]
    productImages?: string[]
    onViewAll?: () => void
}

const getReviewExcerpt = (message: string, maxLength = 160) => {
    if (message.length <= maxLength) return message
    const trimmed = message.slice(0, maxLength)
    const lastSpace = trimmed.lastIndexOf(' ')
    const safeCut = lastSpace > 0 ? trimmed.slice(0, lastSpace) : trimmed
    return `${safeCut.trim()}...`
}

export function ReviewsCarousel({ reviews, productImages = [], onViewAll }: ReviewsCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    const reviewsLength = reviews?.length ?? 0

    useEffect(() => {
        if (reviewsLength === 0 || isPaused) return
        intervalRef.current = setInterval(() => {
            setIsAnimating(true)
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % reviewsLength)
                setTimeout(() => setIsAnimating(false), 50)
            }, 5000)
        }, 5000)
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [reviewsLength, isPaused])

    if (reviewsLength === 0) return null
    const currentReview = reviews[currentIndex]

    return (
        <div className="relative" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
            <div 
                className={`bg-white/85 backdrop-blur-md px-8 sm:px-10 md:px-12 py-6 sm:py-8 shadow-xl border border-white/50 rounded-xl w-full transition-all duration-300 ease-out relative ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} ${onViewAll ? 'cursor-pointer hover:shadow-2xl hover:scale-[1.02]' : ''}`}
                onClick={onViewAll}
            >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                    <div className="flex-1">
                        <p className="text-gray-700 text-base sm:text-lg md:text-xl leading-relaxed italic">
                            <span className="text-amber-400 text-2xl mr-1">&quot;</span>
                            {getReviewExcerpt(currentReview.message || 'Great experience!', 300)}
                            <span className="text-amber-400 text-2xl ml-1">&quot;</span>
                        </p>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 shrink-0">
                        <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 sm:h-5 sm:w-5 ${i < currentReview.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
                            ))}
                        </div>
                        <div className="text-right">
                            <span className="font-semibold text-secondary text-base">{currentReview.buyerName}</span>
                            <span className="text-gray-400 mx-1.5 hidden sm:inline">•</span>
                            <span className="text-sm text-gray-500 block sm:inline">
                                {new Date(currentReview.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
