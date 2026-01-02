'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Product } from '@/lib/data'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/lib/store/cart'
import { SmartImage } from '@/components/ui/smart-image'
import { Star, Heart, Check, ExternalLink, Truck, Shield, Award, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { getProductRatingStats } from '@/lib/reviews'

interface QuickViewModalProps {
  product: Product
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickViewModal({
  product,
  open,
  onOpenChange,
}: QuickViewModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showVideo, setShowVideo] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isAddedToCart, setIsAddedToCart] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const addItem = useCartStore((state) => state.addItem)
  const router = useRouter()
  
  // Prefetch product page when modal opens
  useEffect(() => {
    if (open) {
      router.prefetch(`/product/${product.slug}`)
    }
  }, [open, product.slug, router])
  
  // Get rating from hardcoded reviews
  const reviewStats = getProductRatingStats(product.name)
  const displayRating = reviewStats.rating > 0 ? reviewStats.rating : product.rating || 0
  const displayReviewCount = reviewStats.reviewCount > 0 ? reviewStats.reviewCount : product.reviewCount || 0
  
  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    if (!url) return null
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/)
    return match ? match[1] : null
  }
  
  const videoId = product.videoUrl ? getYouTubeVideoId(product.videoUrl) : null

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500))
    addItem({
      id: `${product.id}-default`,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.images[0],
    })
    setIsAddingToCart(false)
    setIsAddedToCart(true)
    setTimeout(() => {
      setIsAddedToCart(false)
    }, 2000)
  }

  const savings = product.retailPrice ? product.retailPrice - product.price : 0
  const savingsPercent = product.retailPrice ? Math.round((savings / product.retailPrice) * 100) : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="quickview-modal w-[95vw] max-w-4xl max-h-[92vh] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl animate-scale-in">
        <div className="quickview-body flex flex-col md:grid md:grid-cols-2 max-h-[92vh] overflow-hidden md:overflow-auto">
          {/* Image Gallery */}
          <div className="quickview-media relative bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
            {/* Badge */}
            {product.badge && (
              <div className="absolute top-4 left-4 z-10 animate-fade-in-up">
                <Badge 
                  variant={product.badge} 
                  className={`shadow-lg transition-transform hover:scale-105 ${product.badge === 'sale' ? 'animate-pulse-soft' : ''}`}
                >
                  {product.badge === 'new' && '✨ New'}
                  {product.badge === 'sale' && `🔥 ${savingsPercent}% OFF`}
                  {product.badge === 'limited' && '⭐ Limited'}
                </Badge>
              </div>
            )}

            {/* Wishlist */}
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 shadow-lg transition-all duration-300 hover:scale-110 ${
                isWishlisted ? 'text-red-500 animate-heart-bounce' : 'text-gray-400 hover:text-red-400'
              }`}
            >
              <Heart className={`h-5 w-5 transition-all ${isWishlisted ? 'fill-current scale-110' : ''}`} />
            </button>

            {/* Main Display - Video or Image */}
            <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden rounded-xl bg-white">
              {showVideo && videoId ? (
                <div className="relative w-full h-full group">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={`${product.name} video`}
                  />
                  <button
                    onClick={() => setShowVideo(false)}
                    className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
                    aria-label="Close video"
                  >
                    <X className="h-3.5 w-3.5 text-gray-700" />
                  </button>
                  
                  {/* Navigation to first image */}
                  {product.images.length > 0 && (
                    <button
                      onClick={() => {
                        setShowVideo(false)
                        setSelectedImageIndex(0)
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                      aria-label="Next to images"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-800" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="relative w-full h-full group">
                  <SmartImage
                    src={product.images[selectedImageIndex] || product.images[0] || ''}
                    alt={product.name}
                    fill
                    className="object-contain sm:object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Navigation Arrows */}
                  {(product.images.length > 1 || videoId) && (
                    <>
                      {/* Previous Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (selectedImageIndex === 0 && videoId) {
                            // If at first image and video exists, go to video
                            setShowVideo(true)
                            setSelectedImageIndex(-1)
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
                          if (selectedImageIndex === product.images.length - 1 && videoId) {
                            // If at last image and video exists, go to video
                            setShowVideo(true)
                            setSelectedImageIndex(-1)
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
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="mt-3 sm:mt-4 flex gap-1.5 sm:gap-2 justify-center overflow-x-auto pb-2">
              {/* Video Thumbnail */}
              {videoId && (
                <button
                  onClick={() => {
                    setShowVideo(true)
                    setSelectedImageIndex(-1)
                  }}
                  className={`thumb-button relative h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                    showVideo
                      ? 'border-primary shadow-lg scale-105'
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <div className="relative w-full h-full bg-black">
                    <img
                      src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover opacity-75"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>
              )}
              
              {/* Image Thumbnails */}
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedImageIndex(index)
                    setShowVideo(false)
                  }}
                  className={`thumb-button relative h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                    selectedImageIndex === index && !showVideo
                      ? 'border-primary shadow-lg scale-105'
                      : 'border-gray-200 hover:border-primary/50'
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

          {/* Product Info */}
          <div className="quickview-info p-4 sm:p-6 space-y-3 sm:space-y-5 overflow-visible md:overflow-auto">
            <DialogHeader className="space-y-2 text-left animate-fade-in-up">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-accent uppercase tracking-wider">
                  {product.brand}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-muted-foreground">SKU: {product.sku}</span>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-secondary leading-tight line-clamp-2">
                {product.name}
              </DialogTitle>
            </DialogHeader>

            {/* Rating */}
            {displayRating > 0 && (
              <div className="flex items-center gap-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 transition-all duration-300 hover:scale-125 ${
                        i < Math.floor(displayRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                      style={{ animationDelay: `${i * 0.05}s` }}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{displayRating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">
                  ({displayReviewCount} {displayReviewCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}

            {/* Pricing */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 animate-fade-in-up hover:shadow-lg transition-all duration-300" style={{ animationDelay: '0.15s' }}>
              <div className="flex items-baseline gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl font-bold text-primary">
                  ${product.price.toLocaleString()}
                </span>
                {product.retailPrice && (
                  <>
                    <span className="text-base sm:text-lg text-gray-400 line-through">
                      ${product.retailPrice.toLocaleString()}
                    </span>
                    <Badge variant="destructive" className="text-[10px] sm:text-xs animate-pulse-soft">
                      Save ${savings.toLocaleString()}
                    </Badge>
                  </>
                )}
              </div>
              
              {/* Financing */}
              {product.price > 500 && (
                <p className="text-xs sm:text-sm text-gray-600 mt-2">
                  Or <span className="font-semibold text-accent">${(product.price / 12).toFixed(0)}/mo</span> with 0% APR
                </p>
              )}
            </div>

            {/* Stock Status */}
            <div className={`flex items-center gap-2 text-xs sm:text-sm font-medium animate-fade-in-up ${
              product.inStock ? 'text-green-600' : 'text-red-600'
            }`} style={{ animationDelay: '0.2s' }}>
              {product.inStock ? (
                <>
                  <Check className="h-4 w-4 animate-bounce" />
                  <span>In Stock</span>
                </>
              ) : (
                <span>Out of Stock</span>
              )}
              {product.stock && product.stock <= 5 && product.inStock && (
                <Badge variant="outline" className="ml-2 text-orange-600 border-orange-300 animate-pulse text-xs">
                  Only {product.stock} left!
                </Badge>
              )}
            </div>

            {/* Purchase Actions */}
            <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
              <div className="p-2 sm:p-3 rounded-lg bg-gray-50 border text-xs sm:text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                <p className="font-semibold text-secondary">One-of-a-kind listing</p>
                <p className="text-gray-600">Each horn is sold individually; we reserve this instrument for you once you add to cart.</p>
              </div>

              <Button
                className={`quickview-action w-full font-semibold transition-all duration-300 ${
                  isAddedToCart 
                    ? 'bg-green-500 hover:bg-green-600 scale-105' 
                    : 'hover:shadow-lg hover:scale-[1.02]'
                }`}
                size="lg"
                onClick={handleAddToCart}
                disabled={!product.inStock || isAddingToCart}
              >
                {isAddingToCart ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Adding...
                  </span>
                ) : isAddedToCart ? (
                  <span className="flex items-center gap-2">
                    <Check className="h-5 w-5 animate-bounce" />
                    Added to Cart!
                  </span>
                ) : (
                  'Add to Cart'
                )}
              </Button>

              <Button 
                variant="outline" 
                className="quickview-action w-full group relative overflow-hidden hover:border-primary" 
                size="lg"
                onClick={() => {
                  // Close modal immediately for better UX
                  onOpenChange(false)
                  // Navigate using router for faster client-side navigation
                  router.push(`/product/${product.slug}`)
                }}
              >
                <span className="relative z-10">View Full Details</span>
                <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 relative z-10" />
                <span className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex gap-2 pt-2 md:grid md:grid-cols-3 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              {[
                { icon: Truck, text: 'Free Ship' },
                { icon: Shield, text: '30-Day Return' },
                { icon: Award, text: 'Pro Setup' },
              ].map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-lg bg-gray-50 text-center hover:bg-primary/5 hover:shadow transition-all duration-300 group/trust cursor-default">
                  <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary transition-transform group-hover/trust:scale-110" />
                  <span className="text-[10px] sm:text-xs text-gray-600">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
