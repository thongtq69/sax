'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, Star } from 'lucide-react'
import { Product } from '@/lib/data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { QuickViewModal } from './QuickViewModal'
import { useCartStore } from '@/lib/store/cart'

interface ProductCardProps {
  product: Product
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

export function ProductCard({ product }: ProductCardProps) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  const [imageHover, setImageHover] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  const finishes = getProductFinishes(product.id)
  const monthlyPayment = product.price > 500 ? (product.price / 12).toFixed(0) : null
  const savings = product.retailPrice ? product.retailPrice - product.price : 0

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-default`,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.images[0],
    })
  }

  return (
    <>
      <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border">
        <div
          className="relative aspect-square overflow-hidden bg-gray-50"
          onMouseEnter={() => setImageHover(true)}
          onMouseLeave={() => setImageHover(false)}
        >
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-500 ${imageHover ? 'scale-110' : 'scale-100'
              }`}
          />

          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {product.badge && (
              <Badge
                variant={product.badge}
                className="shadow-sm"
              >
                {product.badge === 'new' && 'New'}
                {product.badge === 'sale' && `Save $${savings.toFixed(0)}`}
                {product.badge === 'limited' && 'Limited'}
                {product.badge === 'coming-soon' && 'Coming Soon'}
                {product.badge === 'out-of-stock' && 'Out of Stock'}
              </Badge>
            )}
          </div>

          {/* Quick View Overlay */}
          <div
            className={`absolute inset-0 flex items-center justify-center bg-primary/60 opacity-0 transition-opacity group-hover:opacity-100`}
          >
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsQuickViewOpen(true)}
              className="flex items-center space-x-2 shadow-lg"
            >
              <Eye className="h-4 w-4" />
              <span>Quick View</span>
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Brand */}
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {product.brand}
          </p>

          {/* Title */}
          <Link
            href={`/product/${product.slug}`}
            className="block hover:text-primary transition-colors"
          >
            <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-tight">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          {product.rating && (
            <div className="mb-2 flex items-center gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i < Math.floor(product.rating || 0)
                        ? 'fill-secondary text-secondary'
                        : 'fill-gray-200 text-gray-200'
                      }`}
                  />
                ))}
              </div>
              {product.reviewCount && (
                <span className="text-xs text-muted-foreground">
                  ({product.reviewCount})
                </span>
              )}
            </div>
          )}

          {/* Finish Options */}
          {finishes.length > 1 && (
            <div className="mb-2 flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Finishes:</span>
              <div className="flex gap-1">
                {finishes.map((color, i) => (
                  <div
                    key={i}
                    className="h-4 w-4 rounded-full border border-gray-300 shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color === '#D4AF37' ? 'Gold Lacquer' : color === '#C0C0C0' ? 'Silver Plated' : 'Bronze'}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="mb-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-primary">
                ${product.price.toLocaleString()}
              </span>
              {product.retailPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ${product.retailPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Financing */}
            {monthlyPayment && (
              <p className="mt-1 text-xs text-accent font-medium">
                Or ${monthlyPayment}/mo with 0% APR
              </p>
            )}
          </div>

          {/* Stock Status */}
          {product.inStock && product.stock && product.stock <= 3 && (
            <p className="mb-2 text-xs text-destructive font-medium">
              Only {product.stock} left in stock!
            </p>
          )}

          {/* Add to Cart */}
          <Button
            className="w-full"
            onClick={handleAddToCart}
            disabled={!product.inStock || product.badge === 'out-of-stock'}
          >
            {!product.inStock || product.badge === 'out-of-stock'
              ? 'Out of Stock'
              : 'Add to Cart'}
          </Button>
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
