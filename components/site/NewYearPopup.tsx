'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Clock, ChevronRight, Zap, Star, Trophy } from 'lucide-react'
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
        const response = await getProducts({ limit: 4, inStock: true })
        const transformed = response.products.map(transformProduct)
        setProducts(transformed)
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    }
    fetchProducts()
  }, [])

  // Show popup after 2.5 seconds
  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('premiumFlashSaleSeen')

    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true)
        localStorage.setItem('premiumFlashSaleSeen', 'true')
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [])

  // Countdown timer
  useEffect(() => {
    const endDate = new Date('2026-02-28T23:59:59').getTime()

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

  const handleClose = () => {
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 lg:p-12">
      {/* Dynamic Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-1000"
        onClick={handleClose}
      />

      {/* Luxury Popup Content */}
      <div className="relative w-full max-w-5xl bg-[#050505] rounded-[2rem] shadow-[0_0_100px_rgba(212,175,55,0.2)] overflow-hidden border border-white/10 flex flex-col md:flex-row min-h-[500px] animate-scale-in">

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent z-10" />
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#D4AF37] rounded-full blur-[120px] opacity-20" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/5 hover:bg-white/20 text-white/50 hover:text-white transition-all duration-300"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Left Side - Visual & Branding (40%) */}
        <div className="relative w-full md:w-2/5 h-64 md:h-auto overflow-hidden bg-zinc-900 border-r border-white/5">
          {products[0]?.images?.[0] ? (
            <Image
              src={products[0].images[0]}
              alt="Premium Saxophone"
              fill
              className="object-cover opacity-60 scale-110"
              priority
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-end p-8 space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-[#D4AF37] fill-[#D4AF37]" />
              <span className="text-[#D4AF37] font-black tracking-widest text-sm">LIMITED OFFER</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter leading-tight">
              MASTER<br />PRO COLLECTION
            </h2>
            <div className="flex items-center gap-4 text-white/60">
              <div className="flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                <span className="text-xs">World Class Quality</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                <span className="text-xs">Top Rated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Deals & Urgency (60%) */}
        <div className="flex-1 p-6 md:p-10 flex flex-col justify-between space-y-8">

          {/* Header & Timer Component */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">Flash Sale Ending Soon</h3>
                <p className="text-zinc-500 text-sm">Exclusive prices on selected professional instruments.</p>
              </div>
              <div className="hidden lg:block bg-orange-600/10 border border-orange-500/20 px-3 py-1 rounded-full">
                <span className="text-orange-500 text-xs font-bold animate-pulse">● LIVE NOW</span>
              </div>
            </div>

            {/* Premium Countdown */}
            <div className="flex gap-4">
              {[
                { value: timeLeft.days, label: 'DAYS' },
                { value: timeLeft.hours, label: 'HOURS' },
                { value: timeLeft.minutes, label: 'MINUTES' },
                { value: timeLeft.seconds, label: 'SECONDS' }
              ].map((item, i) => (
                <div key={i} className="flex-1">
                  <div className="relative group/time">
                    <div className="bg-[#111] border border-white/5 rounded-2xl h-16 md:h-20 flex items-center justify-center transform transition-transform group-hover/time:scale-105">
                      <span className="text-2xl md:text-4xl font-black text-white font-mono tracking-tighter">
                        {String(item.value).padStart(2, '0')}
                      </span>
                    </div>
                    <span className="text-[10px] md:text-[11px] font-bold text-zinc-500 mt-2 block text-center tracking-widest">{item.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Mini-Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold tracking-widest text-[#D4AF37]">
              <span>CURATED DEALS</span>
              <span className="text-zinc-600">UP TO 30% OFF</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.slice(1, 4).map((product) => (
                <Link
                  key={product.id}
                  href={`/shop/${product.slug}`}
                  onClick={handleClose}
                  className="group flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl p-3 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-110"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">{product.brand}</p>
                    <p className="text-xs font-bold text-white truncate group-hover:text-[#D4AF37] mb-1">{product.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white">${product.price.toLocaleString()}</span>
                      <span className="text-[10px] text-zinc-600 line-through">${(product.price * 1.2).toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Luxury CTA */}
          <div className="pt-2">
            <Button
              asChild
              className="w-full h-14 bg-gradient-to-r from-[#D4AF37] via-[#f7d774] to-[#D4AF37] hover:opacity-90 text-black font-black text-lg rounded-2xl group relative overflow-hidden transition-all duration-500 shadow-[0_10px_30px_rgba(212,175,55,0.3)]"
            >
              <Link href="/shop" onClick={handleClose}>
                <span className="relative z-10 flex items-center justify-center">
                  SECURE YOUR INSTRUMENT
                  <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </Link>
            </Button>
            <p className="text-center text-zinc-600 text-[10px] mt-4 font-medium tracking-widest uppercase">
              *Full warranty and maintenance included for all sale items
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
