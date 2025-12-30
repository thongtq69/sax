'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, ShoppingCart, Menu, Phone, X, Music } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { Button } from '@/components/ui/button'
import { MegaMenu } from './MegaMenu'
import { SearchBar } from './SearchBar'
import { MiniCartDrawer } from '@/components/cart/MiniCartDrawer'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartBounce, setCartBounce] = useState(false)
  const itemCount = useCartStore(state => state.getItemCount())
  const subtotal = useCartStore(state => state.getSubtotal())

  // Watch for cart changes to trigger animation
  useEffect(() => {
    if (itemCount > 0) {
      setCartBounce(true)
      const timer = setTimeout(() => setCartBounce(false), 500)
      return () => clearTimeout(timer)
    }
  }, [itemCount])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md transition-all duration-500 ${
          isScrolled 
            ? 'shadow-lg py-2' 
            : 'shadow-sm py-0'
        }`}
      >
        {/* Top announcement bar */}
        <div className={`bg-secondary text-white text-center text-sm py-2 transition-all duration-300 overflow-hidden ${
          isScrolled ? 'max-h-0 py-0 opacity-0' : 'max-h-10 opacity-100'
        }`}>
          <div className="container mx-auto px-4 flex items-center justify-center gap-2">
            <Music className="h-4 w-4 animate-bounce-soft" />
            <span className="font-medium">Free Shipping on Orders Over $500</span>
            <span className="text-primary">•</span>
            <span>0% APR Financing Available</span>
            <Music className="h-4 w-4 animate-bounce-soft" style={{ animationDelay: '0.3s' }} />
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className={`flex items-center justify-between transition-all duration-300 ${
            isScrolled ? 'h-16' : 'h-20'
          }`}>
            {/* Logo with hover effect */}
            <Link href="/" className="flex items-center group logo-hover">
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="James Sax Corner"
                  width={280}
                  height={80}
                  className={`w-auto transition-all duration-300 ${
                    isScrolled ? 'h-12 md:h-14' : 'h-14 md:h-16'
                  }`}
                  priority
                />
                {/* Subtle glow on hover */}
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 rounded-lg transition-colors duration-300" />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center space-x-1 lg:flex">
              <MegaMenu />
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Search */}
              <div className="hidden md:block">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Search"
                  className="relative text-secondary hover:text-primary hover:bg-primary/10 transition-all duration-300 group"
                >
                  <Search className="h-5 w-5 transition-transform group-hover:scale-110" />
                  {/* Tooltip */}
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-secondary text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Search
                  </span>
                </Button>
              </div>

              {/* Cart with animations */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCartOpen(true)}
                className={`relative text-secondary hover:text-primary hover:bg-primary/10 transition-all duration-300 ${
                  cartBounce ? 'animate-wiggle' : ''
                }`}
                aria-label="Shopping cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-lg transition-all duration-300 ${
                    cartBounce ? 'scale-125' : 'scale-100'
                  }`}>
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
                <span className="ml-2 hidden text-sm font-semibold lg:inline text-secondary">
                  ${subtotal.toFixed(0)}
                </span>
              </Button>

              {/* Call CTA with pulse effect */}
              <Button
                size="sm"
                className="hidden lg:flex bg-secondary hover:bg-secondary/90 group relative overflow-hidden"
                asChild
              >
                <Link href="tel:+17025551234">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <Phone className="mr-2 h-4 w-4 group-hover:animate-wiggle" />
                  Call Us
                </Link>
              </Button>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-secondary hover:text-primary hover:bg-primary/10"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Menu"
              >
                <div className="relative w-5 h-5">
                  <Menu className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
                    isMobileMenuOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'
                  }`} />
                  <X className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
                    isMobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
                  }`} />
                </div>
              </Button>
            </div>
          </div>

          {/* Mobile Menu with slide animation */}
          <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-[500px] opacity-100 border-t' : 'max-h-0 opacity-0'
          }`}>
            <div className="py-4">
              <MegaMenu mobile />
              
              {/* Mobile-only actions */}
              <div className="mt-4 pt-4 border-t flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setIsSearchOpen(true)
                    setIsMobileMenuOpen(false)
                  }}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Search Products
                </Button>
                <Button className="w-full justify-start bg-secondary" asChild>
                  <Link href="tel:+17025551234">
                    <Phone className="mr-2 h-4 w-4" />
                    Call (702) 555-1234
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      <SearchBar open={isSearchOpen} onOpenChange={setIsSearchOpen} />

      {/* Cart Drawer */}
      <MiniCartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  )
}
