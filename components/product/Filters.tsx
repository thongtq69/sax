'use client'

import { useMemo, useState } from 'react'
import type { Product } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Filter, ChevronDown, X, Sparkles } from 'lucide-react'

interface FiltersProps {
  allProducts: Product[]
  brands: string[]
  subcategories: { slug: string; name: string; count: number }[]
  badges: string[]
  selectedBrands: string[]
  selectedSubcategories: string[]
  selectedBadges: string[]
  selectedConditions: string[]
  inStockOnly: boolean
  onBrandChange: (brands: string[]) => void
  onSubcategoryChange: (subcats: string[]) => void
  onBadgeChange: (badges: string[]) => void
  onConditionChange: (conditions: string[]) => void
  onInStockChange: (value: boolean) => void
  priceRange: [number, number]
  onPriceRangeChange: (range: [number, number]) => void
  mobile?: boolean
}

export function Filters({
  allProducts,
  brands,
  subcategories,
  badges,
  selectedBrands,
  selectedSubcategories,
  selectedBadges,
  selectedConditions,
  inStockOnly,
  onBrandChange,
  onSubcategoryChange,
  onBadgeChange,
  onConditionChange,
  onInStockChange,
  priceRange,
  onPriceRangeChange,
  mobile = false,
}: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [brandExpanded, setBrandExpanded] = useState(false)
  const [priceExpanded, setPriceExpanded] = useState(false)
  const [subcategoryExpanded, setSubcategoryExpanded] = useState(false)
  const [badgeExpanded, setBadgeExpanded] = useState(false)
  const [conditionExpanded, setConditionExpanded] = useState(false)
  const [availabilityExpanded, setAvailabilityExpanded] = useState(false)

  // Condition options
  const conditionOptions = [
    { value: 'mint', label: 'Mint' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'very-good', label: 'Very Good' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
  ]

  // Count products by condition
  const conditionCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    allProducts.forEach((p) => {
      if ((p as any).productType === 'used' && (p as any).condition) {
        const condition = (p as any).condition
        counts[condition] = (counts[condition] || 0) + 1
      }
    })
    return counts
  }, [allProducts])

  // Check if there are any used products
  const hasUsedProducts = useMemo(() => {
    return allProducts.some((p) => (p as any).productType === 'used')
  }, [allProducts])

  const stripSaxophones = (value: string) =>
    value.replace(/\s+saxophones?/gi, '').replace(/\s+/g, ' ').trim()

  const subcategoryLabels = useMemo(() => {
    const entries = subcategories.map((subcategory) => [subcategory.slug, subcategory.name] as const)
    return new Map(entries)
  }, [subcategories])

  const formatSubcategoryLabel = (slug: string) => {
    const label = subcategoryLabels.get(slug) || slug.replace(/-/g, ' ')
    return stripSaxophones(label)
  }

  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    allProducts.forEach((p) => {
      counts[p.brand] = (counts[p.brand] || 0) + 1
    })
    return counts
  }, [allProducts])

  const maxPrice = useMemo(
    () => (allProducts.length > 0 ? Math.max(...allProducts.map((p) => p.price)) : 0),
    [allProducts]
  )

  const quickPriceRanges = useMemo(() => {
    const ranges = [
      { label: 'Under $1,500', min: 0, max: 1500 },
      { label: '$1,500 - $3,000', min: 1500, max: 3000 },
      { label: '$3,000 - $6,000', min: 3000, max: 6000 },
      { label: '$6,000 - $10,000', min: 6000, max: 10000 },
      { label: 'Over $10,000', min: 10000, max: maxPrice },
    ]
      .filter((r) => r.min <= maxPrice && r.min < r.max)
      .map((r, idx) => ({ ...r, key: `${r.label}-${idx}` }))
    return ranges.length ? ranges : [{ label: `Up to $${maxPrice.toLocaleString()}`, min: 0, max: maxPrice, key: 'all' }]
  }, [maxPrice])

  const hasActiveFilters =
    selectedBrands.length > 0 ||
    selectedSubcategories.length > 0 ||
    selectedBadges.length > 0 ||
    selectedConditions.length > 0 ||
    inStockOnly ||
    priceRange[0] > 0 ||
    priceRange[1] < maxPrice

  const handleBrandToggle = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      onBrandChange(selectedBrands.filter((b) => b !== brand))
    } else {
      onBrandChange([...selectedBrands, brand])
    }
  }

  const handleSubcategoryToggle = (slug: string) => {
    if (selectedSubcategories.includes(slug)) {
      onSubcategoryChange(selectedSubcategories.filter((s) => s !== slug))
    } else {
      onSubcategoryChange([...selectedSubcategories, slug])
    }
  }

  const handleBadgeToggle = (badge: string) => {
    if (selectedBadges.includes(badge)) {
      onBadgeChange(selectedBadges.filter((b) => b !== badge))
    } else {
      onBadgeChange([...selectedBadges, badge])
    }
  }

  const handleConditionToggle = (condition: string) => {
    if (selectedConditions.includes(condition)) {
      onConditionChange(selectedConditions.filter((c) => c !== condition))
    } else {
      onConditionChange([...selectedConditions, condition])
    }
  }

  const content = (
    <div className="space-y-6">
      {/* Active Filters Preview */}
      {hasActiveFilters && (
        <div className="animate-fade-in-up">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Active Filters</span>
            <button 
              onClick={() => {
                onBrandChange([])
                onSubcategoryChange([])
                onBadgeChange([])
                onConditionChange([])
                onInStockChange(false)
                onPriceRangeChange([0, maxPrice])
              }}
              className="text-xs text-destructive hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedBrands.map((brand) => (
              <span
                key={brand}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => handleBrandToggle(brand)}
              >
                {brand}
                <X className="w-3 h-3" />
              </span>
            ))}
            {selectedSubcategories.map((sub) => (
              <span
                key={sub}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-secondary/10 text-secondary rounded-full cursor-pointer hover:bg-secondary/20 transition-colors"
                onClick={() => handleSubcategoryToggle(sub)}
              >
                {formatSubcategoryLabel(sub)}
                <X className="w-3 h-3" />
              </span>
            ))}
            {selectedBadges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-full cursor-pointer hover:bg-amber-200 transition-colors"
                onClick={() => handleBadgeToggle(badge)}
              >
                {badge}
                <X className="w-3 h-3" />
              </span>
            ))}
            {selectedConditions.map((condition) => (
              <span
                key={condition}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-full cursor-pointer hover:bg-emerald-200 transition-colors capitalize"
                onClick={() => handleConditionToggle(condition)}
              >
                {condition.replace('-', ' ')}
                <X className="w-3 h-3" />
              </span>
            ))}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                In stock
                <X className="w-3 h-3 cursor-pointer" onClick={() => onInStockChange(false)} />
              </span>
            )}
            {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-accent/10 text-accent rounded-full">
                ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
              </span>
            )}
          </div>
        </div>
      )}

      {hasActiveFilters && <Separator />}

      {/* Subcategory Filter */}
      <div className="space-y-3">
        <button
          onClick={() => setSubcategoryExpanded(!subcategoryExpanded)}
          className="flex items-center justify-between w-full group"
        >
          <h3 className="font-display font-semibold text-secondary group-hover:text-primary transition-colors">
            Categories
          </h3>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
              subcategoryExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>

        <div
          className={`space-y-2 overflow-hidden transition-all duration-300 ${
            subcategoryExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {subcategories.map(({ slug, name, count }, index) => (
            <label
              key={slug}
              className="flex items-center space-x-3 cursor-pointer group p-2 rounded-lg hover:bg-muted transition-colors capitalize"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative">
                <input
                  type="checkbox"
                  checked={selectedSubcategories.includes(slug)}
                  onChange={() => handleSubcategoryToggle(slug)}
                  className="peer sr-only"
                />
                <div className="h-5 w-5 rounded border-2 border-gray-300 transition-all duration-200 peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center">
                  <svg
                    className={`w-3 h-3 text-white transition-all duration-200 ${
                      selectedSubcategories.includes(slug) ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <span className="text-sm font-body group-hover:text-primary transition-colors">
                {stripSaxophones(name) || name}
              </span>
              <span className="text-xs text-muted-foreground ml-auto">({count})</span>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {/* Brand Filter */}
      <div className="space-y-3">
        <button 
          onClick={() => setBrandExpanded(!brandExpanded)}
          className="flex items-center justify-between w-full group"
        >
          <h3 className="font-display font-semibold text-secondary group-hover:text-primary transition-colors">
            Brand
          </h3>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${brandExpanded ? 'rotate-180' : ''}`} />
        </button>
        
        <div className={`space-y-2 overflow-hidden transition-all duration-300 ${brandExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          {brands.map((brand, index) => (
            <label
              key={brand}
              className="flex items-center space-x-3 cursor-pointer group p-2 rounded-lg hover:bg-muted transition-colors"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => handleBrandToggle(brand)}
                  className="peer sr-only"
                />
                <div className="h-5 w-5 rounded border-2 border-gray-300 transition-all duration-200 peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center">
                  <svg 
                    className={`w-3 h-3 text-white transition-all duration-200 ${selectedBrands.includes(brand) ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <span className="text-sm font-body group-hover:text-primary transition-colors">
                {brand}
              </span>
              <span className="text-xs text-muted-foreground ml-auto">
                ({brandCounts[brand] || 0})
              </span>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {/* Badge Filter */}
      {badges.length > 0 && (
        <>
          <div className="space-y-3">
            <button
              onClick={() => setBadgeExpanded(!badgeExpanded)}
              className="flex items-center justify-between w-full group"
            >
              <h3 className="font-display font-semibold text-secondary group-hover:text-primary transition-colors">
                Highlights
              </h3>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
                  badgeExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            <div
              className={`space-y-2 overflow-hidden transition-all duration-300 ${
                badgeExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              {badges.map((badge, index) => (
                <label
                  key={badge}
                  className="flex items-center space-x-3 cursor-pointer group p-2 rounded-lg hover:bg-muted transition-colors capitalize"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={selectedBadges.includes(badge)}
                      onChange={() => handleBadgeToggle(badge)}
                      className="peer sr-only"
                    />
                    <div className="h-5 w-5 rounded border-2 border-gray-300 transition-all duration-200 peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center">
                      <svg
                        className={`w-3 h-3 text-white transition-all duration-200 ${
                          selectedBadges.includes(badge) ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-sm font-body group-hover:text-primary transition-colors">
                    {badge === 'sale' ? 'On Sale' : badge === 'new' ? 'New Arrival' : badge === 'limited' ? 'Limited' : badge}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <Separator />
        </>
      )}

      {/* Condition Filter (for used products) */}
      {hasUsedProducts && (
        <>
          <div className="space-y-3">
            <button
              onClick={() => setConditionExpanded(!conditionExpanded)}
              className="flex items-center justify-between w-full group"
            >
              <h3 className="font-display font-semibold text-secondary group-hover:text-primary transition-colors">
                Condition
              </h3>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
                  conditionExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            <div
              className={`space-y-2 overflow-hidden transition-all duration-300 ${
                conditionExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              {conditionOptions.map((option, index) => {
                const count = conditionCounts[option.value] || 0
                return (
                  <label
                    key={option.value}
                    className="flex items-center space-x-3 cursor-pointer group p-2 rounded-lg hover:bg-muted transition-colors"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={selectedConditions.includes(option.value)}
                        onChange={() => handleConditionToggle(option.value)}
                        className="peer sr-only"
                      />
                      <div className="h-5 w-5 rounded border-2 border-gray-300 transition-all duration-200 peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center">
                        <svg
                          className={`w-3 h-3 text-white transition-all duration-200 ${
                            selectedConditions.includes(option.value) ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <span className="text-sm font-body group-hover:text-primary transition-colors">
                      {option.label}
                    </span>
                    {count > 0 && (
                      <span className="text-xs text-muted-foreground ml-auto">({count})</span>
                    )}
                  </label>
                )
              })}
            </div>
          </div>

          <Separator />
        </>
      )}

      {/* Availability */}
      <div className="space-y-3">
        <button
          onClick={() => setAvailabilityExpanded(!availabilityExpanded)}
          className="flex items-center justify-between w-full group"
        >
          <h3 className="font-display font-semibold text-secondary group-hover:text-primary transition-colors">
            Availability
          </h3>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
              availabilityExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>

        <div
          className={`space-y-2 overflow-hidden transition-all duration-300 ${
            availabilityExpanded ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <label className="flex items-center space-x-3 cursor-pointer group p-2 rounded-lg hover:bg-muted transition-colors">
            <div className="relative">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => onInStockChange(e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-5 w-5 rounded border-2 border-gray-300 transition-all duration-200 peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center">
                <svg
                  className={`w-3 h-3 text-white transition-all duration-200 ${
                    inStockOnly ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <span className="text-sm font-body group-hover:text-primary transition-colors">In stock only</span>
          </label>
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-4">
        <button 
          onClick={() => setPriceExpanded(!priceExpanded)}
          className="flex items-center justify-between w-full group"
        >
          <h3 className="font-display font-semibold text-secondary group-hover:text-primary transition-colors">
            Price Range
          </h3>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${priceExpanded ? 'rotate-180' : ''}`} />
        </button>

        <div className={`space-y-4 overflow-hidden transition-all duration-300 ${priceExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input
                type="number"
                placeholder="From"
                value={priceRange[0] || ''}
                onChange={(e) =>
                  onPriceRangeChange([
                    Number(e.target.value) || 0,
                    priceRange[1],
                  ])
                }
                className="pl-7 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <span className="text-muted-foreground font-medium">–</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input
                type="number"
                placeholder="To"
                value={priceRange[1] || ''}
                onChange={(e) =>
                  onPriceRangeChange([
                    priceRange[0],
                    Number(e.target.value) || maxPrice,
                  ])
                }
                className="pl-7 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Quick price filters */}
          <div className="flex flex-wrap gap-2">
            {quickPriceRanges.map((range) => (
              <button
                key={range.key}
                onClick={() => onPriceRangeChange([range.min, range.max])}
                className={`px-3 py-1.5 text-xs rounded-full border transition-all duration-300 hover:scale-105 ${
                  priceRange[0] === range.min && priceRange[1] === range.max
                    ? 'bg-primary text-white border-primary'
                    : 'border-gray-300 hover:border-primary hover:text-primary'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Max price: ${maxPrice.toLocaleString()}
          </p>
        </div>
      </div>

      <Separator />

      {/* Clear Filters */}
      <Button
        variant="outline"
        className="w-full border-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all duration-300"
        onClick={() => {
          onBrandChange([])
          onSubcategoryChange([])
          onBadgeChange([])
          onConditionChange([])
          onInStockChange(false)
          onPriceRangeChange([0, maxPrice])
        }}
      >
        <X className="w-4 h-4 mr-2" />
        Clear All Filters
      </Button>
    </div>
  )

  if (mobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full relative group">
            <Filter className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
            Filters
            {hasActiveFilters && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center animate-scale-in">
                {selectedBrands.length + (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0)}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="font-display text-xl flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              Product Filters
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 overflow-y-auto max-h-[calc(85vh-120px)]">{content}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <aside className="w-72 border-r pr-6 sticky top-24 h-fit max-h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center gap-2 pb-4 flex-shrink-0">
        <Filter className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-display font-semibold text-secondary">Filters</h2>
      </div>
      <div className="overflow-y-auto flex-1 pr-2 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
        {content}
      </div>
    </aside>
  )
}
