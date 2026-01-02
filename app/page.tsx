'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product/ProductCard'
import { getProducts, getCategories, transformProduct, transformCategory } from '@/lib/api'
import type { Product } from '@/lib/data'
import { Phone, Shield, Truck, CreditCard, Award, Headphones, Music, ChevronRight, ChevronLeft, Star, Sparkles } from 'lucide-react'
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
}

function ReviewsCarousel({ reviews }: ReviewsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Show 4 reviews at a time
  const reviewsPerView = 4

  useEffect(() => {
    if (reviews.length === 0 || isPaused) return

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        // Calculate next index - loop through all reviews
        const nextIndex = prev + reviewsPerView
        if (nextIndex >= reviews.length) {
          return 0
        }
        return nextIndex
      })
    }, 4000) // Change every 4 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [reviews.length, isPaused])

  if (reviews.length === 0) return null

  // Get reviews to display - create circular array
  const getDisplayReviews = () => {
    const display: Review[] = []
    for (let i = 0; i < reviewsPerView; i++) {
      const index = (currentIndex + i) % reviews.length
      display.push(reviews[index])
    }
    return display
  }

  const displayReviews = getDisplayReviews()

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayReviews.map((review, index) => (
          <div
            key={`${review.id}-${currentIndex}-${index}`}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-primary/30 hover:-translate-y-2 hover-border-glow transition-all duration-500 animate-fade-in-up group"
            style={{ animationDelay: `${0.1 * index}s` }}
          >
            <div className="flex items-center gap-1 mb-3 group-hover:scale-105 transition-transform duration-300">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 transition-all duration-300 group-hover:animate-star-twinkle ${i < review.rating
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-gray-200 text-gray-200'
                    }`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                />
              ))}
            </div>
            <p className="text-gray-700 mb-4 text-sm leading-relaxed">
              "{getReviewExcerpt(review.message || 'Great experience!', 140)}"
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 animate-fade-in-up" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
              <div>
                <p className="font-semibold text-secondary text-sm">{review.buyerName}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(review.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="text-2xl transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">🎷</div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Reviews Button */}
      <div className="mt-10 text-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <Button
          size="lg"
          variant="outline"
          className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold px-8"
          asChild
        >
          <Link href="#reviews">
            View All Reviews
            <ChevronRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
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
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)

  // Card width + gap
  const cardWidth = 320
  const gap = 24
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
          className="flex gap-6"
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

      {/* Navigation arrows */}
      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white/90 border border-primary/20 shadow-lg p-3 text-primary hover:bg-primary hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary z-10"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/90 border border-primary/20 shadow-lg p-3 text-primary hover:bg-primary hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary z-10"
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
      {/* Hero Section - Vintage Classic Style */}
      <section className="homepage-hero relative min-h-[320px] md:min-h-[420px] lg:min-h-[480px] overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/90">
        {/* Animated Vintage Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 animate-pulse-soft" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M40 0l40 40-40 40L0 40 40 0zm0 10L10 40l30 30 30-30-30-30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Floating musical notes decoration with sine wave animation */}
        <div className="absolute top-20 left-10 text-4xl text-secondary/20 animate-float-sine">♪</div>
        <div className="absolute top-40 right-20 text-5xl text-secondary/20 animate-float-sine" style={{ animationDelay: '1.5s' }}>♫</div>
        <div className="absolute bottom-40 left-1/4 text-3xl text-secondary/20 animate-float-sine" style={{ animationDelay: '3s' }}>♩</div>
        <div className="absolute top-1/3 right-1/3 text-4xl text-secondary/20 animate-float-sine" style={{ animationDelay: '0.7s' }}>♬</div>
        <div className="absolute bottom-20 right-1/4 text-3xl text-secondary/20 animate-float-sine" style={{ animationDelay: '2.2s' }}>♪</div>

        {/* Art Deco Lines */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-secondary opacity-40" />
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-secondary opacity-20" />

        <div className="container relative mx-auto flex min-h-[320px] md:min-h-[420px] lg:min-h-[480px] items-center px-4 py-6 md:py-10 lg:py-12">
          <div className="max-w-3xl space-y-3 md:space-y-5">
            {/* Vintage Badge with animation */}
            <div className="hero-title inline-flex items-center space-x-1.5 md:space-x-2 rounded border-2 border-secondary/30 bg-secondary/10 px-3 py-1.5 md:px-4 md:py-2 backdrop-blur-sm">
              <Music className="h-3.5 w-3.5 md:h-4 md:w-4 text-secondary animate-bounce-soft" />
              <span className="text-xs md:text-sm font-medium tracking-widest uppercase text-secondary">
                Premium Wind Instruments
              </span>
            </div>

            {/* Classic Typography with stagger animation */}
            <h1 className="hero-subtitle font-elegant uppercase text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold leading-[0.9] tracking-[0.32em] md:tracking-[0.36em]">
              <span className="block text-[#6b5b32]">James Sax</span>
              <span className="block text-[#6b5b32] tracking-[0.24em] md:tracking-[0.28em]" style={{ animationDelay: '0.3s' }}>Corner</span>
            </h1>

            {/* Decorative Divider with animation */}
            <div className="hero-subtitle flex items-center space-x-4" style={{ animationDelay: '0.5s' }}>
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-secondary/50" />
              <span className="text-2xl text-secondary animate-pulse">✦</span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-secondary/50" />
            </div>

            <p className="hero-subtitle text-2xl font-medium text-secondary/90 italic" style={{ animationDelay: '0.6s' }}>
              Wind Instrument Specialists
            </p>

            <p className="hero-cta text-lg leading-relaxed text-secondary/80 max-w-2xl">
              Premium Japanese saxophones, expertly maintained for peak performance. Trusted by musicians worldwide, backed by outstanding reviews. Unmatched customer service—your satisfaction comes first! Buy with confidence.
            </p>

            <div className="hero-cta flex flex-wrap gap-4 pt-3 md:pt-4" style={{ animationDelay: '0.8s' }}>
              <Button size="lg" variant="outline" className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-white hover:scale-105 hover:shadow-2xl group transition-all duration-300" asChild>
                <Link href="/shop" className="flex items-center relative overflow-hidden">
                  Explore Collection
                  <ChevronRight className="ml-1 h-4 w-4 transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100 opacity-70" />
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Art Deco Lines */}
        <div className="absolute bottom-3 left-0 right-0 h-0.5 bg-secondary opacity-20" />
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-secondary opacity-40" />
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

      {/* Customer Reviews Section - At the Top */}
      <section className="bg-gradient-to-br from-amber-50 via-white to-blue-50 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-800 text-sm font-medium mb-4">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              Trusted by Musicians Worldwide
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary mb-4">
              What Our Customers Say
            </h2>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-2xl font-bold text-secondary ml-2">5.0</span>
            </div>
          </div>

          {/* Reviews Grid - Auto-scrolling Carousel */}
          <ReviewsCarousel reviews={reviews} />
        </div>
      </section>

      {/* Coming Soon Section */}
      {saleProducts.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="mb-10 text-center animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary">Coming Soon</h2>
            <div className="mt-3 flex items-center justify-center space-x-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary" />
              <span className="text-2xl text-primary">♫</span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary" />
            </div>
          </div>

          {/* Auto-scrolling Coming Soon Products Carousel - SAME STYLE AS FEATURED */}
          <InfiniteCarousel products={saleProducts} id="coming-soon" speed={150} />
        </section>
      )}

      {/* Featured Products - New Arrivals */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-10 text-center animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary">Featured Instruments</h2>
          <div className="mt-3 flex items-center justify-center space-x-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary" />
            <span className="text-2xl text-primary">♫</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary" />
          </div>
        </div>

        {/* Auto-scrolling Product Carousel - CONTINUOUS INFINITE SCROLL */}
        <InfiniteCarousel products={featuredProducts} id="featured" speed={150} />

        {/* View All Button */}
        <div className="mt-10 text-center">
          <Button
            variant="outline"
            size="lg"
            className="border-2 border-secondary bg-white text-secondary hover:bg-secondary hover:text-white group px-8 shadow-lg"
            asChild
          >
            <Link href="/shop" className="flex items-center">
              View All Instruments
              <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="bg-gradient-to-b from-muted/50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary">Shop by Category</h2>
            <div className="mt-3 flex items-center justify-center space-x-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary" />
              <span className="text-2xl text-primary">🎷</span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary" />
            </div>
          </div>

          <div className="w-full px-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6 w-full">
              {subcategories.map((sub, i) => {
                const totalCount = categoryCounts[sub.slug] || 0

                // Remove "Saxophones" from display name
                const displayName = sub.name.replace(/\s+Saxophones?/gi, '')

                return (
                  <Link
                    key={sub.slug}
                    href={`/shop?subcategory=${sub.slug}`}
                    className="group relative overflow-hidden rounded-2xl bg-secondary border-2 border-transparent hover:border-gradient-animate transition-all duration-500 hover:shadow-2xl animate-tilt-3d animate-fade-in-up"
                    style={{ animationDelay: `${0.1 * i}s` }}
                  >
                    {/* Gradient border effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-accent via-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl -z-10" style={{ padding: '2px' }} />

                    {/* Horizontal layout container - icon left, text right */}
                    <div className="relative z-10 flex flex-row items-center p-5 md:p-6 lg:p-8 h-full min-h-[120px] md:min-h-[140px] bg-secondary rounded-2xl">
                      {/* Left section - Small golden saxophone icon */}
                      <div className="flex-shrink-0 mr-4 md:mr-5 lg:mr-6 flex items-center justify-center">
                        <div className="relative w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 flex items-center justify-center transition-all duration-300 scale-110 group-hover:scale-125 group-hover:animate-sax-swing">
                          <Image
                            src="/saxophone-icon.svg"
                            alt="Saxophone"
                            width={64}
                            height={64}
                            className="w-full h-full"
                            style={{ filter: 'brightness(0) saturate(100%) invert(69%) sepia(96%) saturate(1467%) hue-rotate(3deg) brightness(104%) contrast(95%)' }}
                          />
                        </div>
                      </div>

                      {/* Right section - Category info (white text) */}
                      <div className="flex-1 flex flex-col justify-center space-y-1 md:space-y-1.5">
                        <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white group-hover:text-accent transition-colors duration-300 leading-tight">
                          {displayName}
                        </h3>
                        <p className="text-sm md:text-base text-white/80 font-medium counter-animate" style={{ animationDelay: `${0.15 * i}s` }}>
                          {totalCount} {totalCount === 1 ? 'Product' : 'Products'}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}

              {/* Add Baritone category if not exists in subcategories */}
              {!subcategories.find(s => s.slug.includes('baritone') || s.name.toLowerCase().includes('baritone')) && (
                <Link
                  href="/shop?subcategory=baritone-saxophones"
                  className="group relative overflow-hidden rounded-2xl bg-secondary border border-secondary/80 transition-all duration-300 hover:shadow-xl hover:bg-secondary/90 hover:scale-[1.02] animate-fade-in-up"
                  style={{ animationDelay: `${0.1 * subcategories.length}s` }}
                >
                  {/* Horizontal layout container - icon left, text right */}
                  <div className="relative z-10 flex flex-row items-center p-5 md:p-6 lg:p-8 h-full min-h-[120px] md:min-h-[140px]">
                    {/* Left section - Small golden saxophone icon */}
                    <div className="flex-shrink-0 mr-4 md:mr-5 lg:mr-6 flex items-center justify-center">
                      <div className="relative w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 flex items-center justify-center transition-all duration-300 scale-110 group-hover:scale-125">
                        <Image
                          src="/saxophone-icon.svg"
                          alt="Saxophone"
                          width={64}
                          height={64}
                          className="w-full h-full"
                          style={{ filter: 'brightness(0) saturate(100%) invert(69%) sepia(96%) saturate(1467%) hue-rotate(3deg) brightness(104%) contrast(95%)' }}
                        />
                      </div>
                    </div>

                    {/* Right section - Category info (white text) */}
                    <div className="flex-1 flex flex-col justify-center space-y-1 md:space-y-1.5">
                      <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white group-hover:text-accent transition-colors duration-300 leading-tight">
                        Baritone
                      </h3>
                      <p className="text-sm md:text-base text-white/80 font-medium">
                        0 Products
                      </p>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial / Why Choose Us */}
      <section id="reviews" className="bg-gradient-to-br from-amber-50/30 via-white to-blue-50/30 py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-10 lg:gap-12 items-stretch">
            <div className="animate-fade-in-left flex flex-col">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-6">
                Why Musicians Choose Us
              </h2>
              <div className="space-y-4 mb-8">
                {[
                  { title: '40+ Years of Expertise', desc: 'Trusted by professional musicians since 1985' },
                  { title: 'Professional Setup', desc: 'Every instrument is play-tested and adjusted by our technicians' },
                  { title: 'Expert Consultation', desc: 'Our staff includes professional players who understand your needs' },
                  { title: 'Lifetime Support', desc: 'We\'re here to help you throughout your musical journey' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-white border-2 border-transparent hover:border-primary/30 transition-all duration-500 hover:shadow-lg progressive-reveal scroll-reveal" data-delay={i * 100}>
                    <div className="flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center transition-transform duration-300 hover:scale-110 group">
                      <Star className="h-4 w-4 md:h-5 md:w-5 text-primary group-hover:animate-star-twinkle" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary underline-slide">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Featured Review Card */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-4 sm:p-6 md:p-8 text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-base sm:text-lg md:text-xl italic text-secondary mb-4 md:mb-6 leading-relaxed">
                  &ldquo;{reviews.find(r => r.id === '2')?.message || "This was the single best transaction I've had with an online seller. James sent me a 10 minute video minutes after contacting him detailing the horn and exhibiting the condition. Shipping from Vietnam to the US east coast took 3 days and the packaging was impeccable. The horn arrived exactly as described and plays just as well as it should; James did an excellent job replacing pads and adjusting. There are no visible or audible leaks. I would purchase from him again in a heartbeat."}&rdquo;
                </blockquote>
                <div className="font-semibold text-secondary">— {reviews.find(r => r.id === '2')?.buyerName || 'Zach E.'}</div>
              </div>
            </div>

            <div className="animate-fade-in-right flex flex-col">
              <h3 className="text-2xl md:text-3xl font-bold text-secondary mb-6">More Customer Reviews</h3>
              <div className="space-y-4">
                {reviews.slice(currentReviewIndex, currentReviewIndex + 4).map((review) => (
                  <div key={review.id} className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${i < review.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-gray-200 text-gray-200'
                            }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      &ldquo;{review.message || 'Great experience!'}&rdquo;
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-secondary">{review.buyerName}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-6">
                {(() => {
                  const reviewsPerPage = 4
                  const totalPages = Math.ceil(reviews.length / reviewsPerPage)
                  const currentPage = Math.floor(currentReviewIndex / reviewsPerPage) + 1

                  const getPageNumbers = () => {
                    const pages: number[] = []
                    const maxPages = 5

                    if (totalPages <= maxPages) {
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i)
                      }
                    } else {
                      let start = Math.max(1, currentPage - 2)
                      let end = Math.min(totalPages, currentPage + 2)

                      if (end - start < 4) {
                        if (start === 1) {
                          end = Math.min(totalPages, start + 4)
                        } else if (end === totalPages) {
                          start = Math.max(1, end - 4)
                        }
                      }

                      for (let i = start; i <= end; i++) {
                        pages.push(i)
                      }
                    }

                    return pages
                  }

                  const pageNumbers = getPageNumbers()
                  const canGoPrev = currentPage > 1
                  const canGoNext = currentPage < totalPages

                  return (
                    <div className="reviews-pagination pt-4 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        className="reviews-pagination-button h-8 px-3"
                        onClick={() => setCurrentReviewIndex(Math.max(0, currentReviewIndex - reviewsPerPage))}
                        disabled={!canGoPrev}
                      >
                        <ChevronLeft className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Prev</span>
                      </Button>

                      {pageNumbers.map((page) => {
                        const isActive = currentPage === page
                        return (
                          <Button
                            key={page}
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            className={`reviews-pagination-button h-8 min-w-[32px] px-3 ${isActive
                              ? 'bg-primary text-white hover:bg-primary/90'
                              : 'hover:bg-primary/5 hover:border-primary/30'
                              } transition-all`}
                            onClick={() => setCurrentReviewIndex((page - 1) * reviewsPerPage)}
                          >
                            {page}
                          </Button>
                        )
                      })}

                      <Button
                        variant="outline"
                        size="sm"
                        className="reviews-pagination-button h-8 px-3"
                        onClick={() => setCurrentReviewIndex(Math.min(reviews.length - reviewsPerPage, currentReviewIndex + reviewsPerPage))}
                        disabled={!canGoNext}
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="h-4 w-4 sm:ml-1" />
                      </Button>
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Our Musical Community */}
      <section className="bg-gradient-to-r from-primary to-primary/80 py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2 justify-center md:justify-start">
                <Sparkles className="h-6 w-6" />
                Join Our Musical Community
              </h3>
              <p className="text-white/80 mt-1">Get exclusive deals, tips, and industry news</p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const email = formData.get('email')
                if (email) {
                  // Handle subscription
                  alert('Thank you for subscribing!')
                  e.currentTarget.reset()
                }
              }}
              className="flex gap-2 w-full md:w-auto"
            >
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="bg-white/20 border-2 border-white/30 placeholder:text-white/60 text-white min-w-[250px] px-4 py-2 rounded-md transition-all duration-300 focus:bg-white/30 focus:outline-none focus:border-white/50 focus:shadow-[0_0_0_4px_rgba(212,175,55,0.3)] hover:border-white/40"
                required
              />
              <Button
                type="submit"
                className="bg-secondary hover:bg-secondary/90 hover:scale-105 text-white px-6 transition-all duration-300 hover:shadow-xl btn-ripple relative overflow-hidden"
              >
                <span className="flex items-center gap-2 relative z-10">
                  Subscribe <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
