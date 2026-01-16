'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Product } from '@/lib/data'
import { getProducts, transformProduct, getProductUrl } from '@/lib/api'
import { getAllReviewsAsync, getProductRatingStats, type Review } from '@/lib/reviews'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ProductCard } from './ProductCard'
import { useCartStore } from '@/lib/store/cart'
import { SmartImage } from '@/components/ui/smart-image'
import { InquiryFormContent } from '@/components/inquiry/InquiryFormContent'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Star, ChevronRight, ChevronLeft, Heart, Share2, Check, X, ZoomIn, Loader2, MessageCircle, Truck, Calculator, MapPin } from 'lucide-react'
import { ConditionTooltip } from './ConditionTooltip'
import { ConditionRating } from '@/lib/product-conditions'

interface ProductDetailClientProps {
  product: Product
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showVideo, setShowVideo] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isWishlistLoading, setIsWishlistLoading] = useState(false)
  const [isAddedToCart, setIsAddedToCart] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [navigationProducts, setNavigationProducts] = useState<{ prev: Product | null, next: Product | null }>({ prev: null, next: null })
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [isInquiryOpen, setIsInquiryOpen] = useState(false)
  const [quickFaqs, setQuickFaqs] = useState<{ id: string, question: string, answer: string, category: string, isActive: boolean }[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [showShippingCalc, setShowShippingCalc] = useState(false)
  const [shippingCountry, setShippingCountry] = useState('')
  const [shippingCost, setShippingCost] = useState<number | null>(null)
  const [shippingMessage, setShippingMessage] = useState('')
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [userAddress, setUserAddress] = useState<{ country: string; zip: string } | null>(null)
  const router = useRouter()
  const { data: session, status } = useSession()
  const addItem = useCartStore((state) => state.addItem)
  const clearCart = useCartStore((state) => state.clearCart)

  // Check if product is sold out
  const isSoldOut = !product.inStock || (product as any).stockStatus === 'sold-out' || (product as any).stock === 0

  // Fetch user's default address and auto-calculate shipping
  useEffect(() => {
    const fetchUserAddress = async () => {
      console.log('Session status:', status, 'User:', session?.user) // Debug

      // Wait for session to be loaded
      if (status === 'loading') return

      if (session?.user?.id) {
        try {
          console.log('Fetching address for user:', session.user.id) // Debug
          const res = await fetch('/api/user/address')
          const data = await res.json()
          console.log('User address data:', data) // Debug log
          if (data.success && data.addresses && data.addresses.length > 0) {
            const defaultAddr = data.addresses.find((a: any) => a.isDefault) || data.addresses[0]
            if (defaultAddr) {
              console.log('Using address:', defaultAddr.country) // Debug log
              setUserAddress({ country: defaultAddr.country, zip: defaultAddr.zip })
              setShippingCountry(defaultAddr.country)
              // Auto-calculate shipping
              autoCalculateShipping(defaultAddr.country, defaultAddr.zip)
            }
          }
        } catch (error) {
          console.error('Error fetching user address:', error)
        }
      } else {
        console.log('No user id in session') // Debug
      }
    }
    fetchUserAddress()
  }, [session?.user?.id, status, product.id])

  const autoCalculateShipping = async (country: string, zip: string) => {
    setIsCalculatingShipping(true)
    try {
      // Get country code
      const countryMap: Record<string, string> = {
        'Vietnam': 'VN', 'United States': 'US', 'Canada': 'CA', 'United Kingdom': 'GB',
        'Australia': 'AU', 'Germany': 'DE', 'France': 'FR', 'Japan': 'JP',
        'South Korea': 'KR', 'Singapore': 'SG', 'Thailand': 'TH', 'Malaysia': 'MY',
        'Indonesia': 'ID', 'Philippines': 'PH', 'China': 'CN', 'Taiwan': 'TW',
        'Hong Kong': 'HK', 'India': 'IN'
      }
      const countryCode = countryMap[country] || country

      const response = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode,
          items: [{ productId: product.id, quantity: 1, shippingCost: product.shippingCost ?? null }]
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setShippingCost(data.shippingCost)
        if (data.shippingCost === 0) {
          setShippingMessage(`Free shipping to ${country}`)
        } else {
          setShippingMessage(`Shipping to ${country}: $${data.shippingCost}`)
        }
      } else {
        // Fallback
        const isVietnam = country === 'Vietnam'
        setShippingCost(isVietnam ? 25 : 200)
        setShippingMessage(isVietnam ? 'Domestic shipping: $25' : 'International shipping: $200')
      }
    } catch {
      const isVietnam = country === 'Vietnam'
      setShippingCost(isVietnam ? 25 : 200)
      setShippingMessage(isVietnam ? 'Domestic shipping: $25' : 'International shipping: $200')
    } finally {
      setIsCalculatingShipping(false)
    }
  }

  // Fetch wishlist status when user is logged in
  useEffect(() => {
    const checkWishlist = async () => {
      if (session?.user?.id && product.id) {
        try {
          const res = await fetch(`/api/wishlist/${product.id}`)
          if (res.ok) {
            const data = await res.json()
            setIsWishlisted(data.inWishlist)
          }
        } catch (error) {
          console.error('Error checking wishlist:', error)
        }
      }
    }
    checkWishlist()
  }, [session?.user?.id, product.id])

  // Toggle wishlist
  const handleToggleWishlist = async () => {
    if (!session?.user?.id) {
      // Redirect to login if not logged in
      router.push('/auth/login?callbackUrl=' + encodeURIComponent(window.location.pathname))
      return
    }

    setIsWishlistLoading(true)
    try {
      if (isWishlisted) {
        // Remove from wishlist
        const res = await fetch(`/api/wishlist/${product.id}`, { method: 'DELETE' })
        if (res.ok) {
          setIsWishlisted(false)
        }
      } else {
        // Add to wishlist
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id })
        })
        if (res.ok) {
          setIsWishlisted(true)
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error)
    } finally {
      setIsWishlistLoading(false)
    }
  }

  // Fetch reviews from API on mount
  useEffect(() => {
    getAllReviewsAsync().then(setReviews)
  }, [])

  const reviewStats = useMemo(() => getProductRatingStats(product.name), [product.name])

  const calculateShipping = async () => {
    if (!shippingCountry) {
      setShippingMessage('Please select a country')
      return
    }

    setIsCalculatingShipping(true)
    await autoCalculateShipping(shippingCountry, '')
  }
  const displayRating = useMemo(() =>
    reviews.length > 0 ? reviewStats.rating : product.rating || 0,
    [reviews.length, reviewStats.rating, product.rating]
  )
  const displayReviewCount = useMemo(() =>
    reviews.length > 0 ? reviewStats.reviewCount : product.reviewCount || 0,
    [reviews.length, reviewStats.reviewCount, product.reviewCount]
  )

  // Show first 35 reviews by default, or all if showAllReviews is true
  const INITIAL_REVIEWS_COUNT = 35
  const displayedReviews = useMemo(() =>
    showAllReviews ? reviews : reviews.slice(0, INITIAL_REVIEWS_COUNT),
    [showAllReviews, reviews]
  )
  const hasMoreReviews = useMemo(() => reviews.length > INITIAL_REVIEWS_COUNT, [reviews.length])

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    if (!url) return null
    // Handle various YouTube URL formats
    let videoId = null
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0]
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0]
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0]
    } else if (url.includes('youtube.com/shorts/')) {
      videoId = url.split('shorts/')[1]?.split('?')[0]
    }
    return videoId
  }

  // Support multiple videos - get array of video IDs
  const videoUrls = (product as any).videoUrls || ((product as any).videoUrl ? [(product as any).videoUrl] : [])
  const videoIds = videoUrls.map((url: string) => getYouTubeVideoId(url)).filter(Boolean) as string[]
  const hasVideos = videoIds.length > 0

  // For backward compatibility
  const videoId = videoIds[0] || null

  // Track which video is currently playing (0-based index into videoIds array)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)

  // Lightbox navigation
  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setIsLightboxOpen(true)
    document.body.style.overflow = 'hidden'
  }

  // Open lightbox with video
  const openVideoLightbox = (videoIdx: number = 0) => {
    if (videoIds[videoIdx]) {
      setCurrentVideoIndex(videoIdx)
      setLightboxIndex(-1 - videoIdx) // -1 for first video, -2 for second, etc.
      setIsLightboxOpen(true)
      document.body.style.overflow = 'hidden'
    }
  }

  const closeLightbox = () => {
    setIsLightboxOpen(false)
    setShowVideo(false)
    document.body.style.overflow = 'auto'
  }

  // Video indices are negative: -1 for first video, -2 for second, etc.
  // Images start from 0
  const isVideoIndex = (idx: number) => idx < 0 && idx >= -videoIds.length
  const getVideoIndexFromLightbox = (idx: number) => Math.abs(idx) - 1

  const goToPrevious = useCallback(() => {
    setLightboxIndex((prev) => {
      if (isVideoIndex(prev)) {
        const videoIdx = getVideoIndexFromLightbox(prev)
        if (videoIdx > 0) {
          // Go to previous video
          return -(videoIdx) // -1 becomes 0, so we need -(videoIdx)
        } else {
          // At first video, go to last image
          return product.images.length - 1
        }
      } else if (prev === 0 && hasVideos) {
        // At first image, go to last video
        return -videoIds.length
      } else {
        // Go to previous image
        return prev - 1
      }
    })
  }, [product.images.length, hasVideos, videoIds.length])

  const goToNext = useCallback(() => {
    setLightboxIndex((prev) => {
      if (isVideoIndex(prev)) {
        const videoIdx = getVideoIndexFromLightbox(prev)
        if (videoIdx < videoIds.length - 1) {
          // Go to next video
          return -(videoIdx + 2)
        } else {
          // At last video, go to first image
          return 0
        }
      } else if (prev === product.images.length - 1 && hasVideos) {
        // At last image, go to first video
        return -1
      } else {
        // Go to next image
        return prev + 1
      }
    })
  }, [product.images.length, hasVideos, videoIds.length])

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') goToPrevious()
      if (e.key === 'ArrowRight') goToNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLightboxOpen, goToPrevious, goToNext])

  // Set loaded immediately - no delay needed
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Default Quick FAQ (fallback)
  const defaultQuickFaqs = [
    {
      id: '1',
      question: 'Is this a beginner saxophone?',
      answer: 'No. We sell professional models only, intended for serious students and working musicians.',
      category: 'Product',
      isActive: true
    },
    {
      id: '2',
      question: 'Is this instrument ready to ship?',
      answer: 'Yes. All listed saxophones are fully prepared and ready for immediate shipment.',
      category: 'Shipping',
      isActive: true
    },
    {
      id: '3',
      question: 'How long does delivery to the U.S. take?',
      answer: 'We use FedEx, DHL, or UPS express international shipping, with delivery typically in 3–4 business days.',
      category: 'Shipping',
      isActive: true
    },
    {
      id: '4',
      question: 'Is payment secure?',
      answer: 'Yes. All payments are processed via PayPal with full buyer protection.',
      category: 'Payment',
      isActive: true
    },
    {
      id: '5',
      question: 'Can I ask questions before buying?',
      answer: 'Absolutely. We encourage you to contact us before purchase for detailed guidance.',
      category: 'Support',
      isActive: true
    }
  ]

  // Fetch Quick FAQ from API
  useEffect(() => {
    const fetchQuickFaqs = async () => {
      try {
        const response = await fetch('/api/admin/quick-faq')
        if (response.ok) {
          const data = await response.json()
          if (data && data.length > 0) {
            setQuickFaqs(data.filter((faq: any) => faq.isActive))
          } else {
            setQuickFaqs(defaultQuickFaqs)
          }
        } else {
          setQuickFaqs(defaultQuickFaqs)
        }
      } catch (error) {
        console.error('Error fetching quick FAQs:', error)
        setQuickFaqs(defaultQuickFaqs)
      }
    }
    fetchQuickFaqs()
  }, [])

  // Fetch related products and navigation products - use API products only
  useEffect(() => {
    const buildRelated = (catalog: Product[]) => {
      if (!catalog.length) {
        setRelatedProducts([])
        setNavigationProducts({ prev: null, next: null })
        return
      }

      const currentIndex = catalog.findIndex((p) => p.id === product.id)

      if (currentIndex !== -1) {
        setNavigationProducts({
          prev: currentIndex > 0 ? catalog[currentIndex - 1] : null,
          next: currentIndex < catalog.length - 1 ? catalog[currentIndex + 1] : null,
        })
      } else {
        setNavigationProducts({ prev: null, next: null })
      }

      const prevId = currentIndex > 0 ? catalog[currentIndex - 1]?.id : null
      const nextId = currentIndex >= 0 && currentIndex < catalog.length - 1 ? catalog[currentIndex + 1]?.id : null
      const candidates = catalog.filter((p) => p.id !== product.id && p.id !== prevId && p.id !== nextId)

      const scored = candidates.map((p) => {
        const subcategoryScore = p.subcategory === product.subcategory ? 0 : 1
        const brandScore = p.brand === product.brand ? 0 : 1
        const priceDistance = Math.abs((p.price || 0) - (product.price || 0))
        const ratingBoost = -(p.rating || 0) * 0.01
        const availabilityBoost = p.inStock ? 0 : 0.5
        return { p, score: subcategoryScore + brandScore + ratingBoost + availabilityBoost, distance: priceDistance }
      })

      const related = scored
        .sort((a, b) => {
          if (a.score !== b.score) return a.score - b.score
          return a.distance - b.distance
        })
        .map((item) => item.p)
        .slice(0, 8)

      setRelatedProducts(related)
    }

    const fetchProducts = async () => {
      try {
        const response = await getProducts({ limit: 200 })
        const catalog = response.products.map(transformProduct)
        buildRelated(catalog)
      } catch (error) {
        console.error('Error fetching products:', error)
        setRelatedProducts([])
        setNavigationProducts({ prev: null, next: null })
      }
    }

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(fetchProducts, { timeout: 3000 })
    } else {
      setTimeout(fetchProducts, 500)
    }
  }, [product.id, product.subcategory, product.brand, product.price, product.rating, product.inStock])

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500))
    addItem({
      id: `${product.id}-default`,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: product.price,
      image: product.images[0],
      shippingCost: product.shippingCost ?? null,
    })
    setIsAddingToCart(false)
    setIsAddedToCart(true)
    setTimeout(() => setIsAddedToCart(false), 2000)
  }

  const savings = 0 // Removed retailPrice, now using shippingCost
  const savingsPercent = 0

  const handleNavigation = (sku: string, slug: string) => {
    // Use router.push for instant navigation with Next.js prefetching
    router.push(getProductUrl(sku, slug))
  }

  return (
    <div className="relative flex flex-col">

      {/* Navigation Buttons - Next/Previous */}
      {/* Navigation Buttons - Next/Previous */}
      {(navigationProducts.prev || navigationProducts.next) && (
        <div className="mb-4 mt-0 md:mb-6 flex items-center justify-between gap-2 md:gap-4 animate-fade-in">
          {navigationProducts.prev ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigation(navigationProducts.prev!.sku, navigationProducts.prev!.slug)}
              className="group flex items-center gap-1 md:gap-2 transition-all hover:scale-105 text-xs md:text-sm h-8 md:h-9 px-2 md:px-3"
            >
              <ChevronLeft className="h-3.5 w-3.5 md:h-4 md:w-4 transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline">Previous Product</span>
              <span className="sm:hidden">Prev</span>
            </Button>
          ) : (
            <div></div>
          )}

          {navigationProducts.next && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigation(navigationProducts.next!.sku, navigationProducts.next!.slug)}
              className="group flex items-center gap-1 md:gap-2 transition-all hover:scale-105 text-xs md:text-sm h-8 md:h-9 px-2 md:px-3"
            >
              <span className="hidden sm:inline">Next Product</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl border shadow-sm">
        <div className="flex flex-col lg:grid lg:grid-cols-10 lg:items-start">
          {/* Image Gallery - FIRST on mobile (order-1), normal on desktop */}
          <div className="animate-fade-in-left lg:col-span-6 p-3 md:p-6 order-1 lg:order-none">
            {/* Main Display - Video or Image */}
            <div className="relative aspect-[4/3] sm:aspect-[4/5] md:aspect-[4/5] lg:aspect-[4/5] overflow-hidden rounded-xl md:rounded-2xl border-2 border-gray-100 bg-gradient-to-br from-gray-50 to-gray-100 group">
              {showVideo && videoIds[currentVideoIndex] ? (
                <div className="relative w-full h-full">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoIds[currentVideoIndex]}?autoplay=1&rel=0`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={`${product.name} video ${currentVideoIndex + 1}`}
                  />
                  <button
                    onClick={() => setShowVideo(false)}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
                    aria-label="Close video"
                  >
                    <X className="h-4 w-4 text-gray-700" />
                  </button>

                  {/* Navigation between videos and images */}
                  <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between z-10 opacity-0 group-hover:opacity-100">
                    {/* Previous - go to previous video or last image */}
                    <button
                      onClick={() => {
                        if (currentVideoIndex > 0) {
                          setCurrentVideoIndex(currentVideoIndex - 1)
                        } else {
                          setShowVideo(false)
                          setSelectedImageIndex(product.images.length - 1)
                        }
                      }}
                      className="p-3 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110"
                      aria-label="Previous"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-800" />
                    </button>

                    {/* Next - go to next video or first image */}
                    <button
                      onClick={() => {
                        if (currentVideoIndex < videoIds.length - 1) {
                          setCurrentVideoIndex(currentVideoIndex + 1)
                        } else if (product.images.length > 0) {
                          setShowVideo(false)
                          setSelectedImageIndex(0)
                        }
                      }}
                      className="p-3 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110"
                      aria-label="Next"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-800" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="relative w-full h-full group cursor-zoom-in"
                  onClick={() => openLightbox(selectedImageIndex)}
                >
                  <SmartImage
                    src={product.images[selectedImageIndex] || product.images[0] || ''}
                    alt={product.name}
                    fill
                    className="object-contain transition-transform duration-700 group-hover:scale-105"
                    priority
                  />

                  {/* Navigation Arrows */}
                  {(product.images.length > 1 || hasVideos) && (
                    <>
                      {/* Previous Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (selectedImageIndex === 0 && hasVideos) {
                            // If at first image and videos exist, go to last video
                            setCurrentVideoIndex(videoIds.length - 1)
                            setShowVideo(true)
                          } else {
                            // Go to previous image
                            setSelectedImageIndex((prev) => {
                              if (prev === 0) return product.images.length - 1
                              return prev - 1
                            })
                            setShowVideo(false)
                          }
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                        aria-label="Previous"
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-800" />
                      </button>

                      {/* Next Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (selectedImageIndex === product.images.length - 1 && hasVideos) {
                            // If at last image and videos exist, go to first video
                            setCurrentVideoIndex(0)
                            setShowVideo(true)
                          } else {
                            // Go to next image
                            setSelectedImageIndex((prev) => {
                              if (prev === product.images.length - 1) return 0
                              return prev + 1
                            })
                            setShowVideo(false)
                          }
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                        aria-label="Next"
                      >
                        <ChevronRight className="h-5 w-5 text-gray-800" />
                      </button>
                    </>
                  )}

                  {/* Zoom hint */}
                  <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-600 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <ZoomIn className="h-3.5 w-3.5" />
                    Click to zoom
                  </div>

                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-4 left-4 z-10">
                      <Badge
                        variant={product.badge}
                        className={`text-sm px-3 py-1 shadow-lg ${product.badge === 'sale' ? 'animate-pulse-soft' : ''
                          }`}
                      >
                        {product.badge === 'new' && '✨ New Arrival'}
                        {product.badge === 'sale' && `🔥 ${savingsPercent}% OFF`}
                        {product.badge === 'rare' && '⭐ Rare'}
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="mt-3 md:mt-4 flex gap-1.5 sm:gap-2 md:gap-3 overflow-x-auto pb-2">
              {/* Video Thumbnails - show all videos */}
              {videoIds.map((vId, vIndex) => (
                <button
                  key={`video-${vIndex}`}
                  onClick={() => {
                    setCurrentVideoIndex(vIndex)
                    setShowVideo(true)
                    setSelectedImageIndex(-1)
                  }}
                  className={`thumb-button relative h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 flex-shrink-0 overflow-hidden rounded-lg md:rounded-xl border-2 transition-all duration-300 ${showVideo && currentVideoIndex === vIndex
                    ? 'border-primary shadow-lg scale-105 ring-2 ring-primary/30'
                    : 'border-gray-200 hover:border-primary/50 hover:shadow-md'
                    }`}
                  title={`Watch video ${vIndex + 1}`}
                >
                  <div className="relative w-full h-full bg-black">
                    <img
                      src={`https://img.youtube.com/vi/${vId}/mqdefault.jpg`}
                      alt={`Video ${vIndex + 1} thumbnail`}
                      className="w-full h-full object-cover opacity-75"
                      onError={(e) => {
                        // Fallback if thumbnail fails to load
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    {/* Video number badge */}
                    {videoIds.length > 1 && (
                      <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded">
                        {vIndex + 1}
                      </span>
                    )}
                  </div>
                </button>
              ))}

              {/* Image Thumbnails */}
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedImageIndex(index)
                    setShowVideo(false)
                  }}
                  className={`thumb-button relative h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 flex-shrink-0 overflow-hidden rounded-lg md:rounded-xl border-2 transition-all duration-300 ${selectedImageIndex === index && !showVideo
                    ? 'border-primary shadow-lg scale-105 ring-2 ring-primary/30'
                    : 'border-gray-200 hover:border-primary/50 hover:shadow-md'
                    }`}
                >
                  <SmartImage
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info - SECOND on mobile (order-2), sticky on desktop */}
          <div className="space-y-4 md:space-y-6 animate-fade-in-right lg:col-span-4 lg:sticky lg:top-4 lg:self-start lg:h-fit lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto p-4 md:p-6 lg:border-l order-2 lg:order-none">
            {/* Header */}
            <div>
              <div className="flex items-center gap-1.5 md:gap-2 mb-2 flex-wrap">
                <span className="text-xs md:text-sm font-semibold text-accent uppercase tracking-widest">
                  {product.brand}
                </span>
                <span className="text-gray-300 hidden sm:inline">|</span>
                <span className="text-xs md:text-sm text-muted-foreground">SKU: {product.sku}</span>
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-secondary leading-tight mb-3 md:mb-4">
                {product.name}
              </h1>

              {/* Condition Badge for Used Products - Below product name */}
              {product.productType === 'used' && product.condition && (
                <div className="mb-3 md:mb-4">
                  <ConditionTooltip condition={product.condition as ConditionRating} />
                </div>
              )}

              {/* Rating - Hidden per user request */}
            </div>

            {/* Pricing */}
            <div className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
              {isSoldOut ? (
                <div className="text-center py-2">
                  <span className="text-3xl md:text-4xl font-bold text-red-500">
                    SOLD OUT
                  </span>
                  <p className="text-sm text-gray-500 mt-2">This item is no longer available</p>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-2 md:gap-3 mb-2 flex-wrap">
                    <span className="text-3xl md:text-4xl font-bold text-primary">
                      ${product.price.toLocaleString()}
                    </span>
                  </div>

                  {/* Shipping Info - Auto-show if user has address */}
                  <div className="mt-2 md:mt-3">
                    {shippingCost !== null && userAddress ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Truck className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className={`font-medium ${shippingCost === 0 ? 'text-green-600' : shippingCost <= 25 ? 'text-green-600' : 'text-amber-600'}`}>
                          {shippingMessage}
                        </span>
                        <button
                          onClick={() => setShowShippingCalc(!showShippingCalc)}
                          className="text-xs text-gray-400 hover:text-primary underline"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowShippingCalc(!showShippingCalc)}
                        className="flex items-center gap-2 text-xs md:text-sm text-primary font-medium hover:text-primary/80 transition-colors"
                      >
                        <Truck className="h-4 w-4 flex-shrink-0" />
                        <span>Shipping</span>
                        <Calculator className="h-3.5 w-3.5" />
                        <span className="text-gray-400 text-xs">(Click to calculate)</span>
                      </button>
                    )}

                    {/* Shipping Calculator Popup */}
                    {showShippingCalc && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-primary/20 shadow-lg animate-fade-in">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-secondary">Calculate Shipping Cost</span>
                        </div>
                        <div className="flex gap-2">
                          {/* Country Selection */}
                          <select
                            value={shippingCountry}
                            onChange={(e) => setShippingCountry(e.target.value)}
                            className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                          >
                            <option value="">Select Country</option>
                            <option value="Vietnam">Vietnam</option>
                            <option value="United States">United States</option>
                            <option value="Canada">Canada</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Australia">Australia</option>
                            <option value="Germany">Germany</option>
                            <option value="France">France</option>
                            <option value="Japan">Japan</option>
                            <option value="South Korea">South Korea</option>
                            <option value="Singapore">Singapore</option>
                            <option value="Thailand">Thailand</option>
                            <option value="Malaysia">Malaysia</option>
                            <option value="Indonesia">Indonesia</option>
                            <option value="Philippines">Philippines</option>
                            <option value="China">China</option>
                            <option value="Taiwan">Taiwan</option>
                            <option value="Hong Kong">Hong Kong</option>
                            <option value="India">India</option>
                            <option value="Other">Other</option>
                          </select>
                          <button
                            onClick={calculateShipping}
                            disabled={isCalculatingShipping || !shippingCountry}
                            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                          >
                            {isCalculatingShipping ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Calculate'
                            )}
                          </button>
                        </div>
                        {shippingMessage && !userAddress && (
                          <p className={`mt-2 text-sm font-medium ${shippingCost !== null && shippingCost <= 25 ? 'text-green-600' : 'text-amber-600'}`}>
                            {shippingMessage}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Stock Status */}
            {!isSoldOut && (
              <div className={`flex items-center gap-2 text-xs md:text-sm font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                {(() => {
                  const stockStatus = (product as any).stockStatus || (product.inStock ? 'in-stock' : 'sold-out')
                  switch (stockStatus) {
                    case 'in-stock':
                      return (
                        <>
                          <Check className="h-5 w-5" />
                          <span>In Stock - Ships within 1-2 business days</span>
                        </>
                      )
                    case 'pre-order':
                      return (
                        <span className="text-amber-600">Pre-Order - This item is under maintenance, ready to ship in 7-10 days</span>
                      )
                    default:
                      return (
                        <>
                          <Check className="h-5 w-5" />
                          <span>In Stock - Ships within 1-2 business days</span>
                        </>
                      )
                  }
                })()}
              </div>
            )}

            {/* Condition Notes for Used Products */}
            {product.productType === 'used' && product.conditionNotes && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-700">Seller Notes: </span>
                  {product.conditionNotes}
                </p>
              </div>
            )}


            {/* Action Buttons - 3 Rows Layout (eBay style) */}
            <div className="space-y-3">
              {/* Row 1: Buy Now - Gold/Primary */}
              <Button
                size="lg"
                className={`w-full text-sm md:text-base font-semibold transition-all duration-300 rounded-full h-12 ${isSoldOut
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#D4AF37] hover:bg-[#c9a432] text-secondary hover:shadow-lg'
                  }`}
                onClick={() => {
                  if (isSoldOut) return
                  // Clear cart first, then add only this product for immediate checkout
                  clearCart()
                  addItem({
                    id: `${product.id}-default`,
                    productId: product.id,
                    name: product.name,
                    slug: product.slug,
                    sku: product.sku,
                    price: product.price,
                    image: product.images[0],
                    shippingCost: product.shippingCost ?? null,
                  })
                  router.push('/checkout')
                }}
                disabled={isSoldOut || isAddingToCart}
              >
                {isSoldOut ? 'Sold Out' : 'Buy it now'}
              </Button>

              {/* Row 2: Add to Cart - Gray */}
              <Button
                size="lg"
                variant="outline"
                className={`w-full text-sm md:text-base font-semibold transition-all duration-300 rounded-full h-12 ${isSoldOut
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : isAddedToCart
                    ? 'bg-green-500 hover:bg-green-600 text-white border-green-500'
                    : 'bg-gray-100 hover:bg-[#D4AF37] hover:text-secondary hover:border-[#D4AF37] text-gray-800 border-gray-200'
                  }`}
                onClick={handleAddToCart}
                disabled={isSoldOut || isAddingToCart}
              >
                {isSoldOut ? (
                  'Not Available'
                ) : isAddingToCart ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </span>
                ) : isAddedToCart ? (
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4 animate-bounce" />
                    Added to cart
                  </span>
                ) : (
                  'Add to cart'
                )}
              </Button>

              {/* Row 3: Inquiry + Favorite */}
              <div className="flex gap-2">
                {/* Inquiry Button - Gray */}
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setIsInquiryOpen(true)}
                  className="flex-1 bg-gray-100 hover:bg-[#D4AF37] hover:text-secondary hover:border-[#D4AF37] text-gray-800 border-gray-200 rounded-full h-12 gap-2"
                  title={`Inquiry about ${product.name}`}
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Inquiry</span>
                </Button>

                {/* Favorite Button */}
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleToggleWishlist}
                  disabled={isWishlistLoading}
                  className={`px-4 shrink-0 transition-all duration-300 rounded-full h-12 ${isWishlisted ? 'border-red-300 bg-red-50 text-red-500 hover:bg-red-100' : 'bg-gray-100 hover:bg-[#D4AF37] hover:text-secondary hover:border-[#D4AF37] text-gray-600 border-gray-200'
                    }`}
                  title={session?.user ? (isWishlisted ? "Remove from Wishlist" : "Add to Wishlist") : "Login to add to Wishlist"}
                >
                  {isWishlistLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Heart className={`h-5 w-5 transition-all ${isWishlisted ? 'fill-current scale-110' : ''}`} />
                  )}
                </Button>

                {/* Share Button with Dropdown */}
                {/* Share Button with Dropdown */}
                <div className="relative">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="px-4 shrink-0 transition-all duration-300 rounded-full h-12 bg-gray-100 hover:bg-[#D4AF37] hover:text-secondary hover:border-[#D4AF37] text-gray-600 border-gray-200"
                    title="Share this product"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                  {/* Share Dropdown */}
                  {showShareMenu && (
                    <>
                      {/* Backdrop to close menu when clicking outside */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowShareMenu(false)}
                      />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex flex-col gap-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[140px] z-50">
                        <a
                          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(product.name)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          onClick={() => setShowShareMenu(false)}
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                          X (Twitter)
                        </a>
                        <a
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          onClick={() => setShowShareMenu(false)}
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                          Facebook
                        </a>
                        <a
                          href={`https://www.instagram.com/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          onClick={() => setShowShareMenu(false)}
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                          Instagram
                        </a>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Dialog open={isInquiryOpen} onOpenChange={setIsInquiryOpen}>
              <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto p-0 border-0 bg-transparent shadow-none">
                <InquiryFormContent
                  prefillProduct={product.name}
                  prefillSku={product.sku}
                  onClose={() => setIsInquiryOpen(false)}
                />
              </DialogContent>
            </Dialog>


          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-4 md:mt-12 lg:mt-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 gap-2 md:gap-8 overflow-x-auto">
            {['description', 'specs', 'reviews', 'faq'].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="product-tabs-trigger relative capitalize text-xs md:text-base lg:text-lg pb-2 md:pb-4 px-1 md:px-0 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary font-medium text-gray-500 hover:text-gray-700 transition-colors whitespace-nowrap after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-300"
              >
                {tab === 'faq' ? 'FAQ' : tab}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="description" className="mt-3 md:mt-6 lg:mt-8 animate-fade-in">
            <div className="prose prose-sm md:prose-lg max-w-none">
              {/* Split description by double newlines or periods followed by space to create paragraphs */}
              <div className="text-gray-700 leading-relaxed text-sm md:text-lg space-y-4">
                {product.description?.split(/\n\n|\n/).filter(Boolean).map((paragraph, index) => (
                  <p key={index} className="text-gray-700">{paragraph.trim()}</p>
                )) || <p>{product.description}</p>}
              </div>

              {product.included && (
                <div className="mt-4 md:mt-8 p-3 md:p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg md:rounded-2xl border border-green-100">
                  <h3 className="text-base md:text-xl font-bold text-secondary mb-2 md:mb-4">
                    What's Included
                  </h3>
                  <ul className="space-y-1.5 md:space-y-2">
                    {product.included.map((item, index) => (
                      <li key={index} className="flex items-center gap-1.5 md:gap-3 text-xs md:text-base text-gray-700">
                        <Check className="h-3.5 w-3.5 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="specs" className="mt-4 md:mt-6 lg:mt-8 animate-fade-in">
            {product.specs ? (
              <div className="grid gap-2 md:gap-3">
                {Object.entries(product.specs).map(([key, value], i) => (
                  <div
                    key={key}
                    className={`flex flex-col sm:flex-row p-3 md:p-4 rounded-lg md:rounded-xl transition-all duration-300 hover:shadow-md ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white border'
                      }`}
                    style={{ animationDelay: `${0.05 * i}s` }}
                  >
                    <span className="w-full sm:w-1/3 font-semibold text-secondary text-sm md:text-base mb-1 sm:mb-0">{key}</span>
                    <span className="text-gray-600 text-sm md:text-base">{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6 md:py-8 text-sm md:text-base">No specifications available.</p>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-4 md:mt-6 lg:mt-8 animate-fade-in">
            <div className="space-y-4 md:space-y-6">
              {reviews.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 p-4 md:p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl md:rounded-2xl border border-amber-100">
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-bold text-secondary">
                      {displayRating.toFixed(1)}
                    </div>
                    <div className="flex mt-2 justify-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 md:h-5 md:w-5 ${i < Math.floor(displayRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-gray-300 text-gray-300'
                            }`}
                        />
                      ))}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600 mt-1">
                      {displayReviewCount} {displayReviewCount === 1 ? 'review' : 'reviews'}
                    </div>
                  </div>

                  {/* Rating bars - calculated from actual reviews */}
                  <div className="flex-1 w-full sm:w-auto space-y-2">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = reviews.filter(r => Math.round(r.rating) === stars).length
                      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                      return (
                        <div key={stars} className="flex items-center gap-2 md:gap-3">
                          <span className="text-xs md:text-sm w-3">{stars}</span>
                          <Star className="h-3 w-3 md:h-4 md:w-4 fill-amber-400 text-amber-400" />
                          <div className="flex-1 h-1.5 md:h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full transition-all duration-700"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs md:text-sm text-gray-500 w-8 md:w-10">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Actual Reviews List */}
              {reviews.length > 0 ? (
                <>
                  <div className="space-y-4 md:space-y-6">
                    {displayedReviews.map((review, index) => (
                      <div
                        key={review.id}
                        className="p-4 md:p-6 bg-white rounded-xl md:rounded-2xl border border-gray-200 hover:shadow-md transition-shadow animate-fade-in-up"
                        style={{ animationDelay: `${0.1 * index}s` }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-secondary">{review.buyerName}</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-sm text-gray-500">
                                {new Date(review.date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < review.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'fill-gray-200 text-gray-200'
                                    }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed text-sm md:text-base mt-3 whitespace-pre-line">
                          {review.message}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* View All / Show Less Button */}
                  {hasMoreReviews && (
                    <div className="flex justify-center pt-4">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        className="group"
                      >
                        {showAllReviews ? (
                          <>
                            <ChevronLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Show Less Reviews
                          </>
                        ) : (
                          <>
                            View All {reviews.length} Reviews
                            <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6 md:py-8 text-gray-500">
                  <p className="mb-3 md:mb-4 text-sm md:text-base">Be the first to share your experience!</p>
                  <Button variant="outline" size="sm" className="md:size-default">Write a Review</Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="faq" className="mt-4 md:mt-6 lg:mt-8 animate-fade-in">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-secondary uppercase text-center">QUICK FAQ</h3>
            </div>
            <Accordion type="single" collapsible className="space-y-3">
              {quickFaqs.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="bg-white rounded-xl border px-5 data-[state=open]:shadow-md transition-shadow"
                >
                  <AccordionTrigger className="text-left font-semibold text-secondary hover:no-underline py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
        </Tabs>
      </div>

      {/* Similar Listings */}
      {relatedProducts.length > 0 && (
        <div className="mt-6 md:mt-16 lg:mt-20 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-3 md:mb-6">
            <div>
              <h2 className="text-xl md:text-3xl font-bold text-secondary">Similar Listings</h2>
              <p className="text-muted-foreground mt-0.5 md:mt-1 text-xs md:text-base">Explore other horns with matching specs and price points.</p>
            </div>
            <Button variant="outline" asChild size="sm" className="hidden sm:flex">
              <Link href="/shop">View All →</Link>
            </Button>
          </div>

          <div className="overflow-x-auto pb-2 -mx-1 snap-x snap-mandatory">
            <div className="flex gap-2.5 px-1 md:grid md:grid-flow-col md:auto-cols-[minmax(240px,280px)] md:gap-5">
              {relatedProducts.map((item, index) => (
                <Link
                  key={`${item.id}-${index}`}
                  href={getProductUrl(item.sku, item.slug)}
                  className="group snap-start bg-white rounded-xl md:rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden min-w-[160px] w-[160px] sm:min-w-[240px] sm:w-[240px] md:min-w-0 md:w-auto"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <SmartImage
                      src={item.images[0]}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-2 md:p-4 space-y-1">
                    <p className="text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wide">{item.brand}</p>
                    <p className="text-sm md:text-lg font-semibold text-secondary leading-tight line-clamp-2 group-hover:text-primary">
                      {item.name}
                    </p>
                    <p className="text-[10px] md:text-sm text-gray-600">{item.inStock ? 'In Stock' : 'Sold'}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-base md:text-xl font-bold text-primary">
                        ${item.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      {!relatedProducts.length && (
        <div className="mt-12 md:mt-16 lg:mt-20 text-center text-muted-foreground text-sm">
          More recommendations coming soon for this instrument.
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black flex flex-col"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          {/* Main image container */}
          <div
            className="flex-1 flex items-center justify-center p-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Previous button */}
            <button
              onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              className="absolute left-4 z-10 p-3 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110"
            >
              <ChevronLeft className="h-6 w-6 text-gray-800" />
            </button>

            {/* Video or Image */}
            {isVideoIndex(lightboxIndex) && videoIds[getVideoIndexFromLightbox(lightboxIndex)] ? (
              <div className="relative w-full h-full max-w-7xl max-h-[85vh] aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${videoIds[getVideoIndexFromLightbox(lightboxIndex)]}?autoplay=1&rel=0`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`${product.name} video ${getVideoIndexFromLightbox(lightboxIndex) + 1}`}
                />
              </div>
            ) : (
              <div className="relative w-full h-full max-w-7xl max-h-[85vh]">
                <SmartImage
                  src={product.images[lightboxIndex] || ''}
                  alt={`${product.name} - Image ${lightboxIndex + 1}`}
                  fill
                  className="object-contain"
                />
              </div>
            )}

            {/* Next button */}
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute right-4 z-10 p-3 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110"
            >
              <ChevronRight className="h-6 w-6 text-gray-800" />
            </button>
          </div>

          {/* Thumbnails strip */}
          <div
            className="bg-black/80 backdrop-blur-sm py-4 px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-2 justify-center overflow-x-auto max-w-full pb-2">
              {/* Video Thumbnails */}
              {videoIds.map((vId, vIndex) => (
                <button
                  key={`lightbox-video-${vIndex}`}
                  onClick={() => setLightboxIndex(-1 - vIndex)}
                  className={`relative h-16 w-16 md:h-20 md:w-20 flex-shrink-0 overflow-hidden rounded-lg transition-all duration-300 ${lightboxIndex === -1 - vIndex
                    ? 'ring-2 ring-white scale-110 opacity-100'
                    : 'opacity-50 hover:opacity-80'
                    }`}
                >
                  <div className="relative w-full h-full bg-black">
                    <img
                      src={`https://img.youtube.com/vi/${vId}/mqdefault.jpg`}
                      alt={`Video ${vIndex + 1} thumbnail`}
                      className="w-full h-full object-cover opacity-75"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 md:w-8 md:h-8 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-3 h-3 md:w-4 md:h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    {/* Video number badge */}
                    {videoIds.length > 1 && (
                      <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded">
                        {vIndex + 1}
                      </span>
                    )}
                  </div>
                </button>
              ))}

              {/* Image Thumbnails */}
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setLightboxIndex(index)}
                  className={`relative h-16 w-16 md:h-20 md:w-20 flex-shrink-0 overflow-hidden rounded-lg transition-all duration-300 ${lightboxIndex === index
                    ? 'ring-2 ring-white scale-110 opacity-100'
                    : 'opacity-50 hover:opacity-80'
                    }`}
                >
                  <SmartImage
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
