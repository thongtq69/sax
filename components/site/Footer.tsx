'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Phone, MapPin, Clock, Music, Heart, Mail, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TestimonialsPopup } from './TestimonialsPopup'

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
          setSettings({
            companyName: data.companyName || defaultSettings.companyName,
            address: data.address || defaultSettings.address,
            phone: data.phone || defaultSettings.phone,
            email: data.email || defaultSettings.email,
            workingHours: data.workingHours || defaultSettings.workingHours,
            socialLinks: data.socialLinks || defaultSettings.socialLinks,
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
    { href: settings.socialLinks.facebook, icon: 'f', label: 'Facebook' },
    { href: settings.socialLinks.instagram, icon: '📷', label: 'Instagram' },
    { href: settings.socialLinks.youtube, icon: '▶', label: 'YouTube' },
    { href: settings.socialLinks.twitter, icon: '𝕏', label: 'Twitter' },
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
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-[#D4AF37] flex items-center justify-center text-white hover:text-[#2f3f4f] transition-all text-xs"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                  >
                    {social.icon}
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
