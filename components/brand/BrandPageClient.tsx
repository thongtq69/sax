'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProductCard } from '@/components/product/ProductCard'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import type { Product } from '@/lib/data'
import { ChevronLeft, ChevronRight, Search, Tag } from 'lucide-react'

type SortOption = 'featured' | 'price-low' | 'price-high' | 'rating' | 'name'

interface BrandModelSummary {
  name: string
  count: number
}

interface BrandPageClientProps {
  brandName: string
  brandSlug: string
  brandLogo: string | null
  brandDescription: string | null
  products: Product[]
  models: BrandModelSummary[]
}

const ITEMS_PER_PAGE = 12

export function BrandPageClient({
  brandName,
  brandSlug,
  brandLogo,
  brandDescription,
  products,
  models,
}: BrandPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasInitializedRef = useRef(false)

  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([])
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [inStockOnly, setInStockOnly] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('featured')
  const [currentPage, setCurrentPage] = useState(1)

  const maxPrice = useMemo(() => {
    if (products.length === 0) return 0
    return Math.max(...products.map((p) => p.price))
  }, [products])

  useEffect(() => {
    if (priceRange[1] === 0 && maxPrice > 0) {
      setPriceRange([0, maxPrice])
    }
  }, [maxPrice, priceRange])

  const subcategories = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>()
    products.forEach((product) => {
      if (!product.subcategory) return
      const current = map.get(product.subcategory)
      if (current) {
        map.set(product.subcategory, { ...current, count: current.count + 1 })
      } else {
        map.set(product.subcategory, {
          name: product.subcategoryName || product.subcategory.replace(/-/g, ' '),
          count: 1,
        })
      }
    })
    return Array.from(map.entries()).map(([slug, data]) => ({ slug, ...data }))
  }, [products])

  const conditionCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    products.forEach((p) => {
      const type = (p as any).productType || 'new'
      const condition = (p as any).condition
      if (type === 'used' && condition) {
        counts[condition] = (counts[condition] || 0) + 1
      }
      if (type === 'new') {
        counts.new = (counts.new || 0) + 1
      }
    })
    return counts
  }, [products])

  useEffect(() => {
    const parseListParam = (key: string) => {
      const values = searchParams.getAll(key).flatMap((value) => value.split(','))
      return Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)))
    }

    const queryModels = parseListParam('model')
    const querySubcategories = parseListParam('subcategory')
    const queryConditions = parseListParam('condition')
    const queryInStock = ['1', 'true', 'yes'].includes((searchParams.get('inStock') || '').toLowerCase())
    const querySearch = searchParams.get('search') || ''
    const querySort = (searchParams.get('sort') || 'featured') as SortOption
    const queryPage = parseInt(searchParams.get('page') || '1', 10)

    const rawMin = Number(searchParams.get('minPrice') || 0)
    const rawMax = Number(searchParams.get('maxPrice') || maxPrice)
    const min = Math.max(0, Math.min(rawMin, maxPrice))
    const max = Math.max(min, Math.min(rawMax, maxPrice))

    const arraysEqual = (a: string[], b: string[]) => a.length === b.length && a.every((v, i) => v === b[i])

    if (!arraysEqual(selectedModels, queryModels)) setSelectedModels(queryModels)
    if (!arraysEqual(selectedSubcategories, querySubcategories)) setSelectedSubcategories(querySubcategories)
    if (!arraysEqual(selectedConditions, queryConditions)) setSelectedConditions(queryConditions)
    if (queryInStock !== inStockOnly) setInStockOnly(queryInStock)
    if (querySearch !== searchTerm) setSearchTerm(querySearch)
    if (querySort !== sortBy) setSortBy(querySort)
    if (queryPage !== currentPage) setCurrentPage(queryPage)
    if (min !== priceRange[0] || max !== priceRange[1]) setPriceRange([min, max])

    hasInitializedRef.current = true
  }, [searchParams, maxPrice])

  useEffect(() => {
    if (!hasInitializedRef.current || maxPrice === 0) return

    const params = new URLSearchParams()
    if (selectedModels.length > 0) params.set('model', selectedModels.join(','))
    if (selectedSubcategories.length > 0) params.set('subcategory', selectedSubcategories.join(','))
    if (selectedConditions.length > 0) params.set('condition', selectedConditions.join(','))
    if (inStockOnly) params.set('inStock', '1')
    if (searchTerm.trim()) params.set('search', searchTerm.trim())
    if (sortBy !== 'featured') params.set('sort', sortBy)
    if (priceRange[0] > 0) params.set('minPrice', String(priceRange[0]))
    if (priceRange[1] < maxPrice) params.set('maxPrice', String(priceRange[1]))
    if (currentPage > 1) params.set('page', String(currentPage))

    const query = params.toString()
    router.replace(query ? `/brand/${brandSlug}?${query}` : `/brand/${brandSlug}`, { scroll: false })
  }, [
    selectedModels,
    selectedSubcategories,
    selectedConditions,
    inStockOnly,
    searchTerm,
    sortBy,
    priceRange,
    currentPage,
    maxPrice,
    brandSlug,
    router,
  ])

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedModels, selectedSubcategories, selectedConditions, inStockOnly, searchTerm, sortBy, priceRange])

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim()
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      )
    }

    if (selectedModels.length > 0) {
      filtered = filtered.filter((p) => {
        const model = ((p as any).subBrand || '').trim()
        return selectedModels.includes(model)
      })
    }

    if (selectedSubcategories.length > 0) {
      filtered = filtered.filter((p) => p.subcategory && selectedSubcategories.includes(p.subcategory))
    }

    if (selectedConditions.length > 0) {
      filtered = filtered.filter((p) => {
        const type = (p as any).productType || 'new'
        const condition = (p as any).condition
        return selectedConditions.some((value) => {
          if (value === 'new') return type === 'new'
          return type === 'used' && condition === value
        })
      })
    }

    if (inStockOnly) {
      filtered = filtered.filter((p) => p.inStock && ((p as any).stockStatus || 'in-stock') !== 'sold-out')
    }

    filtered = filtered.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'featured':
      default:
        filtered.sort((a, b) => {
          const aSale = a.badge === 'sale' ? 1 : 0
          const bSale = b.badge === 'sale' ? 1 : 0
          if (aSale !== bSale) return bSale - aSale
          return (b.rating || 0) - (a.rating || 0)
        })
    }

    return filtered
  }, [products, searchTerm, selectedModels, selectedSubcategories, selectedConditions, inStockOnly, priceRange, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE))
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const toggleValue = (
    value: string,
    values: string[],
    setValues: (next: string[]) => void,
  ) => {
    if (values.includes(value)) {
      setValues(values.filter((v) => v !== value))
    } else {
      setValues([...values, value])
    }
  }

  const clearFilters = () => {
    setSelectedModels([])
    setSelectedSubcategories([])
    setSelectedConditions([])
    setInStockOnly(false)
    setSearchTerm('')
    setSortBy('featured')
    setPriceRange([0, maxPrice])
  }

  return (
    <div className="min-h-screen">
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-3 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span>Brands</span>
          <span className="mx-2">/</span>
          <span className="text-secondary font-medium">{brandName}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <section className="border border-border bg-white p-5 md:p-7 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 md:h-20 md:w-20 border border-border bg-muted/20 overflow-hidden flex items-center justify-center">
                {brandLogo ? (
                  <Image src={brandLogo} alt={brandName} width={80} height={80} className="w-full h-full object-contain" />
                ) : (
                  <Tag className="h-8 w-8 text-muted-foreground/40" />
                )}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-secondary">{brandName}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {products.length} listing{products.length !== 1 ? 's' : ''} available
                </p>
                {brandDescription && (
                  <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                    {brandDescription}
                  </p>
                )}
              </div>
            </div>

            <div className="w-full md:w-[340px]">
              <div className="relative">
                <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search this brand"
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {models.length > 0 && (
            <div className="mt-5 pt-5 border-t border-border/70">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-3">Popular Models</p>
              <div className="flex flex-wrap gap-2">
                {models.slice(0, 16).map((model) => {
                  const active = selectedModels.includes(model.name)
                  const modelSlug = encodeURIComponent(model.name.toLowerCase().replace(/\s+/g, '-'))
                  return (
                    <button
                      key={model.name}
                      type="button"
                      onClick={() => toggleValue(model.name, selectedModels, setSelectedModels)}
                      className={`px-3 py-1.5 border text-xs transition-colors ${active
                        ? 'bg-secondary text-white border-secondary'
                        : 'bg-white text-secondary border-border hover:border-secondary/40'
                        }`}
                      title={`Browse model page: /p/${modelSlug}`}
                    >
                      {model.name} ({model.count})
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <aside className="border border-border bg-white p-4 h-fit lg:sticky lg:top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm uppercase tracking-wider font-semibold text-muted-foreground">Filters</h2>
              <button type="button" onClick={clearFilters} className="text-xs text-primary hover:underline">
                Clear all
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold text-secondary mb-2">Availability</p>
                <label className="inline-flex items-center gap-2 text-sm text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                  />
                  In stock only
                </label>
              </div>

              {subcategories.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-secondary mb-2">Categories</p>
                  <div className="space-y-2 max-h-52 overflow-auto pr-1">
                    {subcategories.map((subcategory) => (
                      <label key={subcategory.slug} className="flex items-center justify-between gap-2 text-sm cursor-pointer">
                        <span className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedSubcategories.includes(subcategory.slug)}
                            onChange={() => toggleValue(subcategory.slug, selectedSubcategories, setSelectedSubcategories)}
                          />
                          <span className="capitalize">{subcategory.name}</span>
                        </span>
                        <span className="text-xs text-muted-foreground">{subcategory.count}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-secondary mb-2">Condition</p>
                <div className="space-y-2">
                  {[
                    { value: 'new', label: 'New' },
                    { value: 'mint', label: 'Mint' },
                    { value: 'excellent', label: 'Excellent' },
                    { value: 'very-good', label: 'Very Good' },
                    { value: 'good', label: 'Good' },
                    { value: 'fair', label: 'Fair' },
                  ].map((condition) => (
                    <label key={condition.value} className="flex items-center justify-between gap-2 text-sm cursor-pointer">
                      <span className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedConditions.includes(condition.value)}
                          onChange={() => toggleValue(condition.value, selectedConditions, setSelectedConditions)}
                        />
                        <span>{condition.label}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">{conditionCounts[condition.value] || 0}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-secondary mb-2">Price Range</p>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    min={0}
                    value={priceRange[0]}
                    onChange={(e) => {
                      const min = Number(e.target.value) || 0
                      setPriceRange([Math.min(min, priceRange[1]), priceRange[1]])
                    }}
                    className="h-9"
                  />
                  <Input
                    type="number"
                    min={priceRange[0]}
                    value={priceRange[1]}
                    onChange={(e) => {
                      const max = Number(e.target.value) || 0
                      setPriceRange([priceRange[0], Math.max(max, priceRange[0])])
                    }}
                    className="h-9"
                  />
                </div>
              </div>
            </div>
          </aside>

          <main>
            <div className="border border-border bg-white p-3 md:p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-secondary">{paginatedProducts.length}</span> of{' '}
                <span className="font-semibold text-secondary">{filteredProducts.length}</span> listings
              </p>

              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Best Rated</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="border border-border bg-white p-10 text-center">
                <p className="text-lg font-semibold text-secondary">No listings match your filters</p>
                <p className="text-sm text-muted-foreground mt-1">Try clearing some filters to see more products.</p>
                <Button variant="outline" className="mt-4" onClick={clearFilters}>Reset filters</Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {paginatedProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">
                      Page {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
