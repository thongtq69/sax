'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/lib/data'
import { getProducts, transformProduct } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductCard } from './ProductCard'
import { useCartStore } from '@/lib/store/cart'
import { Star, ChevronRight, Heart, Share2, Shield, Truck, CreditCard, Award, Minus, Plus, Check } from 'lucide-react'

interface ProductDetailClientProps {
  product: Product
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isAddedToCart, setIsAddedToCart] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    setIsLoaded(true)
    
    // Fetch related products
    async function fetchRelatedProducts() {
      try {
        const response = await getProducts({ 
          category: product.category,
          inStock: true,
          limit: 10 
        })
        const transformed = response.products
          .map(transformProduct)
          .filter((p) => p.id !== product.id && p.inStock)
          .slice(0, 4)
        setRelatedProducts(transformed)
      } catch (error) {
        console.error('Error fetching related products:', error)
      }
    }
    
    if (product.category) {
      fetchRelatedProducts()
    }
  }, [product.category, product.id])

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
    setTimeout(() => setIsAddedToCart(false), 2000)
  }

  const savings = product.retailPrice ? product.retailPrice - product.price : 0
  const savingsPercent = product.retailPrice ? Math.round((savings / product.retailPrice) * 100) : 0

  return (
    <div className={`transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Breadcrumb */}
      <nav className="mb-4 md:mb-6 flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-muted-foreground animate-fade-in overflow-x-auto pb-2">
        <Link href="/" className="hover:text-primary transition-colors whitespace-nowrap">Home</Link>
        <ChevronRight className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
        <Link href="/shop" className="hover:text-primary transition-colors whitespace-nowrap">Shop</Link>
        <ChevronRight className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
        <span className="capitalize whitespace-nowrap hidden sm:inline">{product.subcategory?.replace('-', ' ')}</span>
        <ChevronRight className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0 sm:hidden" />
        <span className="text-secondary font-medium truncate max-w-[120px] sm:max-w-[200px] whitespace-nowrap">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-6 md:gap-8 lg:gap-10 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="animate-fade-in-left">
          {/* Main Image */}
          <div className="relative aspect-square overflow-hidden rounded-xl md:rounded-2xl border-2 border-gray-100 bg-gradient-to-br from-gray-50 to-gray-100 group">
            <Image
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
            
            {/* Zoom hint */}
            <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
              Hover to zoom
            </div>

            {/* Badge */}
            {product.badge && (
              <div className="absolute top-4 left-4">
                <Badge 
                  variant={product.badge} 
                  className={`text-sm px-3 py-1 shadow-lg ${
                    product.badge === 'sale' ? 'animate-pulse-soft' : ''
                  }`}
                >
                  {product.badge === 'new' && '✨ New Arrival'}
                  {product.badge === 'sale' && `🔥 ${savingsPercent}% OFF`}
                  {product.badge === 'limited' && '⭐ Limited Edition'}
                </Badge>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="mt-3 md:mt-4 flex gap-2 md:gap-3 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative h-16 w-16 md:h-20 md:w-20 flex-shrink-0 overflow-hidden rounded-lg md:rounded-xl border-2 transition-all duration-300 ${
                    selectedImageIndex === index
                      ? 'border-primary shadow-lg scale-105 ring-2 ring-primary/30'
                      : 'border-gray-200 hover:border-primary/50 hover:shadow-md'
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
        <div className="space-y-4 md:space-y-6 animate-fade-in-right">
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

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 transition-all duration-200 ${
                        i < Math.floor(product.rating || 0)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-secondary">
                  {product.rating}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({product.reviewCount} reviews)
                </span>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
            <div className="flex items-baseline gap-2 md:gap-3 mb-2 flex-wrap">
              <span className="text-3xl md:text-4xl font-bold text-primary">
                ${product.price.toLocaleString()}
              </span>
              {product.retailPrice && (
                <>
                  <span className="text-lg md:text-xl text-gray-400 line-through">
                    ${product.retailPrice.toLocaleString()}
                  </span>
                  <Badge variant="destructive" className="animate-pulse text-xs md:text-sm">
                    Save ${savings.toLocaleString()}
                  </Badge>
                </>
              )}
            </div>

            {/* Financing */}
            {product.price > 500 && (
              <div className="flex items-center gap-2 mt-2 md:mt-3 text-xs md:text-sm">
                <CreditCard className="h-3.5 w-3.5 md:h-4 md:w-4 text-accent flex-shrink-0" />
                <span className="text-gray-600">
                  Or <span className="font-semibold text-accent">${(product.price / 12).toFixed(0)}/month</span> with 0% APR financing
                </span>
              </div>
            )}
          </div>

          {/* Stock Status */}
          <div className={`flex items-center gap-2 text-xs md:text-sm font-medium ${
            product.inStock ? 'text-green-600' : 'text-red-600'
          }`}>
            {product.inStock ? (
              <>
                <Check className="h-5 w-5" />
                <span>In Stock - Ships within 2-3 business days</span>
              </>
            ) : (
              <span>Currently Out of Stock</span>
            )}
            {product.stock && product.stock <= 5 && product.inStock && (
              <Badge variant="outline" className="ml-2 text-orange-600 border-orange-300 animate-pulse">
                Only {product.stock} left!
              </Badge>
            )}
          </div>

          {/* Quantity & Actions */}
          <div className="space-y-4">
            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600">Quantity:</span>
              <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="p-2 hover:bg-gray-100 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock || 10, q + 1))}
                  className="p-2 hover:bg-gray-100 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 md:gap-3">
              <Button
                size="lg"
                className={`flex-1 text-base md:text-lg font-semibold transition-all duration-300 ${
                  isAddedToCart 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'hover:shadow-lg hover:scale-[1.02]'
                }`}
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
                size="lg"
                variant="outline"
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`px-4 transition-all duration-300 ${
                  isWishlisted ? 'border-red-300 bg-red-50 text-red-500' : ''
                }`}
              >
                <Heart className={`h-5 w-5 transition-all ${isWishlisted ? 'fill-current scale-110' : ''}`} />
              </Button>
              
              <Button size="lg" variant="outline" className="px-4">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 gap-2 md:gap-4">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over $500' },
              { icon: Shield, title: '30-Day Returns', desc: 'Hassle-free policy' },
              { icon: Award, title: 'Pro Setup', desc: 'Included free' },
              { icon: CreditCard, title: '0% Financing', desc: '12 month terms' },
            ].map((item, i) => (
              <div 
                key={i} 
                className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg md:rounded-xl bg-gray-50 border transition-all duration-300 hover:shadow-md hover:border-primary/30"
                style={{ animationDelay: `${0.1 * i}s` }}
              >
                <div className="p-1.5 md:p-2 rounded-lg bg-primary/10 flex-shrink-0">
                  <item.icon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-xs md:text-sm text-secondary truncate">{item.title}</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground truncate">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-8 md:mt-12 lg:mt-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 gap-4 md:gap-8 overflow-x-auto">
            {['description', 'specs', 'reviews'].map((tab) => (
              <TabsTrigger 
                key={tab}
                value={tab} 
                className="relative capitalize text-sm md:text-base lg:text-lg pb-3 md:pb-4 px-2 md:px-0 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary font-medium text-gray-500 hover:text-gray-700 transition-colors whitespace-nowrap after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-300"
              >
                {tab === 'description' && '📝 '}
                {tab === 'specs' && '📋 '}
                {tab === 'reviews' && '⭐ '}
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="description" className="mt-4 md:mt-6 lg:mt-8 animate-fade-in">
            <div className="prose prose-sm md:prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed text-base md:text-lg">{product.description}</p>
              
              {product.included && (
                <div className="mt-6 md:mt-8 p-4 md:p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl md:rounded-2xl border border-green-100">
                  <h3 className="text-lg md:text-xl font-bold text-secondary mb-3 md:mb-4 flex items-center gap-2">
                    <span className="text-xl md:text-2xl">📦</span> What's Included
                  </h3>
                  <ul className="space-y-2">
                    {product.included.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 md:gap-3 text-sm md:text-base text-gray-700">
                        <Check className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
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
                    className={`flex flex-col sm:flex-row p-3 md:p-4 rounded-lg md:rounded-xl transition-all duration-300 hover:shadow-md ${
                      i % 2 === 0 ? 'bg-gray-50' : 'bg-white border'
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
              {product.rating && (
                <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 p-4 md:p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl md:rounded-2xl border border-amber-100">
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-bold text-secondary">{product.rating}</div>
                    <div className="flex mt-2 justify-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 md:h-5 md:w-5 ${
                            i < Math.floor(product.rating || 0)
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-gray-300 text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600 mt-1">
                      {product.reviewCount} reviews
                    </div>
                  </div>
                  
                  {/* Rating bars */}
                  <div className="flex-1 w-full sm:w-auto space-y-2">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const percentage = stars === 5 ? 75 : stars === 4 ? 20 : stars === 3 ? 5 : 0
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
                          <span className="text-xs md:text-sm text-gray-500 w-8 md:w-10">{percentage}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              
              <div className="text-center py-6 md:py-8 text-gray-500">
                <p className="mb-3 md:mb-4 text-sm md:text-base">Be the first to share your experience!</p>
                <Button variant="outline" size="sm" className="md:size-default">Write a Review</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12 md:mt-16 lg:mt-20 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-secondary">You May Also Like</h2>
              <p className="text-muted-foreground mt-1 text-sm md:text-base">Similar instruments you might love</p>
            </div>
            <Button variant="outline" asChild size="sm" className="hidden sm:flex">
              <Link href="/shop">View All →</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
