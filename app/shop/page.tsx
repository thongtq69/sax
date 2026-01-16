'use client'

import { useState, useMemo, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getProducts, getCategories, transformProduct, transformCategory } from '@/lib/api'
import type { Product } from '@/lib/data'
import { ProductCard } from '@/components/product/ProductCard'
import { Filters } from '@/components/product/Filters'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading'
import { ChevronLeft, ChevronRight, Grid3X3, LayoutGrid, Music, Sparkles } from 'lucide-react'

type SortOption = 'featured' | 'price-low' | 'price-high' | 'newest' | 'name' | 'rating'

const stripSaxophones = (value: string) =>
  value.replace(/\s+saxophones?/gi, '').replace(/\s+/g, ' ').trim()

function ShopPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasInitializedRef = useRef(false)
  const skipResetRef = useRef(false)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([])
  const [selectedBadges, setSelectedBadges] = useState<string[]>([])
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [inStockOnly, setInStockOnly] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000])
  const [sortBy, setSortBy] = useState<SortOption>('featured')
  const [currentPage, setCurrentPage] = useState(1)
  const [gridCols, setGridCols] = useState<3 | 4>(3)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isFiltering, setIsFiltering] = useState(false)
  const itemsPerPage = 12

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      try {
        const [productsResponse, categoriesData] = await Promise.all([
          getProducts({ limit: 200 }), // Reduced from 1000 - enough for initial display and filtering
          getCategories(),
        ])

        const transformedProducts = productsResponse.products.map(transformProduct)
        const transformedCategories = categoriesData.map(transformCategory)
        const maxPrice = transformedProducts.length ? Math.max(...transformedProducts.map((p) => p.price)) : 0

        setProducts(transformedProducts)
        setCategories(transformedCategories)
        setPriceRange((prev) => {
          const [prevMin, prevMax] = prev
          if (prevMin === 0 && prevMax === 50000000) {
            return [0, maxPrice]
          }
          const clampedMin = Math.max(0, Math.min(prevMin, maxPrice))
          const clampedMax = Math.max(clampedMin, Math.min(prevMax, maxPrice))
          return [clampedMin, clampedMax]
        })
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
        setIsLoaded(true)
      }
    }
    fetchData()
  }, [])

  const brands = useMemo(() => Array.from(new Set(products.map((p) => p.brand))).sort(), [products])
  const maxPrice = useMemo(() => (products.length ? Math.max(...products.map((p) => p.price)) : 0), [products])
  const badgeOptions = useMemo(
    () => Array.from(new Set(products.map((p) => p.badge).filter(Boolean))) as string[],
    [products]
  )

  useEffect(() => {
    if (!isLoaded || priceRange[1] !== 0 || maxPrice <= 0) return
    const hasPriceFilter = searchParams.has('minPrice') || searchParams.has('maxPrice')
    if (hasPriceFilter) return
    skipResetRef.current = true
    setPriceRange([0, maxPrice])
  }, [isLoaded, maxPrice, priceRange, searchParams])

  // Get subcategories from categories
  const subcategories = useMemo(() => {
    const subcats = new Map<string, { name: string; count: number }>()
    products.forEach(p => {
      if (p.subcategory) {
        const current = subcats.get(p.subcategory)
        if (current) {
          subcats.set(p.subcategory, { ...current, count: current.count + 1 })
        } else {
          // Find display name from categories
          let displayName = p.subcategory.replace(/-/g, ' ')
          categories.forEach(cat => {
            cat.subcategories?.forEach((sub: any) => {
              if (sub.slug === p.subcategory) {
                displayName = sub.name
              }
            })
          })
          const sanitizedName = stripSaxophones(displayName) || displayName
          subcats.set(p.subcategory, { name: sanitizedName, count: 1 })
        }
      }
    })
    return subcats
  }, [products, categories])

  useEffect(() => {
    if (!isLoaded || hasInitializedRef.current) return

    const parseListParam = (key: string) => {
      const rawValues = searchParams.getAll(key)
      if (!rawValues.length) return []
      const values = rawValues.flatMap((value) => value.split(','))
      return Array.from(
        new Set(values.map((value) => value.trim()).filter(Boolean))
      )
    }

    const parsedSubcategories = parseListParam('subcategory')
    const parsedBrands = parseListParam('brand')
    const parsedBadges = parseListParam('badge')
    const parsedConditions = parseListParam('condition')
    const parsedInStock = ['1', 'true', 'yes'].includes(
      (searchParams.get('inStock') || '').toLowerCase()
    )
    const parsedSort = searchParams.get('sort')
    const parsedPage = parseInt(searchParams.get('page') || '1', 10)
    const rawMin = searchParams.get('minPrice')
    const rawMax = searchParams.get('maxPrice')
    const parsedMin = rawMin !== null ? Number(rawMin) : Number.NaN
    const parsedMax = rawMax !== null ? Number(rawMax) : Number.NaN

    const hasAnyFilters =
      parsedSubcategories.length > 0 ||
      parsedBrands.length > 0 ||
      parsedBadges.length > 0 ||
      parsedConditions.length > 0 ||
      parsedInStock ||
      Number.isFinite(parsedMin) ||
      Number.isFinite(parsedMax) ||
      (parsedSort && parsedSort !== 'featured') ||
      parsedPage > 1

    if (hasAnyFilters) {
      skipResetRef.current = true
      setSelectedSubcategories(parsedSubcategories)
      setSelectedBrands(parsedBrands)
      setSelectedBadges(parsedBadges)
      setSelectedConditions(parsedConditions)
      setInStockOnly(parsedInStock)
      if (
        parsedSort &&
        ['featured', 'price-low', 'price-high', 'newest', 'name', 'rating'].includes(parsedSort)
      ) {
        setSortBy(parsedSort as SortOption)
      }
      if (parsedPage > 1) {
        setCurrentPage(parsedPage)
      }

      const nextMin = Number.isFinite(parsedMin) ? parsedMin : 0
      const nextMax = Number.isFinite(parsedMax) ? parsedMax : maxPrice
      const resolvedMax = maxPrice || nextMax || 0
      const clampedMin = Math.max(0, Math.min(nextMin, resolvedMax))
      const clampedMax = Math.max(clampedMin, Math.min(nextMax, resolvedMax))
      setPriceRange([clampedMin, clampedMax])
    } else {
      setPriceRange([0, maxPrice])
    }

    hasInitializedRef.current = true
  }, [isLoaded, maxPrice, searchParams])

  // Reset page when filters change
  useEffect(() => {
    if (skipResetRef.current) {
      skipResetRef.current = false
      return
    }
    setCurrentPage(1)
    setIsFiltering(true)
    const timer = setTimeout(() => setIsFiltering(false), 300)
    return () => clearTimeout(timer)
  }, [selectedBrands, selectedSubcategories, selectedBadges, selectedConditions, inStockOnly, priceRange, sortBy])

  useEffect(() => {
    if (!hasInitializedRef.current) return

    const params = new URLSearchParams()
    if (selectedSubcategories.length > 0) {
      params.set('subcategory', selectedSubcategories.join(','))
    }
    if (selectedBrands.length > 0) {
      params.set('brand', selectedBrands.join(','))
    }
    if (selectedBadges.length > 0) {
      params.set('badge', selectedBadges.join(','))
    }
    if (selectedConditions.length > 0) {
      params.set('condition', selectedConditions.join(','))
    }
    if (inStockOnly) {
      params.set('inStock', '1')
    }
    if (priceRange[0] > 0) {
      params.set('minPrice', String(priceRange[0]))
    }
    if (priceRange[1] < maxPrice) {
      params.set('maxPrice', String(priceRange[1]))
    }
    if (sortBy !== 'featured') {
      params.set('sort', sortBy)
    }
    if (currentPage > 1) {
      params.set('page', String(currentPage))
    }

    const query = params.toString()
    router.replace(query ? `/shop?${query}` : '/shop', { scroll: false })
  }, [
    selectedBrands,
    selectedSubcategories,
    selectedBadges,
    selectedConditions,
    inStockOnly,
    priceRange,
    sortBy,
    currentPage,
    maxPrice,
    router,
  ])

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Category filter
    if (selectedSubcategories.length > 0) {
      filtered = filtered.filter((p) => p.subcategory && selectedSubcategories.includes(p.subcategory))
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((p) => selectedBrands.includes(p.brand))
    }

    // Badge filter
    if (selectedBadges.length > 0) {
      filtered = filtered.filter((p) => p.badge && selectedBadges.includes(p.badge))
    }

    // Condition filter (for used products)
    if (selectedConditions.length > 0) {
      filtered = filtered.filter((p) => {
        const product = p as any
        return product.productType === 'used' && product.condition && selectedConditions.includes(product.condition)
      })
    }

    // Availability
    if (inStockOnly) {
      filtered = filtered.filter((p) => p.inStock)
    }

    // Price filter
    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    )

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'newest':
        filtered.sort((a, b) => {
          const aNew = a.badge === 'new' ? 1 : 0
          const bNew = b.badge === 'new' ? 1 : 0
          return bNew - aNew
        })
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      default:
        // Featured: sale items first, then by rating
        filtered.sort((a, b) => {
          const aSale = a.badge === 'sale' ? 1 : 0
          const bSale = b.badge === 'sale' ? 1 : 0
          if (aSale !== bSale) return bSale - aSale
          return (b.rating || 0) - (a.rating || 0)
        })
    }

    return filtered
  }, [products, selectedBrands, selectedSubcategories, selectedBadges, selectedConditions, inStockOnly, priceRange, sortBy])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" text="Loading products..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Banner - Compact */}
      <section className="relative bg-gradient-to-br from-secondary via-secondary/95 to-secondary overflow-hidden">
        {/* Clean decorative pattern - Music notes from SVG file */}
        <div className="absolute inset-0 opacity-[0.08]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("/musicnote.svg")`,
            backgroundSize: '280px 280px',
            backgroundRepeat: 'repeat',
            filter: 'invert(1)',
          }} />
        </div>

        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/50 via-transparent to-secondary/50" />

        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 py-3 md:py-8 relative">
          <div className="text-center animate-fade-in-up">
            {/* Decorative element */}
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-1 md:mb-2">
              <div className="h-px w-8 md:w-16 bg-gradient-to-r from-transparent via-primary to-primary" />
              <Music className="h-4 w-4 md:h-6 md:w-6 text-primary" />
              <div className="h-px w-8 md:w-16 bg-gradient-to-l from-transparent via-primary to-primary" />
            </div>

            <h1 className="text-xl md:text-4xl lg:text-5xl font-bold text-white mb-1 md:mb-2 tracking-tight">
              Shop All Instruments
            </h1>
            <p className="text-xs md:text-base lg:text-lg text-white/70 max-w-2xl mx-auto line-clamp-1 md:line-clamp-none">
              Professional wind instruments, handpicked for musicians who demand excellence.
            </p>

            {/* Stats - Compact */}
            <div className="flex justify-center gap-4 md:gap-8 mt-2 md:mt-4">
              <div className="text-center">
                <div className="text-lg md:text-3xl font-bold text-primary">{products.length}</div>
                <div className="text-[10px] md:text-sm text-white/50">Products</div>
              </div>
              <div className="h-8 md:h-10 w-px bg-white/20" />
              <div className="text-center">
                <div className="text-lg md:text-3xl font-bold text-primary">{brands.length}</div>
                <div className="text-[10px] md:text-sm text-white/50">Brands</div>
              </div>
              <div className="h-8 md:h-10 w-px bg-white/20" />
              <div className="text-center">
                <div className="text-lg md:text-3xl font-bold text-primary">{subcategories.size}</div>
                <div className="text-[10px] md:text-sm text-white/50">Categories</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave decoration - smaller */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 50L60 42C120 34 240 18 360 14C480 10 600 18 720 22C840 26 960 26 1080 22C1200 18 1320 10 1380 6L1440 2V50H1380C1320 50 1200 50 1080 50C960 50 840 50 720 50C600 50 480 50 360 50C240 50 120 50 60 50H0Z" fill="hsl(45 20% 97%)" />
          </svg>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Category Tabs */}
        <div className="mb-4 md:mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:justify-center gap-2 scrollbar-hide">
            <button
              onClick={() => setSelectedSubcategories([])}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full font-medium text-xs md:text-sm whitespace-nowrap transition-all duration-300 ${selectedSubcategories.length === 0
                ? 'bg-primary text-white shadow-lg scale-105'
                : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                }`}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
                All Products
                <Badge variant="secondary" className="ml-1 text-[10px] md:text-xs">
                  {products.length}
                </Badge>
              </span>
            </button>

            {Array.from(subcategories).map(([slug, { name, count }], index) => (
              <button
                key={slug}
                onClick={() => setSelectedSubcategories([slug])}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full font-medium text-xs md:text-sm whitespace-nowrap transition-all duration-300 ${selectedSubcategories.length === 1 && selectedSubcategories[0] === slug
                  ? 'bg-primary text-white shadow-lg scale-105'
                  : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                  }`}
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <span className="flex items-center gap-2 capitalize">
                  {name}
                  <Badge variant="outline" className="ml-1 text-[10px] md:text-xs">
                    {count}
                  </Badge>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block animate-fade-in-left">
            <div className="sticky top-28">
              <Filters
                allProducts={products}
                brands={brands}
                subcategories={Array.from(subcategories).map(([slug, value]) => ({ slug, ...value }))}
                badges={badgeOptions}
                selectedBrands={selectedBrands}
                selectedSubcategories={selectedSubcategories}
                selectedBadges={selectedBadges}
                selectedConditions={selectedConditions}
                inStockOnly={inStockOnly}
                onBrandChange={setSelectedBrands}
                onSubcategoryChange={setSelectedSubcategories}
                onBadgeChange={setSelectedBadges}
                onConditionChange={setSelectedConditions}
                onInStockChange={setInStockOnly}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filters */}
            <div className="mb-6 lg:hidden">
              <Filters
                allProducts={products}
                brands={brands}
                subcategories={Array.from(subcategories).map(([slug, value]) => ({ slug, ...value }))}
                badges={badgeOptions}
                selectedBrands={selectedBrands}
                selectedSubcategories={selectedSubcategories}
                selectedBadges={selectedBadges}
                selectedConditions={selectedConditions}
                inStockOnly={inStockOnly}
                onBrandChange={setSelectedBrands}
                onSubcategoryChange={setSelectedSubcategories}
                onBadgeChange={setSelectedBadges}
                onConditionChange={setSelectedConditions}
                onInStockChange={setInStockOnly}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
                mobile
              />
            </div>

            {/* Sort & Results Count & Grid Toggle */}
            <div className="mb-3 md:mb-6 flex flex-wrap items-center justify-between gap-1.5 md:gap-4 p-2 md:p-4 bg-white rounded-lg md:rounded-xl shadow-sm border animate-fade-in-down">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="text-xs md:text-sm text-muted-foreground">
                  Showing <span className="font-semibold text-secondary">{paginatedProducts.length}</span> of{' '}
                  <span className="font-semibold text-secondary">{filteredProducts.length}</span> products
                </div>

                {/* Grid toggle */}
                <div className="hidden md:flex items-center gap-1 border rounded-lg p-1">
                  <button
                    onClick={() => setGridCols(3)}
                    className={`p-1.5 rounded transition-colors ${gridCols === 3 ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setGridCols(4)}
                    className={`p-1.5 rounded transition-colors ${gridCols === 4 ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SortOption)}
              >
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="rating">Best Rated</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* No Results */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-16 animate-fade-in">
                <div className="text-6xl mb-4">🎷</div>
                <h3 className="text-xl font-semibold text-secondary mb-2">No instruments found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters or search criteria</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedBrands([])
                    setSelectedSubcategories([])
                    setSelectedBadges([])
                    setSelectedConditions([])
                    setInStockOnly(false)
                    setPriceRange([0, maxPrice])
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            )}

            {/* Product Grid */}
            <div className="relative">
              {isFiltering && (
                <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg min-h-[400px]">
                  <LoadingSpinner text="Filtering products..." />
                </div>
              )}
              <div className={`grid gap-3 md:gap-6 ${gridCols === 4
                ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3'
                } ${isFiltering ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300`}>
                {paginatedProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col items-center gap-4 animate-fade-in-up">
                {/* Page info */}
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>

                {/* Pagination buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="transition-all hover:shadow-md"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                      )
                      .map((page, index, array) => (
                        <div key={page} className="flex items-center">
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 text-muted-foreground">•••</span>
                          )}
                          <Button
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-[40px] transition-all ${currentPage === page ? 'shadow-lg scale-105' : 'hover:shadow-md'
                              }`}
                          >
                            {page}
                          </Button>
                        </div>
                      ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="transition-all hover:shadow-md"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Wrap in Suspense for useSearchParams
export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" text="Loading products..." />
      </div>
    }>
      <ShopPageContent />
    </Suspense>
  )
}
