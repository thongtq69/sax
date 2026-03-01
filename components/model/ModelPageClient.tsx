'use client'

import { type FormEvent, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Home, Star, ShoppingCart, Package, TrendingUp, Grid, List, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getProductUrl, getProducts, transformProduct } from '@/lib/api'
import type { Product } from '@/lib/data'
import { useCartStore } from '@/lib/store/cart'

interface ModelPageData {
    brand: string
    model: string
    products: Product[]
    priceRange: { min: number; max: number }
    inStockCount: number
    totalListings: number
    avgRating: number
    totalReviews: number
    representativeImage: string | null
    categories: string[]
    modelSpecs: Record<string, string>
}

interface ModelPageClientProps {
    data: ModelPageData
    brandSlug: string
    modelSlug: string
}

type SortOption = 'newest' | 'price-low' | 'price-high' | 'condition'
type PriceConditionFilter = 'all' | 'new' | 'mint' | 'excellent' | 'very-good' | 'good' | 'fair'

const conditionOrder: Record<string, number> = {
    'mint': 1,
    'excellent': 2,
    'very-good': 3,
    'good': 4,
    'fair': 5,
}

const conditionLabels: Record<string, string> = {
    'mint': 'Mint',
    'excellent': 'Excellent',
    'very-good': 'Very Good',
    'good': 'Good',
    'fair': 'Fair',
}

export function ModelPageClient({ data, brandSlug, modelSlug }: ModelPageClientProps) {
    const [sortBy, setSortBy] = useState<SortOption>('newest')
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
    const [compareIds, setCompareIds] = useState<string[]>([])
    const [similarProducts, setSimilarProducts] = useState<Product[]>([])
    const [isLoadingSimilar, setIsLoadingSimilar] = useState(true)
    const [priceConditionFilter, setPriceConditionFilter] = useState<PriceConditionFilter>('all')
    const addItem = useCartStore((state) => state.addItem)

    useEffect(() => {
        let active = true

        const fetchSimilarProducts = async () => {
            setIsLoadingSimilar(true)
            try {
                const result = await getProducts({ brand: data.brand, limit: 24 })
                if (!active) return

                const currentIds = new Set(data.products.map((p) => p.id))
                const normalizedModel = data.model.toLowerCase().trim()

                const candidates = result.products
                    .map(transformProduct)
                    .filter((p) => !currentIds.has(p.id))
                    .filter((p) => {
                        const pModel = ((p as any).subBrand || '').toLowerCase().trim()
                        return pModel !== normalizedModel
                    })

                setSimilarProducts(candidates.slice(0, 4))
            } catch {
                if (active) {
                    setSimilarProducts([])
                }
            } finally {
                if (active) {
                    setIsLoadingSimilar(false)
                }
            }
        }

        fetchSimilarProducts()

        return () => {
            active = false
        }
    }, [data.brand, data.model, data.products])

    const sortedProducts = useMemo(() => {
        const sorted = [...data.products]
        switch (sortBy) {
            case 'price-low':
                return sorted.sort((a, b) => a.price - b.price)
            case 'price-high':
                return sorted.sort((a, b) => b.price - a.price)
            case 'condition':
                return sorted.sort((a, b) => {
                    const aOrder = conditionOrder[(a as any).condition || ''] || 99
                    const bOrder = conditionOrder[(b as any).condition || ''] || 99
                    return aOrder - bOrder
                })
            case 'newest':
            default:
                return sorted
        }
    }, [data.products, sortBy])

    const handleAddToCart = (product: Product) => {
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
    }

    const featuredProduct = useMemo(() => {
        const inStockListing = sortedProducts.find((p) => ((p as any).stockStatus || 'in-stock') !== 'sold-out' && p.inStock)
        return inStockListing || sortedProducts[0] || null
    }, [sortedProducts])

    const listingsExcludingFeatured = useMemo(() => {
        if (!featuredProduct) return sortedProducts
        return sortedProducts.filter((p) => p.id !== featuredProduct.id)
    }, [featuredProduct, sortedProducts])

    const compareProducts = useMemo(() => {
        const lookup = new Map(sortedProducts.map((p) => [p.id, p]))
        return compareIds.map((id) => lookup.get(id)).filter(Boolean) as Product[]
    }, [compareIds, sortedProducts])

    const priceGuideProducts = useMemo(() => {
        if (priceConditionFilter === 'all') return data.products
        if (priceConditionFilter === 'new') {
            return data.products.filter((p) => (p as any).productType !== 'used')
        }
        return data.products.filter((p) => (p as any).condition === priceConditionFilter)
    }, [data.products, priceConditionFilter])

    const priceGuideStats = useMemo(() => {
        const prices = priceGuideProducts.map((p) => p.price).filter((price) => price > 0).sort((a, b) => a - b)
        if (prices.length === 0) {
            return { min: 0, median: 0, max: 0, sample: 0 }
        }

        const mid = Math.floor(prices.length / 2)
        const median = prices.length % 2 === 0 ? (prices[mid - 1] + prices[mid]) / 2 : prices[mid]

        return {
            min: prices[0],
            median,
            max: prices[prices.length - 1],
            sample: prices.length,
        }
    }, [priceGuideProducts])

    const toggleCompareProduct = (productId: string) => {
        setCompareIds((prev) => {
            if (prev.includes(productId)) {
                return prev.filter((id) => id !== productId)
            }
            if (prev.length >= 4) {
                return prev
            }
            return [...prev, productId]
        })
    }

    const clearCompare = () => setCompareIds([])

    const jumpLinks = [
        { href: '#listings', label: 'Listings' },
        { href: '#product-details', label: 'Product Details' },
        { href: '#price-guide', label: 'Price Guide' },
        { href: '#reviews-section', label: 'Reviews' },
    ]

    return (
        <div className="animate-fade-in scroll-smooth">
            {/* Breadcrumbs */}
            <div className="bg-muted/30 border-b">
                <div className="container mx-auto px-4 py-2 md:py-3">
                    <nav className="flex items-center gap-1.5 md:gap-2 text-[11px] sm:text-xs md:text-sm overflow-x-auto pb-1 leading-none">
                        <Link href="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 whitespace-nowrap">
                            <Home className="h-3 w-3 md:h-3.5 md:w-3.5" />
                            Home
                        </Link>
                        <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground/50 flex-shrink-0" />
                        <Link href={`/brand/${brandSlug}`} className="text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">
                            {data.brand}
                        </Link>
                            <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground/50 flex-shrink-0" />
                            <span className="text-secondary font-medium whitespace-nowrap" id="main-content">
                                {data.brand} {data.model}
                            </span>
                        </nav>
                </div>
            </div>

            {/* Model Header */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-6 md:py-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* Model Image */}
                        {data.representativeImage && (
                            <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 border border-border overflow-hidden bg-muted/30">
                                <Image
                                    src={data.representativeImage}
                                    alt={`${data.brand} ${data.model}`}
                                    width={80}
                                    height={80}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            {/* Model Name */}
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-secondary tracking-tight">
                                {data.brand} {data.model}
                            </h1>

                            {/* Categories */}
                            {data.categories.length > 0 && (
                                <p className="text-muted-foreground text-sm mt-1">
                                    {data.categories.join(' · ')}
                                </p>
                            )}
                        </div>

                        {/* Price Guide Badge */}
                        <div className="flex-shrink-0 border border-border bg-card p-4 md:p-5 text-center min-w-[200px]">
                            <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-2">
                                <TrendingUp className="h-3 w-3" />
                                Price Guide
                            </div>
                            <div className="text-xl md:text-2xl font-bold text-secondary">
                                {data.priceRange.min === data.priceRange.max ? (
                                    `$${data.priceRange.min.toLocaleString()}`
                                ) : (
                                    `$${data.priceRange.min.toLocaleString()}-$${data.priceRange.max.toLocaleString()}`
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Based on {data.totalListings} listing{data.totalListings !== 1 ? 's' : ''}
                            </p>
                            {data.avgRating > 0 && (
                                <div className="flex items-center justify-center gap-1 mt-2">
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`h-3.5 w-3.5 ${star <= Math.round(data.avgRating) ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-muted-foreground">({data.totalReviews})</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Jump Navigation */}
            <div className="border-b bg-white sticky top-0 z-20">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-0 overflow-x-auto">
                        {jumpLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="relative px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 text-muted-foreground hover:text-secondary border-transparent hover:border-muted-foreground/30"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Sections */}
            <div className="container mx-auto px-4 py-6 md:py-8">
                <section id="listings" className="scroll-mt-24">
                    <h2 className="text-2xl font-bold text-secondary mb-4">Listings</h2>

                    {featuredProduct && (
                        <FeaturedListing
                            product={featuredProduct}
                            onAddToCart={handleAddToCart}
                            isCompared={compareIds.includes(featuredProduct.id)}
                            onToggleCompare={toggleCompareProduct}
                        />
                    )}

                    <ListingsTab
                        products={listingsExcludingFeatured}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        onAddToCart={handleAddToCart}
                        inStockCount={data.inStockCount}
                        totalListings={data.totalListings}
                        compareIds={compareIds}
                        onToggleCompare={toggleCompareProduct}
                    />

                    <CompareSection products={compareProducts} onClear={clearCompare} />
                </section>

                <section id="product-details" className="scroll-mt-24 mt-12 pt-6 border-t">
                    <DetailsSection
                        brand={data.brand}
                        model={data.model}
                        specs={data.modelSpecs}
                        categories={data.categories}
                        products={data.products}
                        totalListings={data.totalListings}
                    />
                </section>

                <section id="price-guide" className="scroll-mt-24 mt-12 pt-6 border-t">
                    <PriceGuideSection
                        brand={data.brand}
                        model={data.model}
                        stats={priceGuideStats}
                        selectedFilter={priceConditionFilter}
                        onSelectFilter={setPriceConditionFilter}
                    />
                </section>

                <section id="reviews-section" className="scroll-mt-24 mt-12 pt-6 border-t">
                    <ReviewsTab
                        avgRating={data.avgRating}
                        totalReviews={data.totalReviews}
                        reviewTargetProductId={data.products[0]?.id || null}
                    />
                </section>

                <section className="mt-12 pt-6 border-t">
                    <SimilarProductsSection
                        brand={data.brand}
                        products={similarProducts}
                        isLoading={isLoadingSimilar}
                    />
                </section>
            </div>

            {compareIds.length > 0 && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2rem)] max-w-xl">
                    <div className="bg-secondary text-white shadow-xl border border-secondary/80 px-4 py-3 flex items-center justify-between gap-3">
                        <p className="text-sm">
                            Compare <span className="font-bold">{compareIds.length}</span>/4 listings
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-8 px-3 text-xs border-white/30 text-white hover:bg-white/10"
                                onClick={clearCompare}
                            >
                                Clear
                            </Button>
                            <a href="#compare-listings">
                                <Button type="button" className="h-8 px-3 text-xs bg-white text-secondary hover:bg-gray-100">
                                    Compare Now
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

/* ===================== Listings Tab ===================== */

function ListingsTab({
    products,
    sortBy,
    onSortChange,
    viewMode,
    onViewModeChange,
    onAddToCart,
    inStockCount,
    totalListings,
    compareIds,
    onToggleCompare,
}: {
    products: Product[]
    sortBy: SortOption
    onSortChange: (sort: SortOption) => void
    viewMode: 'list' | 'grid'
    onViewModeChange: (mode: 'list' | 'grid') => void
    onAddToCart: (product: Product) => void
    inStockCount: number
    totalListings: number
    compareIds: string[]
    onToggleCompare: (id: string) => void
}) {
    return (
        <div>
            {/* Sort & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-secondary">{totalListings}</span> listing{totalListings !== 1 ? 's' : ''}
                    {inStockCount > 0 && (
                        <span> · <span className="text-green-700 font-medium">{inStockCount} available</span></span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={sortBy}
                        onChange={(e) => onSortChange(e.target.value as SortOption)}
                        className="text-sm border border-border bg-white px-3 py-2 text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                        <option value="newest">Newest First</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="condition">Best Condition</option>
                    </select>
                    <div className="flex border border-border overflow-hidden">
                        <button
                            onClick={() => onViewModeChange('list')}
                            className={`p-2 ${viewMode === 'list' ? 'bg-secondary text-white' : 'bg-white text-muted-foreground hover:bg-muted/50'}`}
                        >
                            <List className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onViewModeChange('grid')}
                            className={`p-2 ${viewMode === 'grid' ? 'bg-secondary text-white' : 'bg-white text-muted-foreground hover:bg-muted/50'}`}
                        >
                            <Grid className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Products */}
            {viewMode === 'list' ? (
                <div className="space-y-4">
                    {products.map((product, index) => (
                        <ListingCard
                            key={product.id}
                            product={product}
                            onAddToCart={onAddToCart}
                            index={index}
                            isCompared={compareIds.includes(product.id)}
                            onToggleCompare={onToggleCompare}
                        />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map((product, index) => (
                        <GridCard
                            key={product.id}
                            product={product}
                            onAddToCart={onAddToCart}
                            index={index}
                            isCompared={compareIds.includes(product.id)}
                            onToggleCompare={onToggleCompare}
                        />
                    ))}
                </div>
            )}

            {products.length === 0 && (
                <div className="text-center py-16">
                    <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">No listings found for this model</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">Check back later for new inventory</p>
                </div>
            )}
        </div>
    )
}

/* ===================== Listing Card (List View) ===================== */

function ListingCard({
    product,
    onAddToCart,
    index,
    isCompared,
    onToggleCompare,
}: {
    product: Product
    onAddToCart: (p: Product) => void
    index: number
    isCompared: boolean
    onToggleCompare: (id: string) => void
}) {
    const productUrl = getProductUrl(product.sku, product.slug)
    const condition = (product as any).condition
    const conditionLabel = conditionLabels[condition] || null
    const productType = (product as any).productType || 'new'
    const stockStatus = (product as any).stockStatus || 'in-stock'
    const isSoldOut = stockStatus === 'sold-out'

    return (
        <div
            className="bg-white border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg group animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div className="flex flex-col sm:flex-row">
                {/* Image */}
                <Link href={productUrl} className="relative sm:w-48 md:w-56 lg:w-64 aspect-square sm:aspect-auto sm:h-auto flex-shrink-0 overflow-hidden bg-muted/30">
                    {product.images?.[0] ? (
                        <Image
                            src={product.images[0]}
                            alt={product.name}
                            width={256}
                            height={256}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full min-h-[200px] flex items-center justify-center">
                            <Package className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                    )}

                    {/* Badge */}
                    {product.badge && (
                        <div className="absolute top-2 left-2">
                            <span className="bg-primary text-white text-[10px] font-semibold px-2 py-1 uppercase tracking-wider">
                                {product.badge === 'new' ? 'New Arrival' :
                                    product.badge === 'sale' ? 'Special' :
                                        product.badge === 'rare' ? 'Limited' :
                                            product.badge}
                            </span>
                        </div>
                    )}
                </Link>

                {/* Content */}
                <div className="flex-1 p-4 md:p-5 flex flex-col">
                    <div className="flex-1">
                        <Link href={productUrl} className="block group-hover:text-primary transition-colors">
                            <h3 className="text-base md:text-lg font-semibold text-secondary line-clamp-2 leading-snug">
                                {product.name}
                            </h3>
                        </Link>

                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {/* Condition / Type */}
                            {productType === 'used' && conditionLabel && (
                                <span className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5">
                                    Used – {conditionLabel}
                                </span>
                            )}
                            {productType === 'new' && (
                                <span className="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5">
                                    New
                                </span>
                            )}
                        </div>

                        {/* Seller info */}
                        <div className="flex items-center gap-2 mt-3 text-sm">
                            <div className="w-7 h-7 bg-secondary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-secondary">JSC</span>
                            </div>
                            <div>
                                <span className="font-medium text-secondary text-xs">James Sax Corner</span>
                                <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mt-4 pt-4 border-t border-border/50">
                        <div>
                            <div className="text-xl md:text-2xl font-bold text-secondary">
                                ${product.price.toLocaleString()}
                            </div>
                            {product.shippingCost && product.shippingCost > 0 ? (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    + ${product.shippingCost.toLocaleString()} Shipping
                                </p>
                            ) : (
                                <p className="text-xs text-green-700 mt-0.5 font-medium">Free Shipping</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2 w-full sm:w-auto">
                            {!isSoldOut ? (
                                <>
                                    <Button
                                        onClick={() => onAddToCart(product)}
                                        className="w-full sm:w-auto bg-secondary hover:bg-secondary/90 text-white font-medium px-6 py-2 text-sm"
                                    >
                                        <ShoppingCart className="h-4 w-4 mr-2" />
                                        Add to Cart
                                    </Button>
                                    <Link href={`/inquiry?product=${encodeURIComponent(product.name)}&sku=${encodeURIComponent(product.sku)}`}>
                                        <Button variant="outline" className="w-full text-sm border-secondary/30 text-secondary hover:bg-secondary/5">
                                            Make an Offer
                                        </Button>
                                    </Link>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className={`w-full text-xs ${isCompared ? 'border-secondary bg-secondary/5 text-secondary' : 'border-border text-muted-foreground'}`}
                                        onClick={() => onToggleCompare(product.id)}
                                    >
                                        {isCompared ? <Check className="h-3.5 w-3.5 mr-1" /> : null}
                                        {isCompared ? 'Compared' : 'Compare'}
                                    </Button>
                                </>
                            ) : (
                                <span className="text-sm font-medium text-red-600 bg-red-50 px-4 py-2 text-center border border-red-200">
                                    Sold Out
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ===================== Grid Card ===================== */

function GridCard({
    product,
    onAddToCart,
    index,
    isCompared,
    onToggleCompare,
}: {
    product: Product
    onAddToCart: (p: Product) => void
    index: number
    isCompared: boolean
    onToggleCompare: (id: string) => void
}) {
    const productUrl = getProductUrl(product.sku, product.slug)
    const condition = (product as any).condition
    const conditionLabel = conditionLabels[condition] || null
    const productType = (product as any).productType || 'new'
    const stockStatus = (product as any).stockStatus || 'in-stock'
    const isSoldOut = stockStatus === 'sold-out'

    return (
        <div
            className="bg-white border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg group animate-fade-in-up flex flex-col"
            style={{ animationDelay: `${index * 80}ms` }}
        >
            {/* Image */}
            <Link href={productUrl} className="relative aspect-square overflow-hidden bg-muted/30">
                {product.images?.[0] ? (
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                )}

                {product.badge && (
                    <div className="absolute top-2 left-2">
                        <span className="bg-primary text-white text-[9px] font-semibold px-2 py-0.5 uppercase tracking-wider">
                            {product.badge === 'new' ? 'New' :
                                product.badge === 'sale' ? 'Special' :
                                    product.badge}
                        </span>
                    </div>
                )}

                {isSoldOut && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white font-bold text-sm bg-red-600 px-3 py-1">SOLD</span>
                    </div>
                )}
            </Link>

            {/* Content */}
            <div className="p-3 flex-1 flex flex-col">
                <Link href={productUrl}>
                    <h3 className="text-sm font-semibold text-secondary line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                        {product.name}
                    </h3>
                </Link>

                <div className="flex items-center gap-1.5 mt-1.5">
                    {productType === 'used' && conditionLabel && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5">
                            {conditionLabel}
                        </span>
                    )}
                    {productType === 'new' && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5">
                            New
                        </span>
                    )}
                </div>

                <div className="mt-auto pt-3">
                    <div className="text-lg font-bold text-secondary">${product.price.toLocaleString()}</div>
                    {product.shippingCost && product.shippingCost > 0 ? (
                        <p className="text-[10px] text-muted-foreground">+ ${product.shippingCost.toLocaleString()} ship</p>
                    ) : (
                        <p className="text-[10px] text-green-700 font-medium">Free Shipping</p>
                    )}

                    {!isSoldOut && (
                        <>
                            <Button
                                onClick={() => onAddToCart(product)}
                                size="sm"
                                className="w-full mt-2 bg-secondary hover:bg-secondary/90 text-white text-xs"
                            >
                                Add to Cart
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => onToggleCompare(product.id)}
                                className={`w-full mt-2 text-xs ${isCompared ? 'border-secondary bg-secondary/5 text-secondary' : ''}`}
                            >
                                {isCompared ? <Check className="h-3.5 w-3.5 mr-1" /> : null}
                                {isCompared ? 'Compared' : 'Compare'}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

function FeaturedListing({
    product,
    onAddToCart,
    isCompared,
    onToggleCompare,
}: {
    product: Product
    onAddToCart: (p: Product) => void
    isCompared: boolean
    onToggleCompare: (id: string) => void
}) {
    const productUrl = getProductUrl(product.sku, product.slug)
    const stockStatus = (product as any).stockStatus || 'in-stock'
    const isSoldOut = stockStatus === 'sold-out'

    return (
        <div className="border border-border bg-white p-4 md:p-5 mb-6">
            <p className="text-sm font-semibold text-muted-foreground mb-3">Featured Listing</p>
            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 md:gap-6">
                <Link href={productUrl} className="aspect-square bg-muted/30 overflow-hidden border border-border">
                    {product.images?.[0] ? (
                        <Image src={product.images[0]} alt={product.name} width={500} height={500} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                    )}
                </Link>

                <div className="flex flex-col">
                    <Link href={productUrl} className="text-lg font-semibold text-secondary hover:text-primary transition-colors">
                        {product.name}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{product.description}</p>

                    <div className="mt-4 flex items-center gap-4 flex-wrap">
                        <p className="text-2xl font-bold text-secondary">${product.price.toLocaleString()}</p>
                        {product.shippingCost && product.shippingCost > 0 ? (
                            <p className="text-sm text-muted-foreground">+ ${product.shippingCost.toLocaleString()} shipping</p>
                        ) : (
                            <p className="text-sm text-green-700 font-medium">Free Shipping</p>
                        )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {!isSoldOut && (
                            <Button className="bg-secondary hover:bg-secondary/90 text-white" onClick={() => onAddToCart(product)}>
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Add to Cart
                            </Button>
                        )}
                        <Button variant="outline" onClick={() => onToggleCompare(product.id)}>
                            {isCompared ? <Check className="h-4 w-4 mr-2" /> : null}
                            {isCompared ? 'Compared' : 'Compare'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function CompareSection({ products, onClear }: { products: Product[]; onClear: () => void }) {
    if (products.length < 2) {
        return null
    }

    return (
        <div id="compare-listings" className="mt-8 border border-border bg-white p-4 md:p-5 scroll-mt-24">
            <div className="flex items-center justify-between gap-2 mb-4">
                <h3 className="text-lg font-bold text-secondary">Compare Listings</h3>
                <Button variant="ghost" size="sm" onClick={onClear}>
                    <X className="h-4 w-4 mr-1" /> Clear
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left p-3 text-xs uppercase text-muted-foreground font-semibold">Field</th>
                            {products.map((product) => (
                                <th key={product.id} className="text-left p-3 text-sm font-semibold text-secondary">
                                    <Link href={getProductUrl(product.sku, product.slug)} className="hover:text-primary transition-colors">
                                        {product.sku}
                                    </Link>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <CompareRow
                            label="Price"
                            values={products.map((p) => `$${p.price.toLocaleString()}`)}
                        />
                        <CompareRow
                            label="Condition"
                            values={products.map((p) => (p as any).productType === 'used' ? (conditionLabels[(p as any).condition || ''] || 'Used') : 'New')}
                        />
                        <CompareRow
                            label="Shipping"
                            values={products.map((p) => p.shippingCost && p.shippingCost > 0 ? `$${p.shippingCost.toLocaleString()}` : 'Free')}
                        />
                        <CompareRow
                            label="Availability"
                            values={products.map((p) => ((p as any).stockStatus || 'in-stock') === 'sold-out' ? 'Sold Out' : 'Available')}
                        />
                        <CompareRow
                            label="Serial"
                            values={products.map((p) => p.sku)}
                        />
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function CompareRow({ label, values }: { label: string; values: string[] }) {
    return (
        <tr className="border-b last:border-0">
            <td className="p-3 text-sm text-muted-foreground font-medium">{label}</td>
            {values.map((value, index) => (
                <td key={`${label}-${index}`} className="p-3 text-sm text-secondary">{value}</td>
            ))}
        </tr>
    )
}

function DetailsSection({ brand, model, specs, categories, products, totalListings }: {
    brand: string
    model: string
    specs: Record<string, string>
    categories: string[]
    products: Product[]
    totalListings: number
}) {
    const specEntries = Object.entries(specs).filter(([_, value]) => value)
    const galleryImages = Array.from(new Set(products.flatMap((p) => p.images || []))).slice(0, 6)

    return (
        <div>
            <h2 className="text-2xl font-bold text-secondary mb-4">Product Details</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-border bg-white p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Gallery</h3>
                    {galleryImages.length > 0 ? (
                        <>
                            <div className="aspect-square border border-border overflow-hidden bg-muted/20 mb-3">
                                <Image src={galleryImages[0]} alt={`${brand} ${model}`} width={800} height={800} className="w-full h-full object-cover" />
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {galleryImages.slice(1, 5).map((img, idx) => (
                                    <div key={img} className="aspect-square border border-border overflow-hidden bg-muted/20">
                                        <Image src={img} alt={`${brand} ${model} image ${idx + 2}`} width={200} height={200} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="aspect-square border border-border bg-muted/20 flex items-center justify-center">
                            <Package className="h-10 w-10 text-muted-foreground/40" />
                        </div>
                    )}
                </div>

                <div className="border border-border bg-white p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Product Specs</h3>
                    <div className="space-y-0">
                        <SpecRow label="Brand" value={brand} />
                        <SpecRow label="Model" value={model} />
                        <SpecRow label="Categories" value={categories.join(', ')} />
                        <SpecRow label="Listings" value={String(totalListings)} />

                        {specEntries.map(([key, value]) => (
                            <SpecRow key={key} label={key} value={value} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

function SpecRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border/50 last:border-0 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium text-secondary text-right max-w-[65%]">{value || '-'}</span>
        </div>
    )
}

function PriceGuideSection({
    brand,
    model,
    stats,
    selectedFilter,
    onSelectFilter,
}: {
    brand: string
    model: string
    stats: { min: number; median: number; max: number; sample: number }
    selectedFilter: PriceConditionFilter
    onSelectFilter: (value: PriceConditionFilter) => void
}) {
    const filters: { key: PriceConditionFilter; label: string }[] = [
        { key: 'all', label: 'All' },
        { key: 'new', label: 'New' },
        { key: 'mint', label: 'Mint' },
        { key: 'excellent', label: 'Excellent' },
        { key: 'very-good', label: 'Very Good' },
        { key: 'good', label: 'Good' },
        { key: 'fair', label: 'Fair' },
    ]

    return (
        <div>
            <h2 className="text-2xl font-bold text-secondary mb-4">Price Guide</h2>
            <div className="border border-border bg-white p-4 md:p-5">
                <p className="text-sm text-muted-foreground mb-4">
                    Estimated value for {brand} {model} based on available listings.
                </p>

                <div className="flex flex-wrap gap-2 mb-5">
                    {filters.map((filter) => (
                        <button
                            key={filter.key}
                            type="button"
                            onClick={() => onSelectFilter(filter.key)}
                            className={`px-3 py-1.5 text-xs border transition-colors ${selectedFilter === filter.key
                                ? 'bg-secondary text-white border-secondary'
                                : 'bg-white text-secondary border-border hover:border-secondary/50'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <StatCard label="Low" value={stats.min > 0 ? `$${stats.min.toLocaleString()}` : '-'} />
                    <StatCard label="Typical" value={stats.median > 0 ? `$${Math.round(stats.median).toLocaleString()}` : '-'} />
                    <StatCard label="High" value={stats.max > 0 ? `$${stats.max.toLocaleString()}` : '-'} />
                </div>

                <p className="text-xs text-muted-foreground mt-4">
                    Sample size: {stats.sample} listing{stats.sample !== 1 ? 's' : ''}. Excludes shipping and tax.
                </p>
            </div>
        </div>
    )
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="border border-border bg-muted/10 px-4 py-3">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
            <p className="text-xl font-bold text-secondary mt-1">{value}</p>
        </div>
    )
}

function SimilarProductsSection({ brand, products, isLoading }: { brand: string; products: Product[]; isLoading: boolean }) {
    return (
        <div>
            <h2 className="text-2xl font-bold text-secondary mb-4">Similar Products</h2>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="border border-border bg-white p-3 animate-pulse">
                            <div className="aspect-square bg-muted/30 mb-3" />
                            <div className="h-3 bg-muted/30 mb-2" />
                            <div className="h-3 w-2/3 bg-muted/30 mb-3" />
                            <div className="h-4 w-1/2 bg-muted/30" />
                        </div>
                    ))}
                </div>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {products.map((product) => {
                        const url = getProductUrl(product.sku, product.slug)
                        return (
                            <Link key={product.id} href={url} className="border border-border bg-white hover:border-primary/40 transition-colors">
                                <div className="aspect-square bg-muted/20 overflow-hidden">
                                    {product.images?.[0] ? (
                                        <Image src={product.images[0]} alt={product.name} width={500} height={500} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="h-8 w-8 text-muted-foreground/30" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-3">
                                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{brand}</p>
                                    <h3 className="text-sm font-semibold text-secondary line-clamp-2 mt-1">{product.name}</h3>
                                    <p className="text-base font-bold text-secondary mt-2">${product.price.toLocaleString()}</p>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            ) : (
                <div className="border border-border bg-white p-4 text-sm text-muted-foreground">
                    No similar products available right now.
                </div>
            )}
        </div>
    )
}

/* ===================== Reviews Tab ===================== */

function ReviewsTab({
    avgRating,
    totalReviews,
    reviewTargetProductId,
}: {
    avgRating: number
    totalReviews: number
    reviewTargetProductId: string | null
}) {
    const [rating, setRating] = useState(5)
    const [hoverRating, setHoverRating] = useState(0)
    const [reviewTitle, setReviewTitle] = useState('')
    const [reviewBody, setReviewBody] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [localReviewCount, setLocalReviewCount] = useState(totalReviews)
    const [localAvgRating, setLocalAvgRating] = useState(avgRating)

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!reviewTargetProductId) {
            setSubmitMessage({ type: 'error', text: 'Cannot submit review right now. Please try again later.' })
            return
        }

        if (!reviewBody.trim()) {
            setSubmitMessage({ type: 'error', text: 'Please write your review before posting.' })
            return
        }

        setIsSubmitting(true)
        setSubmitMessage(null)

        try {
            const message = reviewTitle.trim()
                ? `${reviewTitle.trim()}\n\n${reviewBody.trim()}`
                : reviewBody.trim()

            const response = await fetch(`/api/products/${reviewTargetProductId}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    buyerName: 'Guest Reviewer',
                    rating,
                    message,
                    date: new Date().toISOString(),
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to submit review')
            }

            const nextCount = localReviewCount + 1
            const nextAvg = nextCount > 0
                ? ((localAvgRating * localReviewCount) + rating) / nextCount
                : rating

            setLocalReviewCount(nextCount)
            setLocalAvgRating(Math.round(nextAvg * 10) / 10)
            setReviewTitle('')
            setReviewBody('')
            setRating(5)
            setHoverRating(0)
            setSubmitMessage({ type: 'success', text: 'Review submitted successfully.' })
        } catch {
            setSubmitMessage({ type: 'error', text: 'Failed to submit review. Please try again.' })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div>
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-8">Product reviews</h2>

            {localReviewCount === 0 ? (
                <p className="text-lg md:text-2xl text-secondary/85 mb-10">There are currently no reviews for this product.</p>
            ) : (
                <div className="mb-10 border border-border bg-white p-6">
                    <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`h-6 w-6 ${star <= Math.round(localAvgRating) ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`}
                            />
                        ))}
                    </div>
                    <p className="text-2xl font-bold text-secondary">{localAvgRating || 0}</p>
                    <p className="text-base text-muted-foreground mt-1">
                        Based on {localReviewCount} review{localReviewCount !== 1 ? 's' : ''}
                    </p>
                </div>
            )}

            <div className="max-w-none">
                <h3 className="text-2xl md:text-3xl font-bold text-secondary mb-5">Write a Product Review</h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <p className="text-xl md:text-2xl font-semibold text-secondary mb-2">Your Rating</p>
                        <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => {
                                const isActive = star <= (hoverRating || rating)
                                return (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="transition-transform hover:scale-110"
                                        aria-label={`Rate ${star} stars`}
                                    >
                                        <Star className={`h-7 w-7 md:h-8 md:w-8 ${isActive ? 'text-black fill-black' : 'text-gray-400'}`} />
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="review-title" className="block text-xl md:text-2xl font-semibold text-secondary mb-2">
                            Review Title
                        </label>
                        <input
                            id="review-title"
                            type="text"
                            value={reviewTitle}
                            onChange={(e) => setReviewTitle(e.target.value)}
                            className="w-full h-12 md:h-14 border border-secondary/40 px-4 text-base md:text-lg outline-none focus:border-secondary"
                        />
                    </div>

                    <div>
                        <label htmlFor="review-body" className="block text-xl md:text-2xl font-semibold text-secondary mb-2">
                            Your Product Review <span className="text-red-600">*</span>
                        </label>
                        <textarea
                            id="review-body"
                            value={reviewBody}
                            onChange={(e) => setReviewBody(e.target.value)}
                            required
                            rows={5}
                            className="w-full border border-secondary/40 px-4 py-3 text-base md:text-lg outline-none focus:border-secondary resize-y"
                        />
                    </div>

                    <div>
                        <Button type="submit" disabled={isSubmitting} className="h-12 md:h-14 px-8 md:px-10 rounded-full text-lg md:text-xl font-bold bg-secondary hover:bg-secondary/90 disabled:opacity-60">
                            {isSubmitting ? 'Posting...' : 'Post Review'}
                        </Button>
                    </div>

                    {submitMessage && (
                        <p className={`text-sm md:text-base ${submitMessage.type === 'success' ? 'text-green-700' : 'text-red-600'}`}>
                            {submitMessage.text}
                        </p>
                    )}
                </form>

                <div className="mt-8">
                    <p className="text-xl md:text-2xl font-bold text-secondary">
                        Review Tips <span className="text-blue-700 text-lg md:text-xl font-semibold">(see all)</span>
                    </p>
                    <ul className="mt-3 space-y-1 text-base md:text-xl text-secondary/90">
                        <li>✓ Do: talk about how it sounds, mention pros and cons, and compare it to other products.</li>
                        <li>✕ Don&apos;t: review a seller, your shipping experience, or include offensive content.</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
