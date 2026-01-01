'use client'

import { useState, useMemo, useEffect } from 'react'
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

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([])
  const [selectedBadges, setSelectedBadges] = useState<string[]>([])
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
        setPriceRange([0, maxPrice])
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
          subcats.set(p.subcategory, { name: displayName, count: 1 })
        }
      }
    })
    return subcats
  }, [products, categories])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
    setIsFiltering(true)
    const timer = setTimeout(() => setIsFiltering(false), 300)
    return () => clearTimeout(timer)
  }, [selectedBrands, selectedSubcategories, selectedBadges, inStockOnly, priceRange, sortBy])

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
  }, [products, selectedBrands, selectedSubcategories, selectedBadges, inStockOnly, priceRange, sortBy])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Group products by subcategory for display
  const groupedByCategory = useMemo(() => {
    if (selectedSubcategories.length > 0) return null
    
    const groups = new Map<string, Product[]>()
    filteredProducts.forEach(p => {
      const key = p.subcategory || 'other'
      const current = groups.get(key) || []
      groups.set(key, [...current, p])
    })
    return groups
  }, [filteredProducts, selectedSubcategories])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" text="Loading products..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-secondary via-secondary/95 to-secondary overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="container mx-auto px-4 py-8 md:py-10 lg:py-12 relative">
          <div className="text-center animate-fade-in-up">
            {/* Decorative element */}
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
              <div className="h-px w-12 md:w-16 bg-gradient-to-r from-transparent to-primary" />
              <Music className="h-5 w-5 md:h-6 md:w-6 text-primary animate-bounce-soft" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary" />
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-3 tracking-tight">
              Shop All Instruments
            </h1>
            <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto px-2">
              Discover our curated collection of professional wind instruments, 
              handpicked by experts for musicians who demand excellence.
            </p>
            
            {/* Stats */}
            <div className="flex justify-center gap-4 md:gap-6 lg:gap-8 mt-6 md:mt-8">
              <div className="text-center animate-fade-in stagger-1">
                <div className="text-2xl md:text-3xl font-bold text-primary">{products.length}</div>
                <div className="text-xs md:text-sm text-white/60">Products</div>
              </div>
              <div className="h-10 md:h-12 w-px bg-white/20" />
              <div className="text-center animate-fade-in stagger-2">
                <div className="text-2xl md:text-3xl font-bold text-primary">{brands.length}</div>
                <div className="text-xs md:text-sm text-white/60">Brands</div>
              </div>
              <div className="h-10 md:h-12 w-px bg-white/20" />
              <div className="text-center animate-fade-in stagger-3">
                <div className="text-2xl md:text-3xl font-bold text-primary">{subcategories.size}</div>
                <div className="text-xs md:text-sm text-white/60">Categories</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 25C840 30 960 30 1080 25C1200 20 1320 10 1380 5L1440 0V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" fill="hsl(45 20% 97%)"/>
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
                inStockOnly={inStockOnly}
                onBrandChange={setSelectedBrands}
                onSubcategoryChange={setSelectedSubcategories}
                onBadgeChange={setSelectedBadges}
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
                inStockOnly={inStockOnly}
                onBrandChange={setSelectedBrands}
                onSubcategoryChange={setSelectedSubcategories}
                onBadgeChange={setSelectedBadges}
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
                  <SelectItem value="featured">⭐ Featured</SelectItem>
                  <SelectItem value="price-low">💰 Price: Low to High</SelectItem>
                  <SelectItem value="price-high">💎 Price: High to Low</SelectItem>
                  <SelectItem value="newest">✨ Newest</SelectItem>
                  <SelectItem value="rating">🏆 Best Rated</SelectItem>
                  <SelectItem value="name">🔤 Name A-Z</SelectItem>
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
