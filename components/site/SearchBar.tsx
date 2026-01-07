'use client'

import { useState, useEffect } from 'react'
import { Search, X, Sparkles, TrendingUp, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { products } from '@/lib/data'
import Link from 'next/link'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { getProductUrl } from '@/lib/api'

interface SearchBarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const popularSearches = ['Saxophone', 'Alto', 'Tenor', 'Yamaha', 'Selmer']
const recentSearches = ['Professional Saxophone', 'Student Alto']

export function SearchBar({ open, onOpenChange }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const filteredProducts = query
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.brand.toLowerCase().includes(query.toLowerCase())
      )
    : []

  // Typing indicator effect
  useEffect(() => {
    if (query) {
      setIsTyping(true)
      const timer = setTimeout(() => setIsTyping(false), 300)
      return () => clearTimeout(timer)
    }
  }, [query])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-0 shadow-2xl animate-scale-in">
        {/* Gradient header */}
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-6 pb-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <Search className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-all duration-300 ${isTyping ? 'text-primary scale-110' : 'text-gray-400'}`} />
              <Input
                type="text"
                placeholder="Search for saxophones, brands, accessories..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-12 pr-12 h-14 text-lg border-2 border-primary/20 focus:border-primary rounded-xl bg-white/80 backdrop-blur-sm shadow-lg transition-all duration-300 focus:shadow-xl focus:scale-[1.01]"
                autoFocus
              />
              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2 hover:bg-red-100 hover:text-red-500 rounded-full transition-all duration-300 hover:rotate-90"
                  onClick={() => setQuery('')}
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 pt-2 max-h-[60vh] overflow-y-auto">
          {/* No query - show suggestions */}
          {!query && (
            <div className="space-y-6 animate-fade-in-up">
              {/* Popular searches */}
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-secondary mb-3">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Popular Searches
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term, i) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 text-sm font-medium text-secondary hover:from-primary hover:to-accent hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in-up"
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent searches */}
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-secondary mb-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Recent Searches
                </div>
                <div className="space-y-1">
                  {recentSearches.map((term, i) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="w-full text-left px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-primary/5 hover:text-secondary transition-all duration-200 flex items-center gap-2 group animate-fade-in-up"
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <Search className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Search results */}
          {query && (
            <div className="space-y-2">
              {/* Results count */}
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  {filteredProducts.length} results for "{query}"
                </span>
              </div>

              {filteredProducts.length > 0 ? (
                filteredProducts.slice(0, 10).map((product, index) => (
                  <Link
                    key={product.id}
                    href={getProductUrl(product.sku, product.name)}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center space-x-4 rounded-xl p-3 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition-all duration-300 group border border-transparent hover:border-primary/20 hover:shadow-lg animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -translate-x-full group-hover:translate-x-full" style={{ transitionDuration: '0.8s' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-secondary group-hover:text-primary transition-colors line-clamp-1">
                        {product.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {product.brand}
                      </div>
                      <div className="text-sm font-bold text-primary mt-1 flex items-center gap-2">
                        ${product.price.toLocaleString()}
                        {product.retailPrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            ${product.retailPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Search className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="py-12 text-center animate-fade-in-up">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Search className="h-8 w-8 text-gray-300" />
                  </div>
                  <p className="text-lg font-medium text-secondary mb-2">No products found</p>
                  <p className="text-sm text-muted-foreground">Try searching for something else</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

