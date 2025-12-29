'use client'

import { useState } from 'react'
import Image from 'next/image'
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
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-default`,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.images[0],
    })
    // Optionally close modal or show toast
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-square overflow-hidden rounded-lg border bg-gray-100">
              <Image
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="mt-4 flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded border-2 ${
                      selectedImageIndex === index
                        ? 'border-primary'
                        : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center space-x-2">
                {product.badge && (
                  <Badge variant={product.badge}>
                    {product.badge === 'new' && 'New'}
                    {product.badge === 'sale' && 'Sale'}
                    {product.badge === 'limited' && 'Limited'}
                  </Badge>
                )}
                <span className="text-sm text-gray-500">SKU: {product.sku}</span>
              </div>
              <h2 className="text-2xl font-bold">{product.name}</h2>
              <p className="text-gray-600">{product.brand}</p>
            </div>

            <div>
              {product.retailPrice && (
                <span className="mr-2 text-lg text-gray-400 line-through">
                  ${product.retailPrice.toFixed(2)}
                </span>
              )}
              <span className="text-3xl font-bold text-primary">
                ${product.price.toFixed(2)}
              </span>
            </div>

            {product.price > 500 && (
              <div className="rounded-lg border bg-gray-50 p-4">
                <div className="font-semibold">Financing Available</div>
                <div className="text-sm text-gray-600">
                  Starting at ${(product.price / 12).toFixed(2)}/month
                  <br />
                  <span className="text-xs">(12 mo @ 0% APR)</span>
                </div>
              </div>
            )}

            <div className="text-sm">
              {product.inStock ? (
                <span className="text-green-600">In Stock</span>
              ) : (
                <span className="text-red-600">Out of Stock</span>
              )}
              {product.stock && product.stock < 5 && (
                <span className="ml-2 text-orange-600">
                  - Only {product.stock} left
                </span>
              )}
            </div>

            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                Add to Cart
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/product/${product.slug}`}>View Full Details</Link>
              </Button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span>Free shipping on orders over $500</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span>30-day return policy</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span>Professional setup included</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

