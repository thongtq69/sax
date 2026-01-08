'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, ShoppingCart, Menu, X, User, LogIn, MessageCircle } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { Button } from '@/components/ui/button'
import { SearchBar } from './SearchBar'
import { MiniCartDrawer } from '@/components/cart/MiniCartDrawer'
import { TestimonialsPopup } from './TestimonialsPopup'
import { UserMenu } from '@/components/auth/UserMenu'
import { cn } from '@/lib/utils'

// Social Media Icons
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
)

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

interface SocialLinks {
  facebook?: string
  youtube?: string
  instagram?: string
  twitter?: string
}

// Login/Register Modal Component - REMOVED (using NextAuth pages instead)

const defaultSocialLinks = {
  facebook: 'https://www.facebook.com/jamessaxcorner',
  youtube: 'https://www.youtube.com/@jamessaxcorner',
  instagram: 'https://instagram.com',
  twitter: 'https://twitter.com',
}

export function Header() {
  const { data: session, status } = useSession()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isTestimonialsOpen, setIsTestimonialsOpen] = useState(false)
  const [cartBounce, setCartBounce] = useState(false)
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(defaultSocialLinks)
  const [isMounted, setIsMounted] = useState(false)
  const lastScrollY = useRef(0)
  const itemCount = useCartStore(state => state.getItemCount())
  const subtotal = useCartStore(state => state.getSubtotal())

  // Prevent hydration mismatch by only rendering cart values on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Fetch social links from database
  useEffect(() => {
    async function fetchSocialLinks() {
      try {
        const response = await fetch('/api/admin/site-settings')
        if (response.ok) {
          const data = await response.json()
          const dbSocialLinks = data.socialLinks || {}
          setSocialLinks({
            facebook: dbSocialLinks.facebook || defaultSocialLinks.facebook,
            youtube: dbSocialLinks.youtube || defaultSocialLinks.youtube,
            instagram: dbSocialLinks.instagram || defaultSocialLinks.instagram,
            twitter: dbSocialLinks.twitter || defaultSocialLinks.twitter,
          })
        }
      } catch (error) {
        console.error('Error fetching social links:', error)
      }
    }
    fetchSocialLinks()
  }, [])

  // Build social icons array from database
  const socialIconsData = [
    { href: socialLinks.facebook, icon: FacebookIcon, label: 'Facebook' },
    { href: socialLinks.instagram, icon: InstagramIcon, label: 'Instagram' },
    { href: socialLinks.youtube, icon: YoutubeIcon, label: 'YouTube' },
    { href: socialLinks.twitter, icon: XIcon, label: 'X' },
  ].filter(s => s.href)

  useEffect(() => {
    if (itemCount > 0) {
      setCartBounce(true)
      const timer = setTimeout(() => setCartBounce(false), 500)
      return () => clearTimeout(timer)
    }
  }, [itemCount])

  // Enhanced scroll handling with direction detection
  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY

          // Determine if scrolled past threshold
          setIsScrolled(currentScrollY > 10)

          // Hide header on scroll down, show on scroll up (only after scrolling 100px)
          if (currentScrollY > 100) {
            if (currentScrollY > lastScrollY.current && currentScrollY > 200) {
              // Scrolling down & past 200px - hide header
              setIsHidden(true)
            } else if (currentScrollY < lastScrollY.current) {
              // Scrolling up - show header
              setIsHidden(false)
            }
          } else {
            setIsHidden(false)
          }

          lastScrollY.current = currentScrollY
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-500 relative overflow-hidden",
          isScrolled ? 'shadow-lg backdrop-blur-sm' : 'shadow-sm',
          isHidden && !isMobileMenuOpen ? '-translate-y-full' : 'translate-y-0'
        )}
        style={{ backgroundColor: '#AFA65F' }} // Match logo background color
      >
        {/* Music Note Pattern Background */}
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url('/musicnote.svg')`,
              backgroundSize: '150px 150px',
              backgroundRepeat: 'repeat',
            }}
          />
        </div>
        <div className="container mx-auto px-4">
          <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-[56px] md:h-16' : 'h-[64px] md:h-20'
            }`}>

            {/* Left: Logo */}
            <Link href="/" className="flex items-center shrink-0 group">
              <Image
                src="/logo.png"
                alt="James Sax Corner"
                width={320}
                height={90}
                className={`site-logo header-logo w-auto transition-all duration-500 group-hover:scale-105 ${isScrolled ? 'h-[52px] md:h-[64px]' : 'h-[60px] md:h-[72px]'
                  }`}
                priority
              />
            </Link>

            {/* Center: Search Box - fills the gap */}
            <div className="hidden lg:flex flex-1 max-w-md mx-6">
              <div
                className="relative w-full cursor-pointer"
                onClick={() => setIsSearchOpen(true)}
              >
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full h-9 pl-10 pr-4 rounded-full bg-white/80 border border-[#2c3e50]/20 text-sm text-[#2c3e50] placeholder-[#2c3e50]/50 focus:outline-none focus:ring-2 focus:ring-[#2c3e50]/30 focus:bg-white transition-all font-body cursor-pointer"
                  readOnly
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2c3e50]/50" />
              </div>
            </div>

            {/* Right: Navigation & Actions */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Navigation Links */}
              <nav className="flex items-center gap-5 text-sm font-medium">
                <Link href="/shop" className="text-[#2c3e50] hover:text-[#1a252f] transition-all duration-300 relative group/nav font-body">
                  Shop
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2c3e50] transition-all duration-300 group-hover/nav:w-full" />
                </Link>
                <Link href="/about" className="text-[#2c3e50] hover:text-[#1a252f] transition-all duration-300 relative group/nav font-body">
                  About Us
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2c3e50] transition-all duration-300 group-hover/nav:w-full" />
                </Link>
                <button
                  onClick={() => setIsTestimonialsOpen(true)}
                  className="text-[#2c3e50] hover:text-[#1a252f] transition-all duration-300 relative group/nav font-body"
                >
                  Testimonials
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2c3e50] transition-all duration-300 group-hover/nav:w-full" />
                </button>
                <Link href="/blog" className="text-[#2c3e50] hover:text-[#1a252f] transition-all duration-300 relative group/nav font-body">
                  Blog
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2c3e50] transition-all duration-300 group-hover/nav:w-full" />
                </Link>
              </nav>

              {/* Divider */}
              <div className="h-5 w-px bg-[#2c3e50]/30" />

              {/* Social Icons */}
              <div className="flex items-center gap-1.5">
                {socialIconsData.map((social, i) => (
                  <Link
                    key={social.label}
                    href={social.href || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-[#2c3e50]/20 p-1.5 hover:bg-[#2c3e50]/40 hover:scale-110 hover:rotate-6 transition-all duration-300"
                    aria-label={social.label}
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <social.icon className="h-3.5 w-3.5 text-[#2c3e50]" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Cart */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCartOpen(true)}
                className={`text-[#2c3e50] hover:text-[#1a252f] hover:bg-[#2c3e50]/10 transition-all duration-300 h-8 px-2 ${cartBounce ? 'animate-cart-shake' : ''
                  }`}
                aria-label="Shopping cart"
              >
                <ShoppingCart className={`h-4 w-4 mr-1 transition-transform ${cartBounce ? 'scale-125' : ''}`} />
                {isMounted && itemCount > 0 && (
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full bg-[#2c3e50] text-[10px] font-bold text-white mr-1 transition-all duration-300 ${cartBounce ? 'scale-125 animate-bounce' : ''}`}>
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
                {isMounted ? (
                  <span className="font-semibold text-xs font-body">${subtotal.toFixed(0)}</span>
                ) : (
                  <span className="font-semibold text-xs font-body">$0</span>
                )}
              </Button>

              {/* Auth Section */}
              {status === 'loading' ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
              ) : session?.user ? (
                <UserMenu user={session.user} />
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-[#2c3e50] text-[#2c3e50] hover:bg-[#2c3e50] hover:text-white font-semibold hover:scale-105 transition-all duration-300 group h-8 px-3 font-body"
                  asChild
                >
                  <Link href="/auth/login">
                    <LogIn className="mr-1.5 h-3.5 w-3.5 transition-transform group-hover:rotate-12" />
                    Login
                  </Link>
                </Button>
              )}

              {/* Inquiry Button */}
              <Button
                size="sm"
                className="bg-primary text-white hover:bg-primary/90 font-semibold hover:scale-105 hover:shadow-lg transition-all duration-300 group h-8 px-3 font-body"
                asChild
              >
                <Link href="/inquiry">
                  <MessageCircle className="mr-1.5 h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                  Inquiry
                </Link>
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
                {isMounted && itemCount > 0 && (
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
          <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-[350px] opacity-100 border-t border-[#2c3e50]/20' : 'max-h-0 opacity-0'
            }`}>
            <div className="py-3 space-y-2">
              {/* Social Icons - Compact */}
              <div className="flex items-center gap-2 pb-2 border-b border-[#2c3e50]/10">
                {socialIconsData.map((social) => (
                  <Link
                    key={social.label}
                    href={social.href || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 lg:w-auto lg:h-auto lg:p-1.5 rounded-full bg-[#2c3e50]/15 hover:bg-[#2c3e50]/30 transition-all flex items-center justify-center"
                    aria-label={social.label}
                  >
                    <social.icon className="h-4 w-4 lg:h-3.5 lg:w-3.5 text-[#2c3e50]" />
                  </Link>
                ))}
              </div>

              {/* Nav Links - Compact Grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {session?.user ? (
                  <Link
                    href="/account/profile"
                    className="flex items-center gap-2 text-[#2c3e50] font-medium py-1.5 text-sm font-body"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-3.5 w-3.5" />
                    My Account
                  </Link>
                ) : (
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-2 text-[#2c3e50] font-medium py-1.5 text-sm font-body"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    Login / Register
                  </Link>
                )}
                <Link
                  href="/about"
                  className="flex items-center text-[#2c3e50] font-medium py-1.5 text-sm font-body"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About Us
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    setIsTestimonialsOpen(true)
                  }}
                  className="flex items-center text-[#2c3e50] font-medium py-1.5 text-sm font-body"
                >
                  Testimonials
                </button>
                <Link
                  href="/blog"
                  className="flex items-center text-[#2c3e50] font-medium py-1.5 text-sm font-body"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Blog
                </Link>
                <Link
                  href="/shop"
                  className="flex items-center text-[#2c3e50] font-medium py-1.5 text-sm font-body col-span-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Shop All Instruments
                </Link>
              </div>

              {/* Inquiry Button - Compact */}
              <Button
                className="w-full bg-primary text-white hover:bg-primary/90 font-semibold mt-1 font-body h-9 text-sm"
                asChild
              >
                <Link href="/inquiry">
                  <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                  Product Inquiry
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      <SearchBar open={isSearchOpen} onOpenChange={setIsSearchOpen} />

      {/* Cart Drawer */}
      <MiniCartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />

      {/* Testimonials Popup */}
      <TestimonialsPopup isOpen={isTestimonialsOpen} onClose={() => setIsTestimonialsOpen(false)} />
    </>
  )
}
