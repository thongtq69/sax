'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product/ProductCard'
import { getProducts, getCategories, transformProduct, transformCategory } from '@/lib/api'
import type { Product } from '@/lib/data'
import { ChevronRight, ChevronLeft, Star, Sparkles } from 'lucide-react'
import { getAllReviewsAsync, type Review } from '@/lib/reviews'
import { ScrollAnimations } from '@/components/site/ScrollAnimations'
import { TestimonialsPopup } from '@/components/site/TestimonialsPopup'

const getReviewExcerpt = (message: string, maxLength = 160) => {
  if (message.length <= maxLength) return message
  const trimmed = message.slice(0, maxLength)
  const lastSpace = trimmed.lastIndexOf(' ')
  const safeCut = lastSpace > 0 ? trimmed.slice(0, lastSpace) : trimmed
  return `${safeCut.trim()}...`
}

interface ReviewsCarouselProps {
  reviews: Review[]
  productImages?: string[]
  onViewAll?: () => void
}

function ReviewsCarousel({ reviews, productImages = [], onViewAll }: ReviewsCarouselProps) {
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
      }, 200)
    }, 5000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [reviewsLength, isPaused])

  if (reviewsLength === 0) return null
  const currentReview = reviews[currentIndex]

  return (
    <div className="relative" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <div className={`bg-white/85 backdrop-blur-md px-8 sm:px-10 md:px-12 py-6 sm:py-8 pb-10 sm:pb-12 shadow-xl border border-white/50 rounded-xl w-full transition-all duration-300 ease-out relative ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
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
        {/* View All Reviews - positioned at bottom right of card */}
        {onViewAll && (
          <button
            className="absolute bottom-3 right-4 sm:bottom-4 sm:right-6 text-secondary hover:text-primary font-medium text-[10px] sm:text-xs underline transition-all flex items-center gap-0.5"
            onClick={onViewAll}
          >
            View All Reviews
            <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

interface NewArrivalsCarouselProps {
  products: Product[]
  id: string
  autoRotate?: boolean // Enable/disable auto rotation
}

// Static grid for displaying products with manual navigation (for NEW ARRIVALS & FEATURED INSTRUMENTS)
function StaticProductGrid({ products, id }: { products: Product[], id: string }) {
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

  // Calculate grid columns based on product count
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

  return (
    <div className="relative">
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

function NewArrivalsCarousel({ products, id, autoRotate = true }: NewArrivalsCarouselProps) {
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

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [saleProducts, setSaleProducts] = useState<Product[]>([])
  const [onSaleProducts, setOnSaleProducts] = useState<Product[]>([])
  const [professionalFlutesProducts, setProfessionalFlutesProducts] = useState<Product[]>([])
  const [saxophonesProducts, setSaxophonesProducts] = useState<Product[]>([])
  const [studentInstrumentsProducts, setStudentInstrumentsProducts] = useState<Product[]>([])
  const [collectionTitles, setCollectionTitles] = useState<Record<string, string>>({
    'new-arrivals': 'NEW ARRIVALS',
    'featured-instruments': 'FEATURED INSTRUMENTS',
    'on-sale': 'ON SALE',
    'professional-flutes': 'PROFESSIONAL FLUTES',
    'saxophones': 'SAXOPHONES',
    'student-instruments': 'STUDENT INSTRUMENTS',
  })
  const [collectionBackgrounds, setCollectionBackgrounds] = useState<Record<string, string>>({})
  const [heroBackgroundImage, setHeroBackgroundImage] = useState('/homepage3.png')
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showTestimonials, setShowTestimonials] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])

  // Fetch reviews from API
  useEffect(() => {
    getAllReviewsAsync().then(setReviews)
  }, [])

  // Fetch hero background image from admin settings
  useEffect(() => {
    async function fetchHeroContent() {
      try {
        const response = await fetch('/api/admin/homepage-content/hero')
        if (response.ok) {
          const data = await response.json()
          if (data.image) {
            setHeroBackgroundImage(data.image)
          }
        }
      } catch (error) {
        console.log('Using default hero background')
      }
    }
    fetchHeroContent()
  }, [])

  useEffect(() => {
    async function fetchData() {
      try {
        // Try to fetch from featured collections first
        let newArrivalsProducts: Product[] = []
        let featuredInstrumentsProducts: Product[] = []
        let onSale: Product[] = []
        let professionalFlutes: Product[] = []
        let saxophones: Product[] = []
        let studentInstruments: Product[] = []
        const titles: Record<string, string> = { ...collectionTitles }
        const backgrounds: Record<string, string> = {}

        try {
          const [newArrivalsRes, featuredRes, onSaleRes, flutesRes, saxRes, studentRes] = await Promise.all([
            fetch('/api/admin/featured-collections/new-arrivals'),
            fetch('/api/admin/featured-collections/featured-instruments'),
            fetch('/api/admin/featured-collections/on-sale'),
            fetch('/api/admin/featured-collections/professional-flutes'),
            fetch('/api/admin/featured-collections/saxophones'),
            fetch('/api/admin/featured-collections/student-instruments'),
          ])

          if (newArrivalsRes.ok) {
            const newArrivalsData = await newArrivalsRes.json()
            if (newArrivalsData.name) titles['new-arrivals'] = newArrivalsData.name.toUpperCase()
            if (newArrivalsData.backgroundImage) backgrounds['new-arrivals'] = newArrivalsData.backgroundImage
            if (newArrivalsData.products && newArrivalsData.products.length > 0) {
              newArrivalsProducts = newArrivalsData.products.map(transformProduct)
            }
          }

          if (featuredRes.ok) {
            const featuredData = await featuredRes.json()
            if (featuredData.name) titles['featured-instruments'] = featuredData.name.toUpperCase()
            if (featuredData.backgroundImage) backgrounds['featured-instruments'] = featuredData.backgroundImage
            if (featuredData.products && featuredData.products.length > 0) {
              featuredInstrumentsProducts = featuredData.products.map(transformProduct)
            }
          }

          if (onSaleRes.ok) {
            const onSaleData = await onSaleRes.json()
            if (onSaleData.name) titles['on-sale'] = onSaleData.name.toUpperCase()
            if (onSaleData.backgroundImage) backgrounds['on-sale'] = onSaleData.backgroundImage
            if (onSaleData.products && onSaleData.products.length > 0) {
              onSale = onSaleData.products.map(transformProduct)
            }
          }

          if (flutesRes.ok) {
            const flutesData = await flutesRes.json()
            if (flutesData.name) titles['professional-flutes'] = flutesData.name.toUpperCase()
            if (flutesData.backgroundImage) backgrounds['professional-flutes'] = flutesData.backgroundImage
            if (flutesData.products && flutesData.products.length > 0) {
              professionalFlutes = flutesData.products.map(transformProduct)
            }
          }

          if (saxRes.ok) {
            const saxData = await saxRes.json()
            if (saxData.name) titles['saxophones'] = saxData.name.toUpperCase()
            if (saxData.backgroundImage) backgrounds['saxophones'] = saxData.backgroundImage
            if (saxData.products && saxData.products.length > 0) {
              saxophones = saxData.products.map(transformProduct)
            }
          }

          if (studentRes.ok) {
            const studentData = await studentRes.json()
            if (studentData.name) titles['student-instruments'] = studentData.name.toUpperCase()
            if (studentData.backgroundImage) backgrounds['student-instruments'] = studentData.backgroundImage
            if (studentData.products && studentData.products.length > 0) {
              studentInstruments = studentData.products.map(transformProduct)
            }
          }

          setCollectionTitles(titles)
          setCollectionBackgrounds(backgrounds)
        } catch (error) {
          console.log('Featured collections not found, using fallback')
        }

        // Only show products from admin collections (no fallback)
        setFeaturedProducts(featuredInstrumentsProducts)
        setSaleProducts(newArrivalsProducts)
        setOnSaleProducts(onSale)
        setProfessionalFlutesProducts(professionalFlutes)
        setSaxophonesProducts(saxophones)
        setStudentInstrumentsProducts(studentInstruments)

        const allResponse = await getProducts({ limit: 28 })
        const all = allResponse.products.map(transformProduct)
        setAllProducts(all)

        const categoriesData = await getCategories()
        const transformedCategories = categoriesData.map(transformCategory)
        setCategories(transformedCategories)
        setIsLoading(false)

        const allSubcategories: any[] = []
        transformedCategories.forEach(cat => {
          if (cat.subcategories) {
            cat.subcategories.forEach((sub: any) => {
              allSubcategories.push({ ...sub, categoryName: cat.name, categorySlug: cat.slug })
            })
          }
        })

        Promise.all([
          Promise.all(allSubcategories.map(async (sub) => {
            try {
              const response = await fetch(`/api/products/count?subcategory=${sub.slug}&inStock=true`)
              if (!response.ok) return { slug: sub.slug, count: 0 }
              const data = await response.json()
              return { slug: sub.slug, count: data.count || 0 }
            } catch (error) {
              return { slug: sub.slug, count: 0 }
            }
          })),
          Promise.all(transformedCategories.map(async (cat) => {
            try {
              const response = await fetch(`/api/products/count?category=${cat.slug}&inStock=true`)
              if (!response.ok) return { slug: cat.slug, count: 0 }
              const data = await response.json()
              return { slug: cat.slug, count: data.count || 0 }
            } catch (error) {
              return { slug: cat.slug, count: 0 }
            }
          }))
        ]).then(([subcategoryCountResults, categoryCountResults]) => {
          const subcategoryCounts: Record<string, number> = {}
          subcategoryCountResults.forEach(result => {
            subcategoryCounts[result.slug] = result.count
          })
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
      <section className="homepage-hero relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src={heroBackgroundImage} alt="Saxophones Background" fill className="object-cover" priority />
        </div>
        <div className="relative min-h-[280px] md:min-h-[350px] lg:min-h-[420px]">
          <div className="container mx-auto flex min-h-[280px] md:min-h-[350px] lg:min-h-[420px] items-center justify-center px-4 py-8 md:py-12">
            <div className="text-center space-y-4 md:space-y-6">
              <div className="hero-title flex justify-center">
                <Image src="/jsc-logo-transparent.svg" alt="James Sax Corner" width={760} height={220} className="h-[70px] md:h-[90px] lg:h-[110px] w-auto drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]" priority />
              </div>
              <p className="hero-cta text-base md:text-lg lg:text-xl leading-relaxed text-white max-w-3xl mx-auto font-body drop-shadow-lg">
                Premium Japanese saxophones, expertly maintained for peak performance. Trusted by musicians worldwide, backed by outstanding reviews. Unmatched customer service—your satisfaction comes first! Buy with confidence.
              </p>
              <div className="hero-cta flex justify-center pt-2">
                <Button size="lg" variant="outline" className="border-2 border-white bg-white text-black hover:bg-white/90 hover:text-secondary hover:scale-105 group transition-all duration-300 font-body text-base md:text-lg px-6 md:px-8" asChild>
                  <Link href="/shop" className="flex items-center">
                    Buy with confidence!
                    <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-4">
              <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white/60 to-white/60" />
              <div className="flex items-center gap-2">
                <span className="text-white/80 text-2xl">♪</span>
                <span className="text-white/80 text-xl">♫</span>
                <span className="text-white/80 text-2xl">♪</span>
              </div>
              <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-white/60 to-white/60" />
            </div>
          </div>
        </div>
        <div className="relative py-8 sm:py-10 md:py-12">
          <div className="container mx-auto px-4">
            <div className="mb-4 sm:mb-6 text-center animate-fade-in-up">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/90 text-amber-700 text-[10px] sm:text-xs font-medium mb-3 rounded-full shadow-md backdrop-blur-sm">
                <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-amber-400 text-amber-400" />
                Trusted by Musicians Worldwide
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3 drop-shadow-lg">What Our Customers Say</h2>
            </div>
            <ReviewsCarousel reviews={reviews} productImages={allProducts.slice(0, 10).map(p => p.images[0])} onViewAll={() => setShowTestimonials(true)} />
          </div>
        </div>
      </section>


      {saleProducts.length > 0 && (
        <section className="relative overflow-hidden" style={collectionBackgrounds['new-arrivals'] ? { backgroundImage: `url(${collectionBackgrounds['new-arrivals']})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
          {collectionBackgrounds['new-arrivals'] && <div className="absolute inset-0 bg-white/5" />}
          <div className="relative">
            <div className="container mx-auto px-4 py-3 sm:py-4">
              <div className="flex items-center justify-center gap-3">
                <div className="flex-1 h-px bg-primary/30" />
                <span className="text-2xl sm:text-3xl text-primary">♪</span>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-secondary tracking-wide uppercase">{collectionTitles['new-arrivals']}</h2>
                <span className="text-2xl sm:text-3xl text-primary">♪</span>
                <div className="flex-1 h-px bg-primary/30" />
              </div>
              <div className="text-center mt-2">
                <Link href="/shop?badge=coming-soon" className="text-xs sm:text-sm text-primary hover:text-secondary transition-colors inline-flex items-center gap-1">
                  View All <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Link>
              </div>
            </div>
            <div className="container mx-auto px-4 pb-4 sm:pb-6">
              <StaticProductGrid products={saleProducts} id="new-arrivals" />
            </div>
          </div>
        </section>
      )}

      {featuredProducts.length > 0 && (
        <section className="relative overflow-hidden" style={collectionBackgrounds['featured-instruments'] ? { backgroundImage: `url(${collectionBackgrounds['featured-instruments']})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
          {collectionBackgrounds['featured-instruments'] && <div className="absolute inset-0 bg-white/5" />}
          <div className="relative">
            <div className="container mx-auto px-4 py-3 sm:py-4">
              <div className="flex items-center justify-center gap-3">
                <div className="flex-1 h-px bg-primary/30" />
                <span className="text-2xl sm:text-3xl text-primary">♫</span>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-secondary tracking-wide uppercase">{collectionTitles['featured-instruments']}</h2>
                <span className="text-2xl sm:text-3xl text-primary">♫</span>
                <div className="flex-1 h-px bg-primary/30" />
              </div>
              <div className="text-center mt-2">
                <Link href="/shop?badge=new" className="text-xs sm:text-sm text-primary hover:text-secondary transition-colors inline-flex items-center gap-1">
                  View All <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Link>
              </div>
            </div>
            <div className="container mx-auto px-4 pb-4 sm:pb-6">
              <StaticProductGrid products={featuredProducts} id="featured" />
            </div>
          </div>
        </section>
      )}

      {/* On Sale Section */}
      {onSaleProducts.length > 0 && (
        <section className="relative overflow-hidden" style={collectionBackgrounds['on-sale'] ? { backgroundImage: `url(${collectionBackgrounds['on-sale']})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
          {collectionBackgrounds['on-sale'] ? <div className="absolute inset-0 bg-white/5" /> : <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 via-white to-amber-50/30" />}
          <div className="relative">
            <div className="container mx-auto px-4 py-3 sm:py-4">
              <div className="flex items-center justify-center gap-3">
                <div className="flex-1 h-px bg-red-400/30" />
                <span className="text-2xl sm:text-3xl text-red-500">🔥</span>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-secondary tracking-wide uppercase">{collectionTitles['on-sale']}</h2>
                <span className="text-2xl sm:text-3xl text-red-500">🔥</span>
                <div className="flex-1 h-px bg-red-400/30" />
              </div>
              <div className="text-center mt-2">
                <Link href="/shop?badge=sale" className="text-xs sm:text-sm text-primary hover:text-secondary transition-colors inline-flex items-center gap-1">
                  View All <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Link>
              </div>
            </div>
            <div className="container mx-auto px-4 pb-4 sm:pb-6">
              <StaticProductGrid products={onSaleProducts} id="on-sale" />
            </div>
          </div>
        </section>
      )}

      {/* Professional Flutes Section */}
      {professionalFlutesProducts.length > 0 && (
        <section className="relative overflow-hidden" style={collectionBackgrounds['professional-flutes'] ? { backgroundImage: `url(${collectionBackgrounds['professional-flutes']})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
          {collectionBackgrounds['professional-flutes'] && <div className="absolute inset-0 bg-white/5" />}
          <div className="relative">
            <div className="container mx-auto px-4 py-3 sm:py-4">
              <div className="flex items-center justify-center gap-3">
                <div className="flex-1 h-px bg-primary/30" />
                <span className="text-2xl sm:text-3xl text-primary">🎵</span>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-secondary tracking-wide uppercase">{collectionTitles['professional-flutes']}</h2>
                <span className="text-2xl sm:text-3xl text-primary">🎵</span>
                <div className="flex-1 h-px bg-primary/30" />
              </div>
              <div className="text-center mt-2">
                <Link href="/shop?subcategory=flutes" className="text-xs sm:text-sm text-primary hover:text-secondary transition-colors inline-flex items-center gap-1">
                  View All <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Link>
              </div>
            </div>
            <div className="container mx-auto px-4 pb-4 sm:pb-6">
              <StaticProductGrid products={professionalFlutesProducts} id="professional-flutes" />
            </div>
          </div>
        </section>
      )}

      {/* Saxophones Section */}
      {saxophonesProducts.length > 0 && (
        <section className="relative overflow-hidden" style={collectionBackgrounds['saxophones'] ? { backgroundImage: `url(${collectionBackgrounds['saxophones']})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
          {collectionBackgrounds['saxophones'] ? <div className="absolute inset-0 bg-white/5" /> : <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 via-white to-blue-50/30" />}
          <div className="relative">
            <div className="container mx-auto px-4 py-3 sm:py-4">
              <div className="flex items-center justify-center gap-3">
                <div className="flex-1 h-px bg-primary/30" />
                <span className="text-2xl sm:text-3xl text-primary">🎷</span>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-secondary tracking-wide uppercase">{collectionTitles['saxophones']}</h2>
                <span className="text-2xl sm:text-3xl text-primary">🎷</span>
                <div className="flex-1 h-px bg-primary/30" />
              </div>
              <div className="text-center mt-2">
                <Link href="/shop?category=saxophones" className="text-xs sm:text-sm text-primary hover:text-secondary transition-colors inline-flex items-center gap-1">
                  View All <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Link>
              </div>
            </div>
            <div className="container mx-auto px-4 pb-4 sm:pb-6">
              <StaticProductGrid products={saxophonesProducts} id="saxophones" />
            </div>
          </div>
        </section>
      )}

      {/* Student Instruments Section */}
      {studentInstrumentsProducts.length > 0 && (
        <section className="relative overflow-hidden" style={collectionBackgrounds['student-instruments'] ? { backgroundImage: `url(${collectionBackgrounds['student-instruments']})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
          {collectionBackgrounds['student-instruments'] && <div className="absolute inset-0 bg-white/5" />}
          <div className="relative">
            <div className="container mx-auto px-4 py-3 sm:py-4">
              <div className="flex items-center justify-center gap-3">
                <div className="flex-1 h-px bg-primary/30" />
                <span className="text-2xl sm:text-3xl text-primary">📚</span>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-secondary tracking-wide uppercase">{collectionTitles['student-instruments']}</h2>
                <span className="text-2xl sm:text-3xl text-primary">📚</span>
                <div className="flex-1 h-px bg-primary/30" />
              </div>
              <div className="text-center mt-2">
                <Link href="/shop?productType=student" className="text-xs sm:text-sm text-primary hover:text-secondary transition-colors inline-flex items-center gap-1">
                  View All <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Link>
              </div>
            </div>
            <div className="container mx-auto px-4 pb-4 sm:pb-6">
              <StaticProductGrid products={studentInstrumentsProducts} id="student-instruments" />
            </div>
          </div>
        </section>
      )}

      <section className="bg-gradient-to-br from-amber-50/50 via-white to-blue-50/50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-center gap-3">
            <div className="flex-1 h-px bg-primary/30" />
            <span className="text-2xl sm:text-3xl text-primary">♬</span>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-secondary tracking-wide uppercase">SHOP BY CATEGORY</h2>
            <span className="text-2xl sm:text-3xl text-primary">♬</span>
            <div className="flex-1 h-px bg-primary/30" />
          </div>
          <div className="text-center mt-2">
            <Link href="/shop" className="text-xs sm:text-sm text-primary hover:text-secondary transition-colors inline-flex items-center gap-1">
              View All <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Link>
          </div>
        </div>
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 w-full">
            {subcategories.map((sub, i) => {
              const displayName = sub.name.replace(/\s+Saxophones?/gi, '')
              const musicNotes = ['♪', '♫', '♬', '𝄞']
              const noteIcon = musicNotes[i % musicNotes.length]
              return (
                <Link key={sub.slug} href={`/shop?subcategory=${sub.slug}`} className="group bg-secondary hover:bg-secondary/90 rounded-lg p-4 sm:p-5 transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: `${0.1 * i}s` }}>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-amber-400 text-2xl sm:text-3xl group-hover:animate-bounce transition-transform duration-300">{noteIcon}</span>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-white group-hover:text-amber-300 transition-colors duration-300">{displayName}</h3>
                  </div>
                </Link>
              )
            })}
            {!subcategories.find(s => s.slug.includes('baritone') || s.name.toLowerCase().includes('baritone')) && (
              <Link href="/shop?subcategory=baritone-saxophones" className="group bg-secondary hover:bg-secondary/90 rounded-lg p-4 sm:p-5 transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: `${0.1 * subcategories.length}s` }}>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-amber-400 text-2xl sm:text-3xl group-hover:animate-bounce transition-transform duration-300">𝄞</span>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-white group-hover:text-amber-300 transition-colors duration-300">Baritone</h3>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      <section id="reviews" className="bg-gradient-to-br from-amber-50/30 via-white to-blue-50/30 py-4 sm:py-5 md:py-6">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-stretch">
            <div className="animate-fade-in-left">
              <h2 className="text-xl sm:text-2xl font-bold text-secondary mb-3 uppercase tracking-wide">WHY CHOOSE US</h2>
              <div className="space-y-1">
                {[
                  { title: 'Saxophone Specialists', desc: 'We focus exclusively on saxophones, allowing us to maintain high standards in selection and preparation.' },
                  { title: 'Individually Prepared', desc: 'Each instrument is inspected and adjusted before sale to ensure reliable playability.' },
                  { title: 'Honest & Clear Listings', desc: 'Every saxophone is listed as a unique instrument with accurate descriptions.' },
                  { title: 'Secure Purchasing', desc: 'All payments are processed through PayPal with full buyer protection.' },
                  { title: 'Trusted Worldwide', desc: 'Serving players from different countries and musical backgrounds.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 py-2 px-3 bg-white border border-transparent hover:border-primary/30 transition-all duration-500 hover:shadow-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 flex items-center justify-center rounded">
                      <Star className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-secondary text-base leading-tight">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-snug">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="animate-fade-in-right flex flex-col">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 sm:p-5 h-full flex flex-col justify-center">
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-xs sm:text-sm italic text-secondary mb-2 leading-relaxed text-center">
                  &ldquo;This was the single best transaction I&apos;ve had with an online seller. James sent me a 10 minute video minutes after contacting him detailing the horn and exhibiting the condition. Shipping from Vietnam to the US east coast took 3 days and the packaging was impeccable. The horn arrived exactly as described and plays just as well as it should; James did an excellent job replacing pads and adjusting. There are no visible or audible leaks. I would purchase from him again in a heartbeat.&rdquo;
                </blockquote>
                <div className="font-semibold text-secondary text-sm text-center">— Zach E.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="hidden lg:block bg-gradient-to-r from-primary to-primary/80 py-2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold text-white flex items-center gap-1.5 whitespace-nowrap">
              <Sparkles className="h-4 w-4" />
              Join Our Musical Community
            </span>
            <form onSubmit={(e) => { e.preventDefault(); const formData = new FormData(e.currentTarget); const email = formData.get('email'); if (email) { alert('Thank you for subscribing!'); e.currentTarget.reset(); } }} className="flex gap-2 flex-1 max-w-md">
              <input type="email" name="email" placeholder="Enter your email" className="bg-white/20 border border-white/30 placeholder:text-white/60 text-white min-w-0 flex-1 px-4 py-1.5 rounded text-sm h-9" required />
              <Button type="submit" size="sm" className="bg-secondary hover:bg-secondary/90 text-white px-4 text-sm h-9">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </section>

      <TestimonialsPopup isOpen={showTestimonials} onClose={() => setShowTestimonials(false)} />
    </div>
  )
}
