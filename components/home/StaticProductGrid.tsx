'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import type { Product } from '@/lib/data'

interface StaticProductGridProps {
    products: Product[]
    id: string
}

export function StaticProductGrid({ products, id }: StaticProductGridProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    if (products.length === 0) return null

    const productsPerView = isMobile ? 2 : 6
    const showNavigation = products.length > productsPerView

    // Get products to display based on current index
    const getDisplayProducts = () => {
        if (products.length <= productsPerView) {
            return products
        }
        // Show a sliding window of products with loop
        const display: Product[] = []
        for (let i = 0; i < productsPerView; i++) {
            const index = (currentIndex + i) % products.length
            display.push(products[index])
        }
        return display
    }

    const displayProducts = getDisplayProducts()
    const productCount = displayProducts.length

    // Calculate grid columns
    // For 1-3 products: always use 3-column grid to maintain consistent card size
    // For 4-6 products: use actual product count as columns
    const getGridClass = () => {
        if (isMobile) return 'grid-cols-2'
        if (productCount <= 3) return 'grid-cols-3' // Fixed 3 columns for 1-3 products
        if (productCount === 4) return 'grid-cols-4'
        if (productCount === 5) return 'grid-cols-5'
        return 'grid-cols-6'
    }

    // Check if we need to center items (when 1-2 products in 3-column grid)
    const shouldCenterItems = !isMobile && productCount < 3

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

    return (
        <div className="relative">
            <div className="overflow-visible">
                <div className={`grid ${getGridClass()} gap-3 sm:gap-6 ${shouldCenterItems ? 'justify-center' : ''}`}>
                    {displayProducts.map((product, index) => (
                        <div
                            key={`${id}-${product.id}-${currentIndex}-${index}`}
                            className={`transition-all duration-300 ease-out hover:scale-110 hover:z-10 ${isAnimating && showNavigation ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} ${shouldCenterItems && productCount === 1 ? 'col-start-2' : ''}`}
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
