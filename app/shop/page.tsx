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
        {/* Decorative pattern - Various Music Note Vectors */}
        <div className="absolute inset-0 opacity-12">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.35'%3E%3C!-- Quarter note --%3E%3Cpath d='M20 15c0-1.1.9-2 2-2s2 .9 2 2v20c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6c.6 0 1.1.1 1.5.3V15z'/%3E%3Cpath d='M20 35h3v20h-3z'/%3E%3C!-- Eighth note --%3E%3Cpath d='M45 10c0-1.1.9-2 2-2s2 .9 2 2v18c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6c.6 0 1.1.1 1.5.3V10z'/%3E%3Cpath d='M47 28h3v25h-3z'/%3E%3Cpath d='M45 50c0-1.7 1.3-3 3-3h4c1.7 0 3 1.3 3 3v6c0 1.7-1.3 3-3 3h-4c-1.7 0-3-1.3-3-3v-6z'/%3E%3C!-- Sixteenth note --%3E%3Cpath d='M70 8c0-1.1.9-2 2-2s2 .9 2 2v16c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6c.6 0 1.1.1 1.5.3V8z'/%3E%3Cpath d='M72 24h3v28h-3z'/%3E%3Cpath d='M70 48c0-1.7 1.3-3 3-3h4c1.7 0 3 1.3 3 3v6c0 1.7-1.3 3-3 3h-4c-1.7 0-3-1.3-3-3v-6z'/%3E%3Cpath d='M72 54h3v15h-3z'/%3E%3Cpath d='M70 65c0-1.7 1.3-3 3-3h4c1.7 0 3 1.3 3 3v6c0 1.7-1.3 3-3 3h-4c-1.7 0-3-1.3-3-3v-6z'/%3E%3C!-- Whole note --%3E%3Cellipse cx='25' cy='75' rx='5' ry='4'/%3E%3C!-- Half note --%3E%3Cellipse cx='50' cy='70' rx='4.5' ry='3.5'/%3E%3Cpath d='M50 73.5h2.5v20h-2.5z'/%3E%3C!-- Treble clef --%3E%3Cpath d='M75 60c-1.5-1-2.5-2.8-2.5-5 0-3.3 2.7-6 6-6s6 2.7 6 6c0 2.2-1 4-2.5 5v-8c0-1.1-.9-2-2-2h-1c-1.1 0-2 .9-2 2v8z'/%3E%3Cpath d='M77 55c0 1.7 1.3 3 3 3s3-1.3 3-3-1.3-3-3-3-3 1.3-3 3z'/%3E%3Cpath d='M78 58c1-1 2.5-1 3.5 0l-.5 1c-.5-.5-1.2-.5-1.7 0l-1.3-1z'/%3E%3C!-- Bass clef --%3E%3Cpath d='M15 80c-1-2-1-4.5 0-6.5 1-2 3-3 5-3 2 0 4 1 5 3 1 2 1 4.5 0 6.5-1 2-3 3-5 3-2 0-4-1-5-3z'/%3E%3Cpath d='M18 85c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v8h-6v-8z'/%3E%3C!-- Sharp symbol --%3E%3Cpath d='M35 45h8v2h-8z'/%3E%3Cpath d='M35 50h8v2h-8z'/%3E%3Cpath d='M37 42v12h2V42z'/%3E%3Cpath d='M41 42v12h2V42z'/%3E%3C!-- Flat symbol --%3E%3Cpath d='M60 65h2v18h-2z'/%3E%3Cpath d='M60 83c0-2 1.5-3.5 3.5-3.5 1 0 1.8.4 2.3 1.1l-1.3 1.2c-.3-.4-.7-.6-1-.6-.8 0-1.5.6-1.5 1.5 0 .8.7 1.5 1.5 1.5.3 0 .7-.2 1-.6l1.3 1.2c-.5.7-1.3 1.1-2.3 1.1-2 0-3.5-1.5-3.5-3.5z'/%3E%3C!-- Musical staff lines --%3E%3Cpath d='M5 20h20' stroke='%23ffffff' stroke-opacity='0.2' stroke-width='0.5'/%3E%3Cpath d='M5 25h20' stroke='%23ffffff' stroke-opacity='0.2' stroke-width='0.5'/%3E%3Cpath d='M5 30h20' stroke='%23ffffff' stroke-opacity='0.2' stroke-width='0.5'/%3E%3Cpath d='M5 35h20' stroke='%23ffffff' stroke-opacity='0.2' stroke-width='0.5'/%3E%3Cpath d='M5 40h20' stroke='%23ffffff' stroke-opacity='0.2' stroke-width='0.5'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '100px 100px',
          }} />
        </div>
        
        <div className="container mx-auto px-4 py-4 md:py-5 relative">
          <div className="text-center animate-fade-in-up">
            {/* Decorative element */}
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="h-px w-10 md:w-12 bg-gradient-to-r from-transparent to-primary" />
              <Music className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <div className="h-px w-10 md:w-12 bg-gradient-to-l from-transparent to-primary" />
            </div>
            
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 tracking-tight">
              Shop All Instruments
            </h1>
            <p className="text-sm md:text-base text-white/80 max-w-xl mx-auto">
              Professional wind instruments, handpicked for musicians who demand excellence.
            </p>
            
            {/* Stats - Compact */}
            <div className="flex justify-center gap-4 md:gap-6 mt-3">
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-primary">{products.length}</div>
                <div className="text-xs text-white/60">Products</div>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-primary">{brands.length}</div>
                <div className="text-xs text-white/60">Brands</div>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-primary">{subcategories.size}</div>
                <div className="text-xs text-white/60">Categories</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave decoration - smaller */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 40L60 33C120 27 240 13 360 10C480 7 600 13 720 17C840 20 960 20 1080 17C1200 13 1320 7 1380 3L1440 0V40H1380C1320 40 1200 40 1080 40C960 40 840 40 720 40C600 40 480 40 360 40C240 40 120 40 60 40H0Z" fill="hsl(45 20% 97%)"/>
          </svg>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Category Tabs */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedSubcategories([])}
              className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
                selectedSubcategories.length === 0
                  ? 'bg-primary text-white shadow-lg scale-105'
                  : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
              }`}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                All Products
                <Badge variant="secondary" className="ml-1 text-xs">
                  {products.length}
                </Badge>
              </span>
            </button>
            
            {Array.from(subcategories).map(([slug, { name, count }], index) => (
              <button
                key={slug}
                onClick={() => setSelectedSubcategories([slug])}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full font-medium text-xs md:text-sm transition-all duration-300 ${
                  selectedSubcategories.length === 1 && selectedSubcategories[0] === slug
                    ? 'bg-primary text-white shadow-lg scale-105'
                    : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                }`}
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <span className="flex items-center gap-2 capitalize">
                  {name}
                  <Badge variant="outline" className="ml-1 text-xs">
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
            <div className="mb-4 md:mb-6 flex flex-wrap items-center justify-between gap-2 md:gap-4 p-3 md:p-4 bg-white rounded-lg md:rounded-xl shadow-sm border animate-fade-in-down">
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
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
              <div className={`grid gap-6 ${
                gridCols === 4 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
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
                            className={`min-w-[40px] transition-all ${
                              currentPage === page ? 'shadow-lg scale-105' : 'hover:shadow-md'
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
