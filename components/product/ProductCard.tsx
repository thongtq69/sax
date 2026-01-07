'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, Star, Heart, ShoppingBag, Loader2 } from 'lucide-react'
import { Product } from '@/lib/data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { QuickViewModal } from './QuickViewModal'
import { useCartStore } from '@/lib/store/cart'
import { SmartImage } from '@/components/ui/smart-image'
import { getProductRatingStats } from '@/lib/reviews'
import { getProductUrl } from '@/lib/api'
import { ConditionTooltip } from './ConditionTooltip'
import { ConditionRating } from '@/lib/product-conditions'

interface ProductCardProps {
  product: Product
  index?: number
}

// Mock finishes/colors for demo
const getProductFinishes = (productId: string) => {
  const finishSets: Record<string, string[]> = {
    '1': ['#D4AF37', '#C0C0C0'], // Gold, Silver
    '2': ['#D4AF37', '#8B4513'], // Gold, Bronze
    '3': ['#D4AF37'], // Gold only
    '10': ['#C0C0C0', '#D4AF37'], // Silver, Gold
    '11': ['#D4AF37', '#C0C0C0'], // Gold, Silver
  }
  return finishSets[productId] || ['#D4AF37']
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  const [imageHover, setImageHover] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(true)
  const addItem = useCartStore((state) => state.addItem)
  const router = useRouter()
  
  // Product URL with SEO-friendly slug
  const productUrl = getProductUrl(product.sku, product.slug)
  
  // Prefetch product page on hover
  const handleMouseEnter = () => {
    router.prefetch(productUrl)
  }

  // Get rating from hardcoded reviews
  const reviewStats = getProductRatingStats(product.name)
  const displayRating = reviewStats.rating > 0 ? reviewStats.rating : product.rating || 0
  const displayReviewCount = reviewStats.reviewCount > 0 ? reviewStats.reviewCount : product.reviewCount || 0

  const finishes = getProductFinishes(product.id)
  const savings = product.retailPrice ? product.retailPrice - product.price : 0

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
    })
    setTimeout(() => setIsAddingToCart(false), 1000)
  }

  // Stagger animation delay based on index
  const staggerDelay = Math.min(index * 0.05, 0.6)

  return (
    <>
      <Card 
        className="product-card group relative overflow-hidden border-2 border-transparent hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-2 bg-card"
        style={{ animationDelay: `${staggerDelay}s` }}
      >
        {/* Decorative corner accents on hover - hidden on mobile */}
        <div className="hidden sm:block absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-primary/0 group-hover:border-primary/50 transition-all duration-500 z-10" />
        <div className="hidden sm:block absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-primary/0 group-hover:border-primary/50 transition-all duration-500 z-10" />
        <div className="hidden sm:block absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-primary/0 group-hover:border-primary/50 transition-all duration-500 z-10" />
        <div className="hidden sm:block absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-primary/0 group-hover:border-primary/50 transition-all duration-500 z-10" />

        <div
          className="product-image-container relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100"
          onMouseEnter={() => {
            setImageHover(true)
            handleMouseEnter()
          }}
          onMouseLeave={() => setImageHover(false)}
        >
          {/* Loading skeleton */}
          {isImageLoading && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
            </div>
          )}

          {/* Primary Image */}
          <SmartImage
            src={product.images[0] || ''}
            alt={product.name}
            fill
            className={`object-cover transition-all duration-700 ease-out ${
              imageHover && product.images[1] ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
            } ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setIsImageLoading(false)}
          />

          {/* Secondary Image (hover) */}
          {product.images[1] && (
            <SmartImage
              src={product.images[1]}
              alt={`${product.name} - alternate view`}
              fill
              className={`object-cover transition-all duration-700 ease-out absolute inset-0 ${
                imageHover ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            />
          )}

          {/* Shine effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none transform -translate-x-full group-hover:translate-x-full" style={{ transitionDuration: '0.8s' }} />

          {/* Badges with animations */}
          <div className="absolute left-2 sm:left-3 top-2 sm:top-3 flex flex-col gap-1.5 sm:gap-2 z-20">
            {product.badge && (
              <Badge
                variant={product.badge}
                className={`shadow-lg transform transition-all duration-300 hover:scale-105 ${
                  product.badge === 'sale' ? 'animate-pulse-soft' : ''
                } ${product.badge === 'limited' ? 'animate-border-glow' : ''}`}
              >
                {product.badge === 'new' && '✨ New'}
                {product.badge === 'sale' && `🔥 Save $${savings.toFixed(0)}`}
                {product.badge === 'limited' && '⭐ Limited'}
                {product.badge === 'coming-soon' && '🎵 Coming Soon'}
                {product.badge === 'out-of-stock' && 'Out of Stock'}
              </Badge>
            )}
            {product.stock && product.stock <= 2 && product.inStock && (
              <Badge variant="destructive" className="stock-warning shadow-lg text-xs">
                Only {product.stock} left!
              </Badge>
            )}
            {/* Condition badge for used products */}
            {product.productType === 'used' && product.condition && (
              <ConditionTooltip 
                condition={product.condition as ConditionRating} 
                className="shadow-lg"
              />
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className={`absolute right-3 top-3 z-20 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-110 ${
              isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
            }`}
          >
            <Heart 
              className={`h-5 w-5 transition-all duration-300 ${isWishlisted ? 'fill-current scale-110' : ''}`} 
            />
          </button>

          {/* Quick View Overlay - hidden on mobile */}
          <div className="hidden sm:flex absolute inset-0 items-center justify-center bg-gradient-to-t from-secondary/80 via-secondary/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsQuickViewOpen(true)}
              className="quick-view-btn flex items-center gap-2 shadow-xl bg-white text-secondary hover:bg-primary hover:text-white transform hover:scale-105 transition-all duration-300"
            >
              <Eye className="h-4 w-4" />
              <span className="font-semibold">Quick View</span>
            </Button>
          </div>


        </div>

        <CardContent className="p-3 sm:p-4 relative">
          {/* Subtle gradient background on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative z-10">
            {/* Brand */}
            <p className="mb-0.5 sm:mb-1 text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-accent transition-colors duration-300 group-hover:text-primary">
              {product.brand}
            </p>

            {/* Title with hover effect */}
            <Link
              href={productUrl}
              className="block group/title"
              prefetch={true}
            >
              <h3 className="mb-1.5 sm:mb-2 line-clamp-2 text-xs sm:text-sm font-bold leading-tight text-secondary transition-colors duration-300 group-hover/title:text-primary">
                {product.name}
              </h3>
            </Link>

            {/* Rating with animation */}
            {displayRating > 0 && (
              <div className="mb-1.5 sm:mb-2 flex items-center gap-1 sm:gap-1.5">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 sm:h-3.5 sm:w-3.5 transition-all duration-200 ${
                        i < Math.floor(displayRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
                {displayReviewCount > 0 && (
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                    ({displayReviewCount})
                  </span>
                )}
              </div>
            )}

            {/* Finish Options with hover effect - hidden on mobile */}
            {finishes.length > 1 && (
              <div className="hidden sm:flex mb-3 items-center gap-2">
                <span className="text-xs text-muted-foreground">Finishes:</span>
                <div className="flex gap-1.5">
                  {finishes.map((color, i) => (
                    <div
                      key={i}
                      className="color-swatch h-5 w-5 rounded-full border-2 border-white shadow-md cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all duration-200"
                      style={{ backgroundColor: color }}
                      title={color === '#D4AF37' ? 'Gold Lacquer' : color === '#C0C0C0' ? 'Silver Plated' : 'Bronze'}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Pricing with highlight animation */}
            <div className="mb-2 sm:mb-3">
              <div className="flex items-baseline gap-1.5 sm:gap-2">
                <span className="price-highlight text-base sm:text-xl font-bold text-primary transition-all duration-300 group-hover:text-lg sm:group-hover:text-2xl">
                  ${product.price.toLocaleString()}
                </span>
                {product.retailPrice && (
                  <span className="text-[10px] sm:text-sm text-muted-foreground line-through decoration-red-400">
                    ${product.retailPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Add to Cart Button with ripple effect */}
            <Button
              className={`add-to-cart-btn w-full btn-ripple font-semibold tracking-wide transition-all duration-300 text-xs sm:text-sm h-8 sm:h-10 ${
                isAddingToCart ? 'scale-95 bg-green-500' : ''
              }`}
              onClick={handleAddToCart}
              disabled={!product.inStock || product.badge === 'out-of-stock' || isAddingToCart}
            >
              {isAddingToCart ? (
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                  <span className="hidden sm:inline">Adding...</span>
                </span>
              ) : !product.inStock || product.badge === 'out-of-stock' ? (
                'Out of Stock'
              ) : (
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Add to Cart
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <QuickViewModal
        product={product}
        open={isQuickViewOpen}
        onOpenChange={setIsQuickViewOpen}
      />
    </>
  )
}
