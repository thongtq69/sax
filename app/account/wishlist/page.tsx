'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Trash2, ShoppingBag, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SmartImage } from '@/components/ui/smart-image'
import { useCartStore } from '@/lib/store/cart'
import { getProductUrl } from '@/lib/api'

interface WishlistProduct {
  id: string
  name: string
  slug: string
  sku: string
  price: number
  retailPrice?: number
  images: string[]
  brand: string
  badge?: string
  inStock: boolean
  productType: string
  condition?: string
}

export default function WishlistPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<WishlistProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/account/wishlist')
      return
    }

    if (status === 'authenticated') {
      fetchWishlist()
    }
  }, [status, router])

  const fetchWishlist = async () => {
    try {
      const res = await fetch('/api/wishlist')
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (productId: string) => {
    setRemovingId(productId)
    try {
      const res = await fetch(`/api/wishlist/${productId}`, { method: 'DELETE' })
      if (res.ok) {
        setProducts(products.filter(p => p.id !== productId))
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    } finally {
      setRemovingId(null)
    }
  }

  const handleAddToCart = (product: WishlistProduct) => {
    addItem({
      id: `${product.id}-default`,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: product.price,
      image: product.images[0],
    })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/account" 
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Account
          </Link>
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-red-500 fill-current" />
            <h1 className="text-3xl font-bold text-secondary">My Wishlist</h1>
          </div>
          <p className="text-gray-600 mt-2">
            {products.length} {products.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {/* Wishlist Items */}
        {products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Start adding products you love!</p>
            <Link href="/shop">
              <Button className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {products.map((product) => (
              <div 
                key={product.id}
                className="bg-white rounded-xl shadow-sm p-4 flex gap-4 items-center hover:shadow-md transition-shadow"
              >
                {/* Product Image */}
                <Link href={getProductUrl(product.sku, product.slug)} className="shrink-0">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                    <SmartImage
                      src={product.images[0] || ''}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">
                    {product.brand}
                  </p>
                  <Link 
                    href={getProductUrl(product.sku, product.slug)}
                    className="block font-semibold text-secondary hover:text-primary transition-colors line-clamp-2"
                  >
                    {product.name}
                  </Link>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-lg font-bold text-primary">
                      ${product.price.toLocaleString()}
                    </span>
                    {product.retailPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        ${product.retailPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {!product.inStock && (
                    <span className="text-xs text-red-500 font-medium">Out of Stock</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock}
                    className="gap-2"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span className="hidden sm:inline">Add to Cart</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemove(product.id)}
                    disabled={removingId === product.id}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    {removingId === product.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
