'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
        className={`sticky top-0 z-50 w-full border-b bg-white transition-shadow ${isScrolled ? 'shadow-md' : 'shadow-sm'
          }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-24 items-center justify-between">
            {/* Logo - Larger and more prominent */}
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="James Sax Corner"
                width={280}
                height={80}
                className="h-16 w-auto md:h-20"
                priority
              />
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
                  className="text-secondary hover:text-primary"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCartOpen(true)}
                className="relative text-secondary hover:text-primary"
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
                size="sm"
                className="hidden lg:flex bg-secondary hover:bg-secondary/90"
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
                className="lg:hidden text-secondary"
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
