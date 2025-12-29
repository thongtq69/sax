'use client'

import { useState, useMemo } from 'react'
import { products } from '@/lib/data'
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
import { ChevronLeft, ChevronRight } from 'lucide-react'

type SortOption = 'featured' | 'price-low' | 'price-high' | 'newest' | 'name'

export default function ShopPage() {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
  const [sortBy, setSortBy] = useState<SortOption>('featured')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 24

  const brands = Array.from(new Set(products.map((p) => p.brand)))

  const filteredProducts = useMemo(() => {
    let filtered = products

    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((p) => selectedBrands.includes(p.brand))
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
  }, [selectedBrands, priceRange, sortBy])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Shop All Products</h1>
        <p className="mt-2 text-gray-600">
          Explore our curated selection of professional instruments and accessories
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Filters Sidebar - Desktop */}
        <div className="hidden lg:block">
          <Filters
            brands={brands}
            selectedBrands={selectedBrands}
            onBrandChange={setSelectedBrands}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Filters */}
          <div className="mb-6 lg:hidden">
            <Filters
              brands={brands}
              selectedBrands={selectedBrands}
              onBrandChange={setSelectedBrands}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              mobile
            />
          </div>

          {/* Sort & Results Count */}
          <div className="mb-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {paginatedProducts.length} of {filteredProducts.length}{' '}
              products
            </div>
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as SortOption)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
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
                      <span className="px-2">...</span>
                    )}
                    <Button
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  </div>
                ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

