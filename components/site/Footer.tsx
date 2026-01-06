'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Phone, MapPin, Clock, Music, Heart, Mail, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TestimonialsPopup } from './TestimonialsPopup'

// Social Media Icons
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

// X (Twitter) icon component
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

interface SiteSettings {
  companyName: string
  address: string
  phone: string
  email: string
  workingHours: string
  socialLinks: SocialLinks
  footerText: string
  copyrightText: string
}

const defaultSettings: SiteSettings = {
  companyName: 'James Sax Corner',
  address: 'Ha Noi, Viet Nam',
  phone: '(702) 555-1234',
  email: 'info@jamessaxcorner.com',
  workingHours: '24/7',
  socialLinks: {
    facebook: 'https://www.facebook.com/jamessaxcorner',
    youtube: 'https://www.youtube.com/@jamessaxcorner',
    instagram: 'https://instagram.com',
    twitter: 'https://twitter.com',
  },
  footerText: '',
  copyrightText: '© 2024 James Sax Corner. All rights reserved.',
}

export function Footer() {
  const [showTestimonials, setShowTestimonials] = useState(false)
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/admin/site-settings')
        if (response.ok) {
          const data = await response.json()
          // Merge socialLinks with defaults - use database value if exists, otherwise use default
          const dbSocialLinks = data.socialLinks || {}
          const mergedSocialLinks = {
            facebook: dbSocialLinks.facebook || defaultSettings.socialLinks.facebook,
            youtube: dbSocialLinks.youtube || defaultSettings.socialLinks.youtube,
            instagram: dbSocialLinks.instagram || defaultSettings.socialLinks.instagram,
            twitter: dbSocialLinks.twitter || defaultSettings.socialLinks.twitter,
          }
          setSettings({
            companyName: data.companyName || defaultSettings.companyName,
            address: data.address || defaultSettings.address,
            phone: data.phone || defaultSettings.phone,
            email: data.email || defaultSettings.email,
            workingHours: data.workingHours || defaultSettings.workingHours,
            socialLinks: mergedSocialLinks,
            footerText: data.footerText || '',
            copyrightText: data.copyrightText || defaultSettings.copyrightText,
          })
        }
      } catch (error) {
        console.error('Error fetching site settings:', error)
      }
    }
    fetchSettings()
  }, [])

  const socialLinks = [
    { href: settings.socialLinks.facebook, icon: FacebookIcon, label: 'Facebook' },
    { href: settings.socialLinks.instagram, icon: InstagramIcon, label: 'Instagram' },
    { href: settings.socialLinks.youtube, icon: YoutubeIcon, label: 'YouTube' },
    { href: settings.socialLinks.twitter, icon: XIcon, label: 'X' },
  ].filter(s => s.href)

  return (
    <footer className="bg-[#2f3f4f] text-white">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 md:py-6">
        
        {/* Mobile Layout */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-white/10">
            <h3 className="text-[11px] font-bold text-white flex items-center gap-1">
              <span className="text-[#D4AF37] text-xs animate-pulse">★</span>
              Need Help?
            </h3>
            <div className="flex gap-1.5">
              {settings.phone && (
                <Button size="sm" className="bg-[#D4AF37] hover:bg-[#c4a030] text-[#2f3f4f] font-semibold text-[9px] px-2 h-6" asChild>
                  <Link href={`tel:${settings.phone}`}>
                    <Phone className="mr-0.5 h-2.5 w-2.5" />
                    Call
                  </Link>
                </Button>
              )}
              <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-[9px] px-2 h-6" asChild>
                <Link href="/inquiry">Message</Link>
              </Button>
            </div>
          </div>
          
          <div className="flex items-start gap-3 pb-2.5 mb-2.5 border-b border-white/10">
            <div className="border border-[#D4AF37]/50 rounded p-1.5 bg-[#D4AF37]/5 flex-shrink-0">
              <Image src="/logo.png" alt={settings.companyName} width={80} height={26} className="h-5 w-auto" priority />
            </div>
            <div className="text-[10px] text-white/70 space-y-0.5 min-w-0">
              <p className="flex items-center gap-1">
                <MapPin className="h-2.5 w-2.5 text-[#D4AF37] flex-shrink-0" />
                {settings.address}
              </p>
              {settings.phone && (
                <p className="flex items-center gap-1">
                  <Phone className="h-2.5 w-2.5 text-[#D4AF37] flex-shrink-0" />
                  {settings.phone}
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-2 text-[9px]">
            <div>
              <h4 className="font-semibold text-[10px] mb-1 flex items-center gap-0.5 text-white">
                <Clock className="h-2.5 w-2.5 text-[#D4AF37]" />
                Hours
              </h4>
              <div className="text-white/70 space-y-0">
                <p>{settings.workingHours}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-[10px] mb-1 flex items-center gap-0.5 text-white">
                <Music className="h-2.5 w-2.5 text-[#D4AF37]" />
                Shop
              </h4>
              <div className="text-white/70 space-y-0">
                <p><Link href="/shop" className="hover:text-white transition-colors">All</Link></p>
                <p><Link href="/cart" className="hover:text-white transition-colors">Cart</Link></p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-[10px] mb-1 flex items-center gap-0.5 text-white">
                <Heart className="h-2.5 w-2.5 text-[#D4AF37]" />
                Support
              </h4>
              <div className="text-white/70 space-y-0">
                <p><Link href="/inquiry" className="hover:text-white transition-colors">Inquiry</Link></p>
                <p><Link href="/account" className="hover:text-white transition-colors">Account</Link></p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-[10px] mb-1 text-white">Follow</h4>
              <div className="flex gap-1 mb-1">
                {socialLinks.map((social) => (
                  <Link
                    key={social.label}
                    href={social.href || '#'}
                    className="w-5 h-5 rounded-full bg-white/10 hover:bg-[#D4AF37] flex items-center justify-center text-white hover:text-[#2f3f4f] transition-all"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                  >
                    <social.icon className="h-2.5 w-2.5" />
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[#D4AF37] text-xs animate-pulse">★</span>
                <span className="text-white font-bold text-[10px]">4.9</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:block">
          <div className="flex items-center justify-between gap-3 pb-6 mb-6 border-b border-white/10">
            <div>
              <h3 className="text-sm md:text-lg font-bold text-white flex items-center gap-2">
                <span className="text-[#D4AF37] animate-pulse">★</span>
                Need Help Choosing the Right Instrument?
              </h3>
              <p className="text-xs md:text-sm text-white/70 mt-0.5">
                Our team of professional musicians is ready to help you find the perfect saxophone.
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button size="sm" className="bg-[#D4AF37] hover:bg-[#c4a030] text-[#2f3f4f] font-semibold text-xs md:text-sm px-4 h-8 md:h-9" asChild>
                <Link href="/inquiry">
                  <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                  Inquiry
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-5 gap-8 lg:gap-12">
            <div>
              <div className="border border-[#D4AF37]/50 rounded-lg p-2.5 inline-block mb-3 bg-[#D4AF37]/5">
                <Image src="/logo.png" alt={settings.companyName} width={120} height={40} className="h-8 w-auto" priority />
              </div>
              <div className="space-y-1.5 text-sm text-white/80">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                  <span>{settings.address}</span>
                </div>
                {settings.phone && (
                  <Link href={`tel:${settings.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                    <Phone className="h-4 w-4 text-[#D4AF37] flex-shrink-0" />
                    <span>{settings.phone}</span>
                  </Link>
                )}
                {settings.email && (
                  <Link href={`mailto:${settings.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                    <Mail className="h-4 w-4 text-[#D4AF37] flex-shrink-0" />
                    <span className="truncate">{settings.email}</span>
                  </Link>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-white">
                <Clock className="h-4 w-4 text-[#D4AF37]" />
                Hours
              </h4>
              <ul className="space-y-1.5 text-sm text-white/80">
                <li>{settings.workingHours}</li>
                <li>Always Open</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-white">
                <Music className="h-4 w-4 text-[#D4AF37]" />
                Shop
              </h4>
              <ul className="space-y-1.5 text-sm text-white/80">
                <li><Link href="/shop" className="hover:text-white transition-colors">All Instruments</Link></li>
                <li><Link href="/cart" className="hover:text-white transition-colors">Cart</Link></li>
                <li><Link href="/checkout" className="hover:text-white transition-colors">Checkout</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-white">
                <Heart className="h-4 w-4 text-[#D4AF37]" />
                Support
              </h4>
              <ul className="space-y-1.5 text-sm text-white/80">
                <li><Link href="/inquiry" className="hover:text-white transition-colors">Inquiry</Link></li>
                <li><Link href="/account" className="hover:text-white transition-colors">Account</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li>
                  <button onClick={() => setShowTestimonials(true)} className="hover:text-white transition-colors">
                    Testimonials
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-white">Follow Us</h4>
              <div className="flex gap-2 mb-3">
                {socialLinks.map((social) => (
                  <Link
                    key={social.label}
                    href={social.href || '#'}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-[#D4AF37] flex items-center justify-center text-white hover:text-[#2f3f4f] transition-all"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                  >
                    <social.icon className="h-3.5 w-3.5" />
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#D4AF37] text-base">★</span>
                <span className="text-white font-bold text-sm">4.9/5</span>
                <span className="text-white/60 text-xs">500+ reviews</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TestimonialsPopup isOpen={showTestimonials} onClose={() => setShowTestimonials(false)} />
    </footer>
  )
}
