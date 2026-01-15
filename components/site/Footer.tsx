'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Phone, MapPin, Clock, Music, Heart, Mail, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSiteSettings } from '@/contexts/SiteSettingsContext'

// Lazy load TestimonialsPopup - only when user clicks
const TestimonialsPopup = dynamic(
  () => import('./TestimonialsPopup').then(m => m.TestimonialsPopup),
  { ssr: false }
)

// WhatsApp icon component
const WhatsAppIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

// Social Media Icons
const FacebookIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const InstagramIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

const YoutubeIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
)

// X (Twitter) icon component
const XIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

// TikTok icon component
const TikTokIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

export function Footer() {
  const [showTestimonials, setShowTestimonials] = useState(false)
  const settings = useSiteSettings()

  // Build social links array from shared context
  const socialLinks = [
    { href: settings.socialLinks.facebook, icon: FacebookIcon, label: 'Facebook' },
    { href: settings.socialLinks.instagram, icon: InstagramIcon, label: 'Instagram' },
    { href: settings.socialLinks.youtube, icon: YoutubeIcon, label: 'YouTube' },
    { href: settings.socialLinks.twitter, icon: XIcon, label: 'X' },
    { href: settings.socialLinks.tiktok, icon: TikTokIcon, label: 'TikTok' },
  ].filter(s => s.href)

  return (
    <footer className="bg-[#2f3f4f] text-white">
      <div className="container mx-auto px-3 lg:px-4 py-2 lg:py-4">

        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Need Help Section - Mobile (horizontal like desktop) */}
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-white/10">
            <span className="text-[9px] font-semibold text-white flex items-center gap-0.5 whitespace-nowrap">
              <span className="text-[#D4AF37]">★</span>
              Need Help Choosing?
            </span>
            <Button size="sm" className="bg-[#D4AF37] hover:bg-[#c9a432] text-[#2f3f4f] font-semibold text-[8px] px-2 h-5" asChild>
              <Link href="/inquiry">
                <MessageCircle className="mr-0.5 h-2.5 w-2.5" />
                Ask Now
              </Link>
            </Button>
          </div>

          {/* Main Grid - 4 columns like desktop: Hours | Shop | Support | Follow Us */}
          <div className="grid grid-cols-4 gap-2 text-[8px] mb-2">
            {/* Column 1: Logo & Contact */}
            <div className="col-span-4 flex items-start gap-2 pb-2 mb-1 border-b border-white/10">
              <div className="border border-[#D4AF37]/50 rounded p-0.5 bg-[#D4AF37]/5 flex-shrink-0">
                <Image src="/logo.png" alt={settings.companyName} width={60} height={20} className="h-4 w-auto" priority />
              </div>
              <div className="text-[8px] text-white/70 space-y-0 min-w-0 flex-1">
                <p className="flex items-center gap-0.5">
                  <MapPin className="h-2 w-2 text-[#58510D] flex-shrink-0" />
                  <span className="truncate">{settings.address}</span>
                </p>
                {settings.phone && (
                  <Link href={`https://wa.me/${settings.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 hover:text-white transition-colors">
                    <Phone className="h-2 w-2 text-[#58510D] flex-shrink-0" />
                    <span>{settings.phone}</span>
                  </Link>
                )}
                {settings.email && (
                  <p className="flex items-center gap-0.5">
                    <Mail className="h-2 w-2 text-[#58510D] flex-shrink-0" />
                    <span className="truncate">{settings.email}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Column 1: Hours */}
            <div>
              <h4 className="font-semibold text-[9px] mb-0.5 flex items-center gap-0.5 text-white">
                <Clock className="h-2 w-2 text-[#D4AF37]" />
                Hours
              </h4>
              <div className="text-white/70 space-y-0 leading-tight">
                <p>{settings.workingHours}</p>
                <p>Always Open</p>
              </div>
            </div>

            {/* Column 2: Shop */}
            <div>
              <h4 className="font-semibold text-[9px] mb-0.5 flex items-center gap-0.5 text-white">
                <Music className="h-2 w-2 text-[#D4AF37]" />
                Shop
              </h4>
              <div className="text-white/70 space-y-0 leading-tight">
                <p><Link href="/shop" className="hover:text-white transition-colors">All Instruments</Link></p>
                <p><Link href="/cart" className="hover:text-white transition-colors">Cart</Link></p>
                <p><Link href="/checkout" className="hover:text-white transition-colors">Checkout</Link></p>
              </div>
            </div>

            {/* Column 3: Support */}
            <div>
              <h4 className="font-semibold text-[9px] mb-0.5 flex items-center gap-0.5 text-white">
                <Heart className="h-2 w-2 text-[#D4AF37]" />
                Support
              </h4>
              <div className="text-white/70 space-y-0 leading-tight">
                <p><Link href="/inquiry" className="hover:text-white transition-colors">Inquiry</Link></p>
                <p><Link href="/account" className="hover:text-white transition-colors">Account</Link></p>
                <p><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></p>
                <p>
                  <button onClick={() => setShowTestimonials(true)} className="hover:text-white transition-colors">
                    Testimonials
                  </button>
                </p>
              </div>
            </div>

            {/* Column 4: Follow Us */}
            <div>
              <h4 className="font-semibold text-[9px] mb-0.5 text-white">Follow Us</h4>
              <div className="flex gap-0.5 mb-1 flex-wrap">
                {socialLinks.map((social) => (
                  <Link
                    key={social.label}
                    href={social.href || '#'}
                    className="rounded-full bg-white/10 hover:bg-[#D4AF37] flex items-center justify-center text-white hover:text-[#2f3f4f] transition-all"
                    style={{ width: '14px', height: '14px', minWidth: '14px', minHeight: '14px' }}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                  >
                    <social.icon style={{ width: '7px', height: '7px' }} />
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-0.5">
                <span className="text-[#D4AF37] text-[9px]">★</span>
                <span className="text-white font-bold text-[9px]">4.9/5</span>
                <span className="text-white/60 text-[7px]">500+</span>
              </div>
            </div>
          </div>

          {/* Copyright - Mobile */}
          <div className="pt-1.5 border-t border-white/10 text-center">
            <p className="text-[7px] text-white/50">{settings.copyrightText}</p>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          {/* Need Help Choosing Section - Same layout as email subscription */}
          <div className="flex items-center justify-between gap-4 pb-4 mb-4 border-b border-white/10 px-2">
            <span className="text-sm font-semibold text-white flex items-center gap-1.5 whitespace-nowrap min-w-[320px]">
              <span className="text-[#D4AF37]">★</span>
              Need Help Choosing the Right Instrument?
            </span>
            <div className="flex gap-2 flex-1 max-w-md">
              <Link href="/inquiry" className="bg-[#D4AF37] hover:bg-[#c9a432] text-[#2f3f4f] font-semibold min-w-0 flex-1 px-4 py-1.5 rounded text-sm h-9 flex items-center transition-colors">
                <MessageCircle className="mr-2 h-4 w-4" />
                Ask Now
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-8 lg:gap-12">
            <div>
              <div className="border border-[#D4AF37]/50 rounded-lg p-2.5 inline-block mb-3 bg-[#D4AF37]/5">
                <Image src="/logo.png" alt={settings.companyName} width={120} height={40} className="h-8 w-auto" priority />
              </div>
              <div className="space-y-1.5 text-sm text-white/80">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-[#58510D] mt-0.5 flex-shrink-0" />
                  <span>{settings.address}</span>
                </div>
                {settings.phone && (
                  <Link href={`https://wa.me/${settings.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                    <Image src="/whatsapp.svg" alt="WhatsApp" width={24} height={24} className="w-6 h-6 object-contain flex-shrink-0 -ml-1" />
                    <span>{settings.phone}</span>
                  </Link>
                )}
                {settings.email && (
                  <Link href={`mailto:${settings.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                    <Mail className="h-4 w-4 text-[#58510D] flex-shrink-0" />
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
              <h4 className="font-semibold mb-3 text-white text-sm">Follow Us</h4>
              <div className="flex gap-1 mb-3">
                {socialLinks.map((social) => (
                  <Link
                    key={social.label}
                    href={social.href || '#'}
                    className="rounded-full bg-white/10 hover:bg-[#D4AF37] flex items-center justify-center text-white hover:text-[#2f3f4f] transition-all"
                    style={{ width: '16px', height: '16px', minWidth: '16px', minHeight: '16px', maxWidth: '16px', maxHeight: '16px' }}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                  >
                    <social.icon style={{ width: '8px', height: '8px' }} />
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

          {/* Copyright - Desktop */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <p className="text-xs text-white/50">{settings.copyrightText}</p>
          </div>
        </div>
      </div>

      <TestimonialsPopup isOpen={showTestimonials} onClose={() => setShowTestimonials(false)} />
    </footer>
  )
}
