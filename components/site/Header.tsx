'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, ShoppingCart, Phone, Menu, X, Loader2, User, Facebook, Instagram, Youtube, Twitter } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { Button } from '@/components/ui/button'
import { SearchBar } from './SearchBar'
import { MiniCartDrawer } from '@/components/cart/MiniCartDrawer'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartBounce, setCartBounce] = useState(false)
  const [isCalling, setIsCalling] = useState(false)
  const itemCount = useCartStore(state => state.getItemCount())
  const subtotal = useCartStore(state => state.getSubtotal())

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
        className={`sticky top-0 z-50 w-full transition-all duration-500 ${isScrolled ? 'shadow-lg' : 'shadow-sm'
          }`}
        style={{ backgroundColor: '#AFA65F' }} // Match logo background color
      >
        <div className="container mx-auto px-4">
          <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-[56px] md:h-16' : 'h-[64px] md:h-20'
            }`}>

            {/* Left: Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <Image
                src="/logo.png"
                alt="James Sax Corner"
                width={280}
                height={80}
                className={`site-logo header-logo w-auto transition-all duration-300 ${isScrolled ? 'h-[44px] md:h-[54px]' : 'h-[52px] md:h-[62px]'
                  }`}
                priority
              />
            </Link>

            {/* Right: All navigation items */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Social Icons */}
              <div className="flex items-center gap-1.5 mr-2">
                {[
                  { href: 'https://facebook.com', icon: Facebook, label: 'Facebook' },
                  { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
                  { href: 'https://youtube.com', icon: Youtube, label: 'YouTube' },
                  { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
                ].map((social) => (
                  <Link
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-[#2c3e50]/20 p-1.5 hover:bg-[#2c3e50]/40 transition-all"
                    aria-label={social.label}
                  >
                    <social.icon className="h-3.5 w-3.5 text-[#2c3e50]" />
                  </Link>
                ))}
              </div>

              {/* Divider */}
              <div className="h-6 w-px bg-[#2c3e50]/30" />

              {/* Navigation Links */}
              <nav className="flex items-center gap-4 text-sm font-medium">
                <Link href="/account" className="flex items-center gap-1 text-[#2c3e50] hover:text-[#1a252f] transition-colors">
                  <User className="h-4 w-4" />
                  My Account
                </Link>
                <Link href="/about" className="text-[#2c3e50] hover:text-[#1a252f] transition-colors">
                  About Us
                </Link>
                <Link href="/contact" className="text-[#2c3e50] hover:text-[#1a252f] transition-colors">
                  Contact
                </Link>
                <Link href="/blog" className="text-[#2c3e50] hover:text-[#1a252f] transition-colors">
                  Blog
                </Link>
              </nav>

              {/* Divider */}
              <div className="h-6 w-px bg-[#2c3e50]/30" />

              {/* Search */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search"
                className="text-[#2c3e50] hover:text-[#1a252f] hover:bg-[#2c3e50]/10"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCartOpen(true)}
                className={`text-[#2c3e50] hover:text-[#1a252f] hover:bg-[#2c3e50]/10 ${cartBounce ? 'animate-wiggle' : ''
                  }`}
                aria-label="Shopping cart"
              >
                <ShoppingCart className="h-5 w-5 mr-1" />
                {itemCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2c3e50] text-xs font-bold text-white mr-1">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
                <span className="font-semibold">Cart ${subtotal.toFixed(0)}</span>
              </Button>

              {/* Call Us Button */}
              <Button
                size="sm"
                className="bg-[#2c3e50] text-white hover:bg-[#1a252f] font-semibold"
                onClick={() => {
                  setIsCalling(true)
                  setTimeout(() => {
                    window.location.href = 'tel:+17025551234'
                    setIsCalling(false)
                  }, 100)
                }}
                disabled={isCalling}
              >
                {isCalling ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Phone className="mr-2 h-4 w-4" />
                )}
                {isCalling ? 'Calling...' : 'Call Us'}
              </Button>
            </div>

            {/* Mobile: Right side icons */}
            <div className="flex lg:hidden items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="header-icon-button text-[#2c3e50] hover:bg-[#2c3e50]/10"
              >
                <Search className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCartOpen(true)}
                className="header-icon-button relative text-[#2c3e50] hover:bg-[#2c3e50]/10"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#2c3e50] text-xs font-bold text-white">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="header-icon-button text-[#2c3e50] hover:bg-[#2c3e50]/10"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Menu"
              >
                <div className="relative w-5 h-5">
                  <Menu className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'
                    }`} />
                  <X className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
                    }`} />
                </div>
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-[400px] opacity-100 border-t border-[#2c3e50]/20' : 'max-h-0 opacity-0'
            }`}>
            <div className="py-4 space-y-3">
              {/* Social Icons */}
              <div className="flex items-center gap-2 pb-3 border-b border-[#2c3e50]/20">
                {[
                  { href: 'https://facebook.com', icon: Facebook, label: 'Facebook' },
                  { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
                  { href: 'https://youtube.com', icon: Youtube, label: 'YouTube' },
                  { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
                ].map((social) => (
                  <Link
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-[#2c3e50]/20 p-2 hover:bg-[#2c3e50]/40 transition-all"
                    aria-label={social.label}
                  >
                    <social.icon className="h-4 w-4 text-[#2c3e50]" />
                  </Link>
                ))}
              </div>

              {/* Nav Links */}
              <Link
                href="/account"
                className="flex items-center gap-2 text-[#2c3e50] font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                My Account
              </Link>
              <Link
                href="/about"
                className="block text-[#2c3e50] font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="block text-[#2c3e50] font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                href="/blog"
                className="block text-[#2c3e50] font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="/shop"
                className="block text-[#2c3e50] font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Shop All Instruments
              </Link>

              {/* Call Button */}
              <Button
                className="w-full bg-[#2c3e50] text-white hover:bg-[#1a252f] font-semibold mt-2"
                onClick={() => {
                  setIsCalling(true)
                  setTimeout(() => {
                    window.location.href = 'tel:+17025551234'
                    setIsCalling(false)
                  }, 100)
                }}
                disabled={isCalling}
              >
                {isCalling ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Phone className="mr-2 h-4 w-4" />
                )}
                {isCalling ? 'Calling...' : 'Call (702) 555-1234'}
              </Button>
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
