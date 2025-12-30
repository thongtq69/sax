'use client'

import { useState } from 'react'
import { products } from '@/lib/data'
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
  brands: string[]
  selectedBrands: string[]
  onBrandChange: (brands: string[]) => void
  priceRange: [number, number]
  onPriceRangeChange: (range: [number, number]) => void
  mobile?: boolean
}

export function Filters({
  brands,
  selectedBrands,
  onBrandChange,
  priceRange,
  onPriceRangeChange,
  mobile = false,
}: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [brandExpanded, setBrandExpanded] = useState(true)
  const [priceExpanded, setPriceExpanded] = useState(true)

  const allBrands = Array.from(new Set(products.map((p) => p.brand))).sort()
  const maxPrice = Math.max(...products.map((p) => p.price))

  const handleBrandToggle = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      onBrandChange(selectedBrands.filter((b) => b !== brand))
    } else {
      onBrandChange([...selectedBrands, brand])
    }
  }

  const hasActiveFilters = selectedBrands.length > 0 || priceRange[0] > 0 || priceRange[1] < maxPrice

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
                onPriceRangeChange([0, maxPrice])
              }}
              className="text-xs text-destructive hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Xóa tất cả
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
            {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-accent/10 text-accent rounded-full">
                ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
              </span>
            )}
          </div>
        </div>
      )}

      {hasActiveFilters && <Separator />}

      {/* Brand Filter */}
      <div className="space-y-3">
        <button 
          onClick={() => setBrandExpanded(!brandExpanded)}
          className="flex items-center justify-between w-full group"
        >
          <h3 className="font-display font-semibold text-secondary group-hover:text-primary transition-colors">
            Thương hiệu
          </h3>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${brandExpanded ? 'rotate-180' : ''}`} />
        </button>
        
        <div className={`space-y-2 overflow-hidden transition-all duration-300 ${brandExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          {allBrands.map((brand, index) => (
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
                ({products.filter(p => p.brand === brand).length})
              </span>
            </label>
          ))}
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
            Khoảng giá
          </h3>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${priceExpanded ? 'rotate-180' : ''}`} />
        </button>

        <div className={`space-y-4 overflow-hidden transition-all duration-300 ${priceExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input
                type="number"
                placeholder="Từ"
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
                placeholder="Đến"
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
            {[
              { label: 'Dưới $1,000', min: 0, max: 1000 },
              { label: '$1,000 - $5,000', min: 1000, max: 5000 },
              { label: '$5,000 - $10,000', min: 5000, max: 10000 },
              { label: 'Trên $10,000', min: 10000, max: maxPrice },
            ].map((range, index) => (
              <button
                key={index}
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
            Giá cao nhất: ${maxPrice.toLocaleString()}
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
    <aside className="w-72 space-y-6 border-r pr-6 sticky top-24 h-fit">
      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-display font-semibold text-secondary">Filters</h2>
      </div>
      {content}
    </aside>
  )
}
