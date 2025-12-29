'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, ShoppingCart, Menu, Phone } from 'lucide-react'
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
  const itemCount = useCartStore(state => state.getItemCount())
  const subtotal = useCartStore(state => state.getSubtotal())

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
        className={`sticky top-0 z-50 w-full border-b bg-white transition-shadow ${
          isScrolled ? 'shadow-md' : 'shadow-sm'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-primary">🎷</div>
              <span className="hidden text-xl font-semibold sm:block">
                Specialty Music Store
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center space-x-1 lg:flex">
              <MegaMenu />
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:block">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCartOpen(true)}
                className="relative"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {itemCount}
                  </span>
                )}
                <span className="ml-2 hidden text-sm font-medium lg:inline">
                  ${subtotal.toFixed(2)}
                </span>
              </Button>

              {/* Call CTA - Desktop */}
              <Button
                variant="outline"
                size="sm"
                className="hidden lg:flex"
                asChild
              >
                <Link href="tel:+17025551234">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Us
                </Link>
              </Button>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="border-t lg:hidden">
              <MegaMenu mobile />
            </div>
          )}
        </div>
      </header>

      {/* Search Overlay */}
      <SearchBar open={isSearchOpen} onOpenChange={setIsSearchOpen} />

      {/* Cart Drawer */}
      <MiniCartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  )
}

