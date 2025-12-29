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
import { Filter } from 'lucide-react'

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

  const allBrands = Array.from(new Set(products.map((p) => p.brand))).sort()

  const handleBrandToggle = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      onBrandChange(selectedBrands.filter((b) => b !== brand))
    } else {
      onBrandChange([...selectedBrands, brand])
    }
  }

  const maxPrice = Math.max(...products.map((p) => p.price))

  const content = (
    <div className="space-y-6">
      {/* Brand Filter */}
      <div>
        <h3 className="mb-3 font-semibold">Brand</h3>
        <div className="space-y-2">
          {allBrands.map((brand) => (
            <label
              key={brand}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => handleBrandToggle(brand)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h3 className="mb-3 font-semibold">Price Range</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="Min"
              value={priceRange[0] || ''}
              onChange={(e) =>
                onPriceRangeChange([
                  Number(e.target.value) || 0,
                  priceRange[1],
                ])
              }
              className="w-full"
            />
            <span className="text-gray-500">to</span>
            <Input
              type="number"
              placeholder="Max"
              value={priceRange[1] || ''}
              onChange={(e) =>
                onPriceRangeChange([
                  priceRange[0],
                  Number(e.target.value) || maxPrice,
                ])
              }
              className="w-full"
            />
          </div>
          <div className="text-xs text-gray-500">
            Max: ${maxPrice.toFixed(2)}
          </div>
        </div>
      </div>

      <Separator />

      {/* Clear Filters */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          onBrandChange([])
          onPriceRangeChange([0, maxPrice])
        }}
      >
        Clear All Filters
      </Button>
    </div>
  )

  if (mobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6">{content}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <aside className="w-64 space-y-6 border-r pr-6">
      <h2 className="text-lg font-semibold">Filters</h2>
      {content}
    </aside>
  )
}

