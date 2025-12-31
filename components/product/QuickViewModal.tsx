'use client'

import { useState } from 'react'
import Link from 'next/link'
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
import { Star, Heart, Check, Minus, Plus, ExternalLink, Truck, Shield, Award, X } from 'lucide-react'

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
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isAddedToCart, setIsAddedToCart] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const addItem = useCartStore((state) => state.addItem)
  
  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    if (!url) return null
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/)
    return match ? match[1] : null
  }
  
  const videoId = product.videoUrl ? getYouTubeVideoId(product.videoUrl) : null

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: `${product.id}-default`,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.images[0],
      })
    }
    setIsAddedToCart(true)
    setTimeout(() => {
      setIsAddedToCart(false)
    }, 2000)
  }

  const savings = product.retailPrice ? product.retailPrice - product.price : 0
  const savingsPercent = product.retailPrice ? Math.round((savings / product.retailPrice) * 100) : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[90vh] overflow-auto">
          {/* Image Gallery */}
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            {/* Badge */}
            {product.badge && (
              <div className="absolute top-4 left-4 z-10">
                <Badge 
                  variant={product.badge} 
                  className={`shadow-lg ${product.badge === 'sale' ? 'animate-pulse-soft' : ''}`}
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
                isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
              }`}
            >
              <Heart className={`h-5 w-5 transition-all ${isWishlisted ? 'fill-current' : ''}`} />
            </button>

            {/* Main Display - Video or Image */}
            <div className="relative aspect-square overflow-hidden rounded-xl bg-white">
              {showVideo && videoId ? (
                <div className="relative w-full h-full">
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
                </div>
              ) : (
                <div className="relative w-full h-full group">
                  <SmartImage
                    src={product.images[selectedImageIndex] || product.images[0] || ''}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="mt-4 flex gap-2 justify-center overflow-x-auto pb-2">
              {/* Video Thumbnail */}
              {videoId && (
                <button
                  onClick={() => {
                    setShowVideo(true)
                    setSelectedImageIndex(-1)
                  }}
                  className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-300 ${
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
                  className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-300 ${
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
          <div className="p-6 space-y-5 overflow-auto">
            <DialogHeader className="space-y-2 text-left">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-accent uppercase tracking-wider">
                  {product.brand}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-muted-foreground">SKU: {product.sku}</span>
              </div>
              <DialogTitle className="text-2xl font-bold text-secondary leading-tight">
                {product.name}
              </DialogTitle>
            </DialogHeader>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating || 0)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{product.rating}</span>
                <span className="text-sm text-muted-foreground">
                  ({product.reviewCount} reviews)
                </span>
              </div>
            )}

            {/* Pricing */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">
                  ${product.price.toLocaleString()}
                </span>
                {product.retailPrice && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      ${product.retailPrice.toLocaleString()}
                    </span>
                    <Badge variant="destructive" className="text-xs">
                      Save ${savings.toLocaleString()}
                    </Badge>
                  </>
                )}
              </div>
              
              {/* Financing */}
              {product.price > 500 && (
                <p className="text-sm text-gray-600 mt-2">
                  Or <span className="font-semibold text-accent">${(product.price / 12).toFixed(0)}/mo</span> with 0% APR
                </p>
              )}
            </div>

            {/* Stock Status */}
            <div className={`flex items-center gap-2 text-sm font-medium ${
              product.inStock ? 'text-green-600' : 'text-red-600'
            }`}>
              {product.inStock ? (
                <>
                  <Check className="h-4 w-4" />
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

            {/* Quantity & Add to Cart */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-600">Qty:</span>
                <div className="flex items-center border-2 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock || 10, q + 1))}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <Button
                className={`w-full font-semibold transition-all duration-300 ${
                  isAddedToCart 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'hover:shadow-lg hover:scale-[1.02]'
                }`}
                size="lg"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                {isAddedToCart ? (
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
                className="w-full group relative overflow-hidden" 
                size="lg" 
                disabled={isNavigating}
                asChild
              >
                <Link 
                  href={`/product/${product.slug}`}
                  onClick={() => setIsNavigating(true)}
                >
                  {isNavigating ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                      Loading...
                    </span>
                  ) : (
                    <>
                      <span>View Full Details</span>
                      <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Link>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {[
                { icon: Truck, text: 'Free Ship' },
                { icon: Shield, text: '30-Day Return' },
                { icon: Award, text: 'Pro Setup' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-gray-50 text-center">
                  <item.icon className="h-4 w-4 text-primary" />
                  <span className="text-xs text-gray-600">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
