'use client'

import { useState } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getProductBySlug, products } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductCard } from '@/components/product/ProductCard'
import { useCartStore } from '@/lib/store/cart'
import { Star, ChevronRight } from 'lucide-react'

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }))
}

export default function ProductPage({
  params,
}: {
  params: { slug: string }
}) {
  const product = getProductBySlug(params.slug)
  const addItem = useCartStore((state) => state.addItem)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  if (!product) {
    notFound()
  }

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

  // Related products (same category)
  const relatedProducts = products
    .filter(
      (p) =>
        p.category === product.category &&
        p.id !== product.id &&
        p.inStock
    )
    .slice(0, 4)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center space-x-2 text-sm text-gray-600">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/shop" className="hover:text-primary">
          Shop
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-lg border bg-gray-100">
            <Image
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative h-24 w-24 flex-shrink-0 overflow-hidden rounded border-2 transition-colors ${
                    selectedImageIndex === index
                      ? 'border-primary'
                      : 'border-transparent hover:border-gray-300'
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
        <div className="space-y-6">
          <div>
            {product.badge && (
              <Badge variant={product.badge} className="mb-2">
                {product.badge === 'new' && 'New'}
                {product.badge === 'sale' && 'Sale'}
                {product.badge === 'limited' && 'Limited'}
              </Badge>
            )}
            <h1 className="text-4xl font-bold">{product.name}</h1>
            <div className="mt-2 flex items-center space-x-2">
              {product.rating && (
                <>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({product.rating}) {product.reviewCount} reviews
                  </span>
                </>
              )}
              <span className="text-sm text-gray-500">|</span>
              <span className="text-sm text-gray-500">SKU: {product.sku}</span>
            </div>
          </div>

          <div>
            {product.retailPrice && (
              <span className="mr-2 text-2xl text-gray-400 line-through">
                ${product.retailPrice.toFixed(2)}
              </span>
            )}
            <span className="text-4xl font-bold text-primary">
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
              <Button variant="outline" size="sm" className="mt-2">
                Calculate Payment
              </Button>
            </div>
          )}

          <div className="text-sm">
            {product.inStock ? (
              <span className="text-green-600 font-medium">
                In Stock - Ships within 2-3 business days
              </span>
            ) : (
              <span className="text-red-600 font-medium">Out of Stock</span>
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
              size="lg"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              Add to Cart
            </Button>
            <Button variant="outline" className="w-full" size="lg">
              Add to Wishlist
            </Button>
          </div>

          <div className="space-y-2 rounded-lg border bg-gray-50 p-4 text-sm">
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

      {/* Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specs">Specs</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="qa">Q&A</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6">
            <p className="text-gray-700">{product.description}</p>
            {product.included && (
              <div className="mt-6">
                <h3 className="mb-2 font-semibold">What's Included:</h3>
                <ul className="list-disc space-y-1 pl-6">
                  {product.included.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>
          <TabsContent value="specs" className="mt-6">
            {product.specs ? (
              <div className="space-y-2">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex border-b pb-2">
                    <span className="w-1/3 font-medium">{key}:</span>
                    <span className="text-gray-600">{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No specifications available.</p>
            )}
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-4">
              {product.rating && (
                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center">
                    <div className="text-3xl font-bold">{product.rating}</div>
                    <div className="ml-4">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor(product.rating || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">
                        Based on {product.reviewCount} reviews
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <p className="text-gray-600">
                Reviews feature coming soon. Check back later!
              </p>
            </div>
          </TabsContent>
          <TabsContent value="qa" className="mt-6">
            <p className="text-gray-600">Q&A feature coming soon.</p>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-bold">You May Also Like</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

