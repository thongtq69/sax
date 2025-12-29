'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Eye } from 'lucide-react'
import { Product } from '@/lib/data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { QuickViewModal } from './QuickViewModal'
import { useCartStore } from '@/lib/store/cart'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  const [imageHover, setImageHover] = useState(false)
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
  }

  return (
    <>
      <Card className="group relative overflow-hidden transition-shadow hover:shadow-lg">
        <div
          className="relative aspect-square overflow-hidden bg-gray-100"
          onMouseEnter={() => setImageHover(true)}
          onMouseLeave={() => setImageHover(false)}
        >
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-300 ${
              imageHover ? 'scale-110' : 'scale-100'
            }`}
          />
          {product.badge && (
            <Badge
              variant={product.badge}
              className="absolute right-2 top-2"
            >
              {product.badge === 'new' && 'New'}
              {product.badge === 'sale' && 'Sale'}
              {product.badge === 'limited' && 'Limited'}
              {product.badge === 'coming-soon' && 'Coming Soon'}
              {product.badge === 'out-of-stock' && 'Out of Stock'}
            </Badge>
          )}
          <div
            className={`absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100`}
          >
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsQuickViewOpen(true)}
              className="flex items-center space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span>Quick View</span>
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          <Link
            href={`/product/${product.slug}`}
            className="block hover:text-primary"
          >
            <h3 className="mb-1 line-clamp-2 font-medium">{product.name}</h3>
            <p className="mb-2 text-sm text-gray-500">{product.brand}</p>
          </Link>

          <div className="mb-2">
            {product.retailPrice && (
              <span className="mr-2 text-sm text-gray-400 line-through">
                ${product.retailPrice.toFixed(2)}
              </span>
            )}
            <span className="text-lg font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
          </div>

          {product.price > 500 && (
            <div className="mb-3 text-xs text-gray-600">
              Financing starting at ${(product.price / 12).toFixed(2)}/month
            </div>
          )}

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

