'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import type { Product } from '@/lib/data'

interface NewArrivalsCarouselProps {
    products: Product[]
    id: string
    autoRotate?: boolean // Enable/disable auto rotation
}

export function NewArrivalsCarousel({ products, id, autoRotate = true }: NewArrivalsCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const productsPerView = isMobile ? 2 : 6

    // Only auto-rotate if enabled and we have more products than can be displayed
    useEffect(() => {
        if (!autoRotate || products.length <= productsPerView || isPaused) return
        intervalRef.current = setInterval(() => {
            setIsAnimating(true)
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % products.length)
                setTimeout(() => setIsAnimating(false), 50)
            }, 200)
        }, 4000)
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [products.length, isPaused, autoRotate, productsPerView])

    const getDisplayProducts = () => {
        // If we have fewer products than slots, just show what we have (no duplication)
        if (products.length <= productsPerView) {
            return products
        }
        // Otherwise, show a sliding window of products
        const display: Product[] = []
        for (let i = 0; i < productsPerView; i++) {
            const index = (currentIndex + i) % products.length
            display.push(products[index])
        }
        return display
    }

    const displayProducts = getDisplayProducts()
    const productCount = displayProducts.length
    const showNavigation = products.length > productsPerView

    // Calculate grid columns based on product count (for centering when < 6)
    const getGridClass = () => {
        if (isMobile) return 'grid-cols-2'
        if (productCount === 1) return 'grid-cols-1 max-w-xs mx-auto'
        if (productCount === 2) return 'grid-cols-2 max-w-lg mx-auto'
        if (productCount === 3) return 'grid-cols-3 max-w-2xl mx-auto'
        if (productCount === 4) return 'grid-cols-4 max-w-4xl mx-auto'
        if (productCount === 5) return 'grid-cols-5 max-w-5xl mx-auto'
        return 'grid-cols-6'
    }

    const goToNext = () => {
        if (!showNavigation) return
        setIsAnimating(true)
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % products.length)
            setTimeout(() => setIsAnimating(false), 50)
        }, 150)
    }

    const goToPrev = () => {
        if (!showNavigation) return
        setIsAnimating(true)
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + products.length) % products.length)
            setTimeout(() => setIsAnimating(false), 50)
        }, 150)
    }

    if (products.length === 0) return null

    return (
        <div className="relative" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
            <div className="overflow-hidden">
                <div className={`grid ${getGridClass()} gap-3 sm:gap-4`}>
                    {displayProducts.map((product, index) => (
                        <div
                            key={`${id}-${product.id}-${currentIndex}-${index}`}
                            className={`transition-all duration-300 ease-out ${isAnimating && showNavigation ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                            style={{ transitionDelay: isAnimating ? '0ms' : `${index * 30}ms` }}
                        >
                            <ProductCard product={product} index={index} />
                        </div>
                    ))}
                </div>
            </div>
            {showNavigation && (
                <>
                    <button type="button" aria-label="Previous products" onClick={goToPrev} className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white/95 border-2 border-primary/20 shadow-xl p-3 text-primary hover:bg-primary hover:text-white hover:border-primary hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary z-10 items-center justify-center">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button type="button" aria-label="Next products" onClick={goToNext} className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/95 border-2 border-primary/20 shadow-xl p-3 text-primary hover:bg-primary hover:text-white hover:border-primary hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary z-10 items-center justify-center">
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </>
            )}
        </div>
    )
}
