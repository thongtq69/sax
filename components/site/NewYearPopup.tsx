'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Clock, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getProducts, transformProduct } from '@/lib/api'
import type { Product } from '@/lib/data'

export function NewYearPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  // Fetch featured products
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await getProducts({ limit: 3, inStock: true })
        const transformed = response.products.map(transformProduct)
        setProducts(transformed)
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    }
    fetchProducts()
  }, [])

  // Show popup after 2 seconds, only once (stored in localStorage)
  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('newYear2026PopupSeen')
    
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true)
        localStorage.setItem('newYear2026PopupSeen', 'true')
      }, 2000)
      return () => clearTimeout(timer)
    }
    // If already seen, don't show anything
  }, [])

  // Countdown timer - ends Jan 15, 2026
  useEffect(() => {
    const endDate = new Date('2026-01-15T23:59:59').getTime()
    
    const updateCountdown = () => {
      const now = new Date().getTime()
      const distance = endDate - now

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        })
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  // Handle close - completely close the popup
  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* Full Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70"
            onClick={handleClose}
          />
          
          {/* Popup Content */}
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/10 hover:bg-black/20 text-secondary transition-all duration-300"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col md:flex-row">
              {/* Left Side - Image */}
              <div className="relative w-full md:w-2/5 h-48 md:h-auto min-h-[200px] md:min-h-[400px] bg-gradient-to-br from-secondary to-secondary/90">
                {products[0]?.images?.[0] ? (
                  <Image
                    src={products[0].images[0]}
                    alt="Featured Saxophone"
                    fill
                    className="object-cover opacity-80"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <p className="text-amber-400 text-sm font-medium mb-1">NEW YEAR 2026</p>
                  <h2 className="text-2xl md:text-3xl font-bold mb-1">FLASH SALE</h2>
                  <p className="text-white/80 text-sm">Up to 30% OFF</p>
                </div>
              </div>

              {/* Right Side - Content */}
              <div className="flex-1 p-6 md:p-8">
                {/* Countdown Timer */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-secondary/70 text-sm mb-3">
                    <Clock className="h-4 w-4" />
                    <span>Sale ends in:</span>
                  </div>
                  <div className="flex gap-3">
                    {[
                      { value: timeLeft.days, label: 'Days' },
                      { value: timeLeft.hours, label: 'Hours' },
                      { value: timeLeft.minutes, label: 'Min' },
                      { value: timeLeft.seconds, label: 'Sec' }
                    ].map((item, i) => (
                      <div key={i} className="text-center">
                        <div className="bg-secondary text-white rounded-lg px-3 py-2 min-w-[48px]">
                          <span className="text-xl font-bold">
                            {String(item.value).padStart(2, '0')}
                          </span>
                        </div>
                        <span className="text-[10px] text-secondary/60 mt-1 block">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Featured Products */}
                <div className="mb-6">
                  <p className="text-secondary/70 text-sm mb-3">Featured Deals</p>
                  <div className="space-y-3">
                    {products.slice(0, 3).map((product) => (
                      <Link
                        key={product.id}
                        href={`/shop/${product.slug}`}
                        onClick={handleClose}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <span className="text-2xl">🎷</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-secondary truncate group-hover:text-primary transition-colors">
                            {product.name}
                          </p>
                          <p className="text-xs text-secondary/60">{product.brand}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-primary font-bold">${product.price.toLocaleString()}</span>
                            {product.retailPrice && product.retailPrice > product.price && (
                              <span className="text-xs text-secondary/40 line-through">
                                ${product.retailPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  asChild
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-5 text-base group"
                >
                  <Link href="/shop" onClick={handleClose}>
                    Shop All Deals
                    <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>

                <p className="text-center text-secondary/40 text-xs mt-4">
                  *Valid until January 15, 2026
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
