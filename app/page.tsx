'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product/ProductCard'
import { getProducts, getCategories, transformProduct, transformCategory } from '@/lib/api'
import type { Product } from '@/lib/data'
import { Phone, Shield, Truck, CreditCard, Award, Headphones, ChevronRight, ChevronLeft, Star, Sparkles } from 'lucide-react'
import { reviews, type Review } from '@/lib/reviews'
import { ScrollAnimations } from '@/components/site/ScrollAnimations'

const getReviewExcerpt = (message: string, maxLength = 160) => {
  if (message.length <= maxLength) return message
  const trimmed = message.slice(0, maxLength)
  const lastSpace = trimmed.lastIndexOf(' ')
  const safeCut = lastSpace > 0 ? trimmed.slice(0, lastSpace) : trimmed
  return `${safeCut.trim()}...`
}

// ============ REVIEWS CAROUSEL COMPONENT ============
interface ReviewsCarouselProps {
  reviews: Review[]
  productImages?: string[]
}

function ReviewsCarousel({ reviews, productImages = [] }: ReviewsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (reviews.length === 0 || isPaused) return

    intervalRef.current = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % reviews.length)
        setTimeout(() => setIsAnimating(false), 50)
      }, 200)
    }, 5000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [reviews.length, isPaused])

  if (reviews.length === 0) return null

  const currentReview = reviews[currentIndex]
  const currentImage = productImages[currentIndex % productImages.length]

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Compact Horizontal Review Card - Full Width */}
      <div
        className={`bg-white p-4 sm:p-5 md:p-6 shadow-lg border border-gray-100 transition-all duration-300 ease-out ${
          isAnimating ? 'opacity-0 scale-98' : 'opacity-100 scale-100'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          {/* Left: Product Image */}
          {currentImage && (
            <div className="hidden sm:block flex-shrink-0">
              <div className="relative w-20 h-20 md:w-24 md:h-24 overflow-hidden shadow-md">
                <Image
                  src={currentImage}
                  alt="Product"
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
            </div>
          )}

          {/* Center: Stars + Name + Review */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                      i < currentReview.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-secondary">{currentReview.buyerName}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(currentReview.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
            <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed italic">
              "{getReviewExcerpt(currentReview.message || 'Great experience!', 220)}"
            </p>
          </div>

          {/* Right: Decorative Saxophone */}
          <div className="hidden lg:flex w-24 h-24 items-center justify-center flex-shrink-0 opacity-20">
            <Image
              src="/saxophone-icon.svg"
              alt="Saxophone"
              width={96}
              height={96}
              className="w-full h-full"
              style={{ filter: 'brightness(0) saturate(100%) invert(69%) sepia(96%) saturate(1467%) hue-rotate(3deg) brightness(104%) contrast(95%)' }}
            />
          </div>
        </div>
      </div>

      {/* View All Reviews Button */}
      <div className="mt-3 sm:mt-4 text-center">
        <Button
          size="sm"
          variant="outline"
          className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold px-5 sm:px-6 text-xs sm:text-sm h-8 sm:h-9"
          asChild
        >
          <Link href="#reviews">
            View All Reviews
            <ChevronRight className="ml-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

// ============ NEW ARRIVALS CAROUSEL COMPONENT ============
interface NewArrivalsCarouselProps {
  products: Product[]
  id: string
}

function NewArrivalsCarousel({ products, id }: NewArrivalsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Number of products to show at once
  const productsPerView = isMobile ? 2 : 6

  // Auto-advance every 4 seconds with fast smooth animation
  useEffect(() => {
    if (products.length === 0 || isPaused) return

    intervalRef.current = setInterval(() => {
      setIsAnimating(true)
      // Quick fade out then change
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % products.length)
        // Quick fade in
        setTimeout(() => setIsAnimating(false), 50)
      }, 200)
    }, 4000) // Change every 4 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [products.length, isPaused])

  // Get products to display
  const getDisplayProducts = () => {
    const display: Product[] = []
    for (let i = 0; i < productsPerView; i++) {
      const index = (currentIndex + i) % products.length
      display.push(products[index])
    }
    return display
  }

  const displayProducts = getDisplayProducts()

  // Manual navigation - fast
  const goToNext = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length)
      setTimeout(() => setIsAnimating(false), 50)
    }, 150)
  }

  const goToPrev = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + products.length) % products.length)
      setTimeout(() => setIsAnimating(false), 50)
    }, 150)
  }

  if (products.length === 0) return null

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Products Grid with Fast Animation */}
      <div className="overflow-hidden">
        <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-6'} gap-3 sm:gap-4`}>
          {displayProducts.map((product, index) => (
            <div
              key={`${id}-${product.id}-${currentIndex}-${index}`}
              className={`transition-all duration-300 ease-out ${
                isAnimating 
                  ? 'opacity-0 scale-95' 
                  : 'opacity-100 scale-100'
              }`}
              style={{ 
                transitionDelay: isAnimating ? '0ms' : `${index * 30}ms`,
              }}
            >
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        type="button"
        aria-label="Previous products"
        onClick={goToPrev}
        className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white/95 border-2 border-primary/20 shadow-xl p-3 text-primary hover:bg-primary hover:text-white hover:border-primary hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary z-10 items-center justify-center"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Next products"
        onClick={goToNext}
        className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/95 border-2 border-primary/20 shadow-xl p-3 text-primary hover:bg-primary hover:text-white hover:border-primary hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary z-10 items-center justify-center"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Progress Indicator - Hidden */}
    </div>
  )
}

// ============ INFINITE CAROUSEL COMPONENT ============
interface InfiniteCarouselProps {
  products: Product[]
  id: string
  speed?: number // pixels per second
}

function InfiniteCarousel({ products, id, speed = 100 }: InfiniteCarouselProps) {
  const [isPaused, setIsPaused] = useState(false)
  const [offset, setOffset] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Card width + gap - smaller on mobile
  const cardWidth = isMobile ? 260 : 320
  const gap = isMobile ? 16 : 24
  const itemWidth = cardWidth + gap
  const totalWidth = products.length * itemWidth

  // Animation loop using requestAnimationFrame
  useEffect(() => {
    if (products.length === 0) return

    // speed is now passed as prop

    const animate = (currentTime: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = currentTime
      }

      const deltaTime = currentTime - lastTimeRef.current
      lastTimeRef.current = currentTime

      if (!isPaused) {
        setOffset(prev => {
          const newOffset = prev + (speed * deltaTime) / 1000
          // Reset when we've scrolled one full set
          if (newOffset >= totalWidth) {
            return 0
          }
          return newOffset
        })
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [products.length, isPaused, totalWidth, speed])

  // Manual scroll functions
  const scroll = (direction: 'left' | 'right') => {
    const scrollAmount = cardWidth
    setOffset(prev => {
      if (direction === 'right') {
        const newOffset = prev + scrollAmount
        return newOffset >= totalWidth ? 0 : newOffset
      } else {
        const newOffset = prev - scrollAmount
        return newOffset < 0 ? totalWidth - scrollAmount : newOffset
      }
    })
  }

  // Triple the products for seamless loop
  const tripleProducts = [...products, ...products, ...products]

  if (products.length === 0) return null

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Overflow container */}
      <div className="overflow-hidden" ref={containerRef}>
        {/* Moving track */}
        <div
          className={`flex ${isMobile ? 'gap-4' : 'gap-6'}`}
          style={{
            transform: `translateX(-${offset}px)`,
            width: `${tripleProducts.length * itemWidth}px`
          }}
        >
          {tripleProducts.map((product, index) => (
            <div
              key={`${id}-${product.id}-${index}`}
              className="flex-shrink-0"
              style={{ width: `${cardWidth}px` }}
            >
              <ProductCard product={product} index={index % products.length} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows - hidden on mobile */}
      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scroll('left')}
        className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white/90 border border-primary/20 shadow-lg p-3 text-primary hover:bg-primary hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary z-10"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scroll('right')}
        className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/90 border border-primary/20 shadow-lg p-3 text-primary hover:bg-primary hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary z-10"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}

// ============ MAIN PAGE COMPONENT ============
export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [saleProducts, setSaleProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        const featuredResponse = await getProducts({ badge: 'new', limit: 8 })
        const featured = featuredResponse.products.map(transformProduct)
        setFeaturedProducts(featured)

        const comingSoonResponse = await getProducts({ badge: 'coming-soon', limit: 8 })
        const comingSoon = comingSoonResponse.products.map(transformProduct)
        setSaleProducts(comingSoon)

        // Fetch all products for gallery
        const allResponse = await getProducts({ limit: 28 })
        const all = allResponse.products.map(transformProduct)
        setAllProducts(all)

        const categoriesData = await getCategories()
        const transformedCategories = categoriesData.map(transformCategory)
        setCategories(transformedCategories)

        // Set loading to false early so page can render - critical data is loaded
        setIsLoading(false)

        // Extract all subcategories with products
        const allSubcategories: any[] = []
        transformedCategories.forEach(cat => {
          if (cat.subcategories) {
            cat.subcategories.forEach((sub: any) => {
              allSubcategories.push({ ...sub, categoryName: cat.name, categorySlug: cat.slug })
            })
          }
        })

        // Fetch product counts in background (non-blocking) - optimized: fetch in parallel and use count API
        Promise.all([
          // Fetch subcategory counts in parallel
          Promise.all(allSubcategories.map(async (sub) => {
            try {
              const response = await fetch(`/api/products/count?subcategory=${sub.slug}&inStock=true`)
              if (!response.ok) {
                return { slug: sub.slug, count: 0 }
              }
              const data = await response.json()
              return { slug: sub.slug, count: data.count || 0 }
            } catch (error) {
              console.error(`Error counting products for subcategory ${sub.slug}:`, error)
              return { slug: sub.slug, count: 0 }
            }
          })),
          // Fetch category counts in parallel
          Promise.all(transformedCategories.map(async (cat) => {
            try {
              const response = await fetch(`/api/products/count?category=${cat.slug}&inStock=true`)
              if (!response.ok) {
                return { slug: cat.slug, count: 0 }
              }
              const data = await response.json()
              return { slug: cat.slug, count: data.count || 0 }
            } catch (error) {
              console.error(`Error counting products for category ${cat.slug}:`, error)
              return { slug: cat.slug, count: 0 }
            }
          }))
        ]).then(([subcategoryCountResults, categoryCountResults]) => {
          const subcategoryCounts: Record<string, number> = {}
          subcategoryCountResults.forEach(result => {
            subcategoryCounts[result.slug] = result.count
          })

          // Filter subcategories that have products
          const subcategoriesWithProducts = allSubcategories.filter(sub => (subcategoryCounts[sub.slug] || 0) > 0)
          setSubcategories(subcategoriesWithProducts)

          const counts: Record<string, number> = {}
          categoryCountResults.forEach(result => {
            counts[result.slug] = result.count
          })
          setCategoryCounts({ ...counts, ...subcategoryCounts })
        }).catch(error => {
          console.error('Error fetching product counts:', error)
        })
      } catch (error) {
        console.error('Error fetching data:', error)
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-0 page-content">
      <ScrollAnimations />
      {/* Hero Section - Vintage Classic Style with JSC Logo */}
      <section className="homepage-hero relative min-h-[200px] md:min-h-[260px] lg:min-h-[300px] overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/90">
        {/* Music Note Pattern Background - Larger */}
        <div className="absolute inset-0 opacity-[0.12]">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url('/musicnote.svg')`,
              backgroundSize: '200px 200px',
              backgroundRepeat: 'repeat',
            }}
          />
        </div>

        {/* Floating musical notes decoration - Larger */}
        <div className="absolute top-10 left-10 text-6xl md:text-7xl text-secondary/25 animate-float-sine">♪</div>
        <div className="absolute top-20 right-16 text-7xl md:text-8xl text-secondary/25 animate-float-sine" style={{ animationDelay: '1.5s' }}>♫</div>
        <div className="absolute bottom-20 left-1/4 text-5xl md:text-6xl text-secondary/25 animate-float-sine" style={{ animationDelay: '3s' }}>♩</div>
        <div className="absolute top-1/3 right-1/3 text-6xl md:text-7xl text-secondary/25 animate-float-sine" style={{ animationDelay: '0.7s' }}>♬</div>
        <div className="absolute bottom-10 right-1/4 text-5xl md:text-6xl text-secondary/25 animate-float-sine" style={{ animationDelay: '2.2s' }}>♪</div>

        <div className="container relative mx-auto flex min-h-[200px] md:min-h-[260px] lg:min-h-[300px] items-center px-4 py-6 md:py-8">
          <div className="max-w-4xl space-y-3 md:space-y-4">
            {/* JSC Logo SVG - Larger */}
            <div className="hero-title">
              <Image
                src="/jsc.svg"
                alt="James Sax Corner"
                width={700}
                height={140}
                className="h-[70px] md:h-[100px] lg:h-[130px] w-auto"
                style={{ filter: 'brightness(0) saturate(100%) invert(33%) sepia(15%) saturate(1000%) hue-rotate(10deg) brightness(95%) contrast(90%)' }}
                priority
              />
            </div>

            {/* Decorative Divider */}
            <div className="hero-subtitle flex items-center space-x-4">
              <div className="h-px w-20 bg-gradient-to-r from-transparent to-secondary/50" />
              <span className="text-xl text-secondary/60">✦</span>
              <div className="h-px w-20 bg-gradient-to-l from-transparent to-secondary/50" />
            </div>

            <p className="hero-cta text-sm md:text-base leading-relaxed text-secondary/70 max-w-2xl font-body">
              Premium Japanese saxophones, expertly maintained for peak performance. Trusted by musicians worldwide, backed by outstanding reviews. Unmatched customer service—your satisfaction comes first! Buy with confidence.
            </p>

            <div className="hero-cta flex flex-wrap gap-4 pt-1">
              <Button size="default" variant="outline" className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-white hover:scale-105 group transition-all duration-300 font-body" asChild>
                <Link href="/shop" className="flex items-center">
                  Buy with confidence!
                  <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip - Classic Style with animations */}
      <section className="border-y-2 border-primary/30 bg-white py-10 hidden" aria-hidden="true">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { icon: Headphones, title: 'Expert Advice', desc: 'Pro musicians on staff', delay: 0 },
              { icon: Award, title: 'Professional Setup', desc: 'Play-tested before shipping', delay: 0.1 },
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over $500', delay: 0.2 },
              { icon: CreditCard, title: 'Financing', desc: '0% APR available', delay: 0.3 },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center space-y-3 p-4 rounded-xl hover:bg-primary/5 transition-all duration-300 hover:shadow-lg group animate-fade-in-up"
                style={{ animationDelay: `${item.delay}s` }}
              >
                <div className="rounded-full border-2 border-primary p-4 group-hover:bg-primary group-hover:border-primary transition-all duration-300 group-hover:scale-110">
                  <item.icon className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
                </div>
                <p className="font-semibold text-secondary">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews Section - Compact */}
      <section className="bg-gradient-to-br from-amber-50 via-white to-blue-50 py-4 sm:py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="mb-3 sm:mb-4 text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-amber-100 text-amber-800 text-[10px] sm:text-xs font-medium mb-2">
              <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-amber-400 text-amber-400" />
              Trusted by Musicians Worldwide
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-secondary mb-1 sm:mb-2">
              What Our Customers Say
            </h2>
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-base sm:text-lg font-bold text-secondary ml-1">5.0</span>
            </div>
          </div>

          {/* Reviews Grid - Auto-scrolling Carousel */}
          <ReviewsCarousel reviews={reviews} productImages={allProducts.slice(0, 10).map(p => p.images[0])} />
        </div>
      </section>

      {/* NEW ARRIVALS Section */}
      {saleProducts.length > 0 && (
        <section className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
          <div className="mb-4 sm:mb-5 text-center animate-fade-in-up">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-secondary">NEW ARRIVALS</h2>
            <div className="mt-2 flex items-center justify-center space-x-4">
              <div className="h-px w-12 sm:w-16 bg-gradient-to-r from-transparent to-primary" />
              <span className="text-3xl sm:text-4xl text-primary">♪</span>
              <div className="h-px w-12 sm:w-16 bg-gradient-to-l from-transparent to-primary" />
            </div>
          </div>

          {/* New Arrivals Products Carousel with smooth transitions */}
          <NewArrivalsCarousel products={saleProducts} id="new-arrivals" />
        </section>
      )}

      {/* Featured Products - New Arrivals */}
      <section className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        <div className="mb-4 sm:mb-5 text-center animate-fade-in-up">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-secondary">Featured Instruments</h2>
          <div className="mt-2 flex items-center justify-center space-x-4">
            <div className="h-px w-12 sm:w-16 bg-gradient-to-r from-transparent to-primary" />
            <span className="text-3xl sm:text-4xl text-primary">♫</span>
            <div className="h-px w-12 sm:w-16 bg-gradient-to-l from-transparent to-primary" />
          </div>
        </div>

        {/* Product Carousel with smooth transitions - same as NEW ARRIVALS */}
        <NewArrivalsCarousel products={featuredProducts} id="featured" />

        {/* View All Button */}
        <div className="mt-4 sm:mt-5 text-center">
          <Button
            variant="outline"
            size="lg"
            className="border-2 border-secondary bg-white text-secondary hover:bg-secondary hover:text-white group px-6 sm:px-8 shadow-lg text-sm sm:text-base"
            asChild
          >
            <Link href="/shop" className="flex items-center">
              View All Instruments
              <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Shop by Category - With Product Images */}
      <section className="bg-gradient-to-b from-muted/50 to-white py-4 sm:py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="mb-4 sm:mb-5 text-center animate-fade-in-up">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-secondary">Shop by Category</h2>
            <div className="mt-2 flex items-center justify-center space-x-4">
              <div className="h-px w-12 sm:w-16 bg-gradient-to-r from-transparent to-primary" />
              <span className="text-3xl sm:text-4xl text-primary">♬</span>
              <div className="h-px w-12 sm:w-16 bg-gradient-to-l from-transparent to-primary" />
            </div>
          </div>

          <div className="w-full px-0 sm:px-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 w-full">
              {subcategories.map((sub, i) => {
                // Remove "Saxophones" from display name
                const displayName = sub.name.replace(/\s+Saxophones?/gi, '')
                // Get a product image for this category from allProducts
                const categoryProduct = allProducts.find(p => 
                  p.name.toLowerCase().includes(displayName.toLowerCase()) ||
                  p.category?.toLowerCase().includes(displayName.toLowerCase())
                ) || allProducts[i % allProducts.length]

                return (
                  <Link
                    key={sub.slug}
                    href={`/shop?subcategory=${sub.slug}`}
                    className="group relative overflow-hidden border-2 border-transparent hover:border-primary transition-all duration-500 hover:shadow-2xl animate-fade-in-up"
                    style={{ animationDelay: `${0.1 * i}s` }}
                  >
                    {/* Background Product Image */}
                    <div className="relative h-[120px] sm:h-[140px] md:h-[160px] lg:h-[180px]">
                      <Image
                        src={categoryProduct?.images[0] || '/placeholder.jpg'}
                        alt={displayName}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/70 to-transparent" />
                      
                      {/* Category Name */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white group-hover:text-amber-300 transition-colors duration-300">
                          {displayName}
                        </h3>
                        <p className="text-xs text-white/70 mt-0.5">View Collection →</p>
                      </div>
                    </div>
                  </Link>
                )
              })}

              {/* Add Baritone category if not exists in subcategories */}
              {!subcategories.find(s => s.slug.includes('baritone') || s.name.toLowerCase().includes('baritone')) && (
                <Link
                  href="/shop?subcategory=baritone-saxophones"
                  className="group relative overflow-hidden border-2 border-transparent hover:border-primary transition-all duration-500 hover:shadow-2xl animate-fade-in-up"
                  style={{ animationDelay: `${0.1 * subcategories.length}s` }}
                >
                  {/* Background Product Image */}
                  <div className="relative h-[120px] sm:h-[140px] md:h-[160px] lg:h-[180px]">
                    <Image
                      src={allProducts[3]?.images[0] || '/placeholder.jpg'}
                      alt="Baritone"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/70 to-transparent" />
                    
                    {/* Category Name */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white group-hover:text-amber-300 transition-colors duration-300">
                        Baritone
                      </h3>
                      <p className="text-xs text-white/70 mt-0.5">View Collection →</p>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial / Why Choose Us - With Product Image */}
      <section id="reviews" className="bg-gradient-to-br from-amber-50/30 via-white to-blue-50/30 py-4 sm:py-6 md:py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:grid md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 items-stretch">
            {/* Left: Product Image Showcase */}
            <div className="hidden md:flex animate-fade-in-left items-center justify-center">
              <div className="relative w-full max-w-[200px] aspect-[3/4] overflow-hidden shadow-2xl">
                <Image
                  src={allProducts[0]?.images[0] || '/placeholder.jpg'}
                  alt="Premium Saxophone"
                  fill
                  className="object-cover"
                  sizes="200px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white text-xs font-medium">Premium Quality</p>
                  <p className="text-amber-300 text-[10px]">Handpicked Selection</p>
                </div>
              </div>
            </div>

            {/* Center: Why Musicians Choose Us */}
            <div className="animate-fade-in-up flex flex-col">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-secondary mb-3 sm:mb-4 text-center md:text-left">
                Why Musicians Choose Us
              </h2>
              <div className="space-y-2 sm:space-y-3 flex-1">
                {[
                  { title: '40+ Years of Expertise', desc: 'Trusted by professional musicians since 1985' },
                  { title: 'Professional Setup', desc: 'Every instrument is play-tested and adjusted' },
                  { title: 'Expert Consultation', desc: 'Our staff includes professional players' },
                  { title: 'Lifetime Support', desc: 'We\'re here throughout your musical journey' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-2 sm:gap-3 p-2 sm:p-2.5 bg-white border border-transparent hover:border-primary/30 transition-all duration-500 hover:shadow-lg">
                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-primary/10 flex items-center justify-center">
                      <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary text-xs sm:text-sm">{item.title}</h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Featured Review - Zach E. */}
            <div className="animate-fade-in-right flex flex-col">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 sm:p-5 h-full flex flex-col justify-center">
                <div className="flex justify-center mb-3 sm:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-sm sm:text-base md:text-lg italic text-secondary mb-4 sm:mb-5 leading-relaxed text-center">
                  &ldquo;This was the single best transaction I've had with an online seller. James sent me a 10 minute video minutes after contacting him detailing the horn and exhibiting the condition. Shipping from Vietnam to the US east coast took 3 days and the packaging was impeccable. The horn arrived exactly as described and plays just as well as it should; James did an excellent job replacing pads and adjusting. There are no visible or audible leaks. I would purchase from him again in a heartbeat.&rdquo;
                </blockquote>
                <div className="font-semibold text-secondary text-sm sm:text-base text-center">— Zach E.</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Join Our Musical Community - Compact */}
      <section className="bg-gradient-to-r from-primary to-primary/80 py-2 sm:py-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
            <div className="text-center sm:text-left">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1 justify-center sm:justify-start">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                Join Our Musical Community
              </h3>
              <p className="text-white/80 text-[9px] sm:text-xs hidden sm:block">Get exclusive deals, tips, and industry news</p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const email = formData.get('email')
                if (email) {
                  alert('Thank you for subscribing!')
                  e.currentTarget.reset()
                }
              }}
              className="flex gap-1.5 w-full sm:w-auto"
            >
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="bg-white/20 border border-white/30 placeholder:text-white/60 text-white min-w-0 flex-1 sm:min-w-[160px] px-2.5 py-1.5 transition-all duration-300 focus:bg-white/30 focus:outline-none focus:border-white/50 text-[11px] sm:text-xs"
                required
              />
              <Button
                type="submit"
                size="sm"
                className="bg-secondary hover:bg-secondary/90 text-white px-3 transition-all duration-300 text-[11px] sm:text-xs h-7"
              >
                <span className="flex items-center gap-0.5">
                  Subscribe
                  <ChevronRight className="h-3 w-3" />
                </span>
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
