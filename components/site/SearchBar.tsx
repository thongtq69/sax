'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { products } from '@/lib/data'
import Link from 'next/link'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface SearchBarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchBar({ open, onOpenChange }: SearchBarProps) {
  const [query, setQuery] = useState('')

  const filteredProducts = query
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.brand.toLowerCase().includes(query.toLowerCase())
      )
    : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <div className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-10"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                onClick={() => setQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {query && (
            <div className="mt-4 max-h-96 space-y-2 overflow-y-auto">
              {filteredProducts.length > 0 ? (
                filteredProducts.slice(0, 10).map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center space-x-4 rounded-md p-3 hover:bg-gray-50"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-16 w-16 rounded object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">
                        {product.brand}
                      </div>
                      <div className="text-sm font-semibold text-primary">
                        ${product.price.toFixed(2)}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="py-8 text-center text-gray-500">
                  No products found
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

