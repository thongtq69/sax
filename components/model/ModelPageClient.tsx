'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Home, Star, Eye, Heart, ShoppingCart, Tag, Package, TrendingUp, Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getProductUrl } from '@/lib/api'
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

type TabType = 'listings' | 'details' | 'reviews'
type SortOption = 'newest' | 'price-low' | 'price-high' | 'condition'

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
    const [activeTab, setActiveTab] = useState<TabType>('listings')
    const [sortBy, setSortBy] = useState<SortOption>('newest')
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
    const addItem = useCartStore((state) => state.addItem)

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

    const tabs: { key: TabType; label: string; count?: number }[] = [
        { key: 'listings', label: 'Listings', count: data.totalListings },
        { key: 'details', label: 'Product Details' },
        ...(data.totalReviews > 0 ? [{ key: 'reviews' as TabType, label: 'Reviews', count: data.totalReviews }] : []),
    ]

    return (
        <div className="animate-fade-in">
            {/* Breadcrumbs */}
            <div className="bg-muted/30 border-b">
                <div className="container mx-auto px-4 py-2 md:py-3">
                    <nav className="flex items-center gap-1.5 md:gap-2 text-[11px] sm:text-xs md:text-sm overflow-x-auto pb-1 leading-none">
                        <Link href="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 whitespace-nowrap">
                            <Home className="h-3 w-3 md:h-3.5 md:w-3.5" />
                            Home
                        </Link>
                        <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground/50 flex-shrink-0" />
                        <Link href={`/shop?brand=${encodeURIComponent(data.brand)}`} className="text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">
                            {data.brand}
                        </Link>
                        <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground/50 flex-shrink-0" />
                        <span className="text-secondary font-medium whitespace-nowrap">
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

            {/* Tabs Navigation */}
            <div className="border-b bg-white sticky top-0 z-20">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-0 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`relative px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${activeTab === tab.key
                                    ? 'text-secondary border-secondary'
                                    : 'text-muted-foreground hover:text-secondary border-transparent hover:border-muted-foreground/30'
                                    }`}
                            >
                                {tab.label}
                                {tab.count !== undefined && (
                                    <span className={`ml-1.5 text-xs ${activeTab === tab.key ? 'text-secondary' : 'text-muted-foreground'}`}>
                                        ({tab.count})
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="container mx-auto px-4 py-6 md:py-8">
                {activeTab === 'listings' && (
                    <ListingsTab
                        products={sortedProducts}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        onAddToCart={handleAddToCart}
                        inStockCount={data.inStockCount}
                        totalListings={data.totalListings}
                    />
                )}

                {activeTab === 'details' && (
                    <DetailsTab
                        brand={data.brand}
                        model={data.model}
                        specs={data.modelSpecs}
                        categories={data.categories}
                        priceRange={data.priceRange}
                        totalListings={data.totalListings}
                    />
                )}

                {activeTab === 'reviews' && (
                    <ReviewsTab
                        avgRating={data.avgRating}
                        totalReviews={data.totalReviews}
                    />
                )}
            </div>
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
}: {
    products: Product[]
    sortBy: SortOption
    onSortChange: (sort: SortOption) => void
    viewMode: 'list' | 'grid'
    onViewModeChange: (mode: 'list' | 'grid') => void
    onAddToCart: (product: Product) => void
    inStockCount: number
    totalListings: number
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
                        <ListingCard key={product.id} product={product} onAddToCart={onAddToCart} index={index} />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map((product, index) => (
                        <GridCard key={product.id} product={product} onAddToCart={onAddToCart} index={index} />
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

function ListingCard({ product, onAddToCart, index }: { product: Product; onAddToCart: (p: Product) => void; index: number }) {
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

function GridCard({ product, onAddToCart, index }: { product: Product; onAddToCart: (p: Product) => void; index: number }) {
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
                        <Button
                            onClick={() => onAddToCart(product)}
                            size="sm"
                            className="w-full mt-2 bg-secondary hover:bg-secondary/90 text-white text-xs"
                        >
                            Add to Cart
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

/* ===================== Details Tab ===================== */

function DetailsTab({ brand, model, specs, categories, priceRange, totalListings }: {
    brand: string; model: string; specs: Record<string, string>; categories: string[]; priceRange: { min: number; max: number }; totalListings: number
}) {
    const specEntries = Object.entries(specs).filter(([_, value]) => value)

    return (
        <div className="max-w-3xl">
            <h2 className="text-xl font-bold text-secondary mb-6">
                About the {brand} {model}
            </h2>

            {/* Overview */}
            <div className="bg-white border border-border p-6 mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Overview</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between py-2 border-b border-border/50">
                        <span className="text-muted-foreground">Brand</span>
                        <span className="font-medium text-secondary">{brand}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/50">
                        <span className="text-muted-foreground">Model</span>
                        <span className="font-medium text-secondary">{model}</span>
                    </div>
                    {categories.length > 0 && (
                        <div className="flex justify-between py-2 border-b border-border/50">
                            <span className="text-muted-foreground">Category</span>
                            <span className="font-medium text-secondary">{categories.join(', ')}</span>
                        </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-border/50">
                        <span className="text-muted-foreground">Listings</span>
                        <span className="font-medium text-secondary">{totalListings}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/50 sm:col-span-2">
                        <span className="text-muted-foreground">Price Range</span>
                        <span className="font-medium text-secondary">
                            ${priceRange.min.toLocaleString()} – ${priceRange.max.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Specifications */}
            {specEntries.length > 0 && (
                <div className="bg-white border border-border p-6">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Specifications</h3>
                    <div className="space-y-0">
                        {specEntries.map(([key, value]) => (
                            <div key={key} className="flex justify-between py-2.5 border-b border-border/50 last:border-0 text-sm">
                                <span className="text-muted-foreground">{key}</span>
                                <span className="font-medium text-secondary text-right max-w-[60%]">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

/* ===================== Reviews Tab ===================== */

function ReviewsTab({ avgRating, totalReviews }: { avgRating: number; totalReviews: number }) {
    return (
        <div className="max-w-3xl">
            <h2 className="text-xl font-bold text-secondary mb-6">Reviews</h2>

            <div className="bg-white border border-border p-6 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={`h-6 w-6 ${star <= Math.round(avgRating) ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`}
                        />
                    ))}
                </div>
                <div className="text-3xl font-bold text-secondary">{avgRating}</div>
                <p className="text-sm text-muted-foreground mt-1">
                    Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                </p>
            </div>
        </div>
    )
}
