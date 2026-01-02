'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Phone, MapPin, Clock, Music, Heart, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Footer() {
  return (
    <footer className="bg-[#2f3f4f] text-white">
      {/* Main Footer - includes CTA */}
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-6 md:py-10">
        
        {/* Mobile Layout - Ultra Compact */}
        <div className="sm:hidden">
          {/* Row 1: Need Help CTA - integrated */}
          <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-white/10">
            <h3 className="text-[11px] font-bold text-white flex items-center gap-1">
              <span className="text-[#D4AF37] text-xs">★</span>
              Need Help?
            </h3>
            <div className="flex gap-1.5">
              <Button size="sm" className="bg-[#D4AF37] hover:bg-[#c4a030] text-[#2f3f4f] font-semibold text-[9px] px-2 h-6" asChild>
                <Link href="tel:+17025551234">
                  <Phone className="mr-0.5 h-2.5 w-2.5" />
                  Call
                </Link>
              </Button>
              <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-[9px] px-2 h-6" asChild>
                <Link href="/inquiry">Message</Link>
              </Button>
            </div>
          </div>
          
          {/* Row 2: Logo + Contact Info */}
          <div className="flex items-start gap-3 pb-2.5 mb-2.5 border-b border-white/10">
            <div className="border border-[#D4AF37]/50 rounded p-1.5 bg-[#D4AF37]/5 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="James Sax Corner"
                width={80}
                height={26}
                className="h-5 w-auto"
                priority
              />
            </div>
            <div className="text-[10px] text-white/70 space-y-0.5 min-w-0">
              <p className="flex items-center gap-1">
                <MapPin className="h-2.5 w-2.5 text-[#D4AF37] flex-shrink-0" />
                Las Vegas, NV
              </p>
              <p className="flex items-center gap-1">
                <Phone className="h-2.5 w-2.5 text-[#D4AF37] flex-shrink-0" />
                (702) 555-1234
              </p>
            </div>
          </div>
          
          {/* Row 3: Hours, Shop, Support, Follow - 4 columns */}
          <div className="grid grid-cols-4 gap-2 text-[9px]">
            {/* Hours */}
            <div>
              <h4 className="font-semibold text-[10px] mb-1 flex items-center gap-0.5 text-white">
                <Clock className="h-2.5 w-2.5 text-[#D4AF37]" />
                Hours
              </h4>
              <div className="text-white/70 space-y-0">
                <p>M-F: 10-6</p>
                <p>Sat: 10-5</p>
              </div>
            </div>
            
            {/* Shop */}
            <div>
              <h4 className="font-semibold text-[10px] mb-1 flex items-center gap-0.5 text-white">
                <Music className="h-2.5 w-2.5 text-[#D4AF37]" />
                Shop
              </h4>
              <div className="text-white/70 space-y-0">
                <p><Link href="/shop" className="hover:text-white">All</Link></p>
                <p><Link href="/cart" className="hover:text-white">Cart</Link></p>
              </div>
            </div>
            
            {/* Support */}
            <div>
              <h4 className="font-semibold text-[10px] mb-1 flex items-center gap-0.5 text-white">
                <Heart className="h-2.5 w-2.5 text-[#D4AF37]" />
                Support
              </h4>
              <div className="text-white/70 space-y-0">
                <p><Link href="/inquiry" className="hover:text-white">Inquiry</Link></p>
                <p><Link href="/account" className="hover:text-white">Account</Link></p>
              </div>
            </div>
            
            {/* Follow & Rating */}
            <div>
              <h4 className="font-semibold text-[10px] mb-1 text-white">Follow</h4>
              <div className="flex items-center gap-1">
                <span className="text-[#D4AF37] text-xs">★</span>
                <span className="text-white font-bold text-[10px]">4.9</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout - Full */}
        <div className="hidden sm:block">
          {/* CTA Row - Desktop */}
          <div className="flex items-center justify-between gap-3 pb-6 mb-6 border-b border-white/10">
            <div>
              <h3 className="text-sm md:text-lg font-bold text-white flex items-center gap-2">
                <span className="text-[#D4AF37]">★</span>
                Need Help Choosing the Right Instrument?
              </h3>
              <p className="text-xs md:text-sm text-white/70 mt-0.5">
                Our team of professional musicians is ready to help you find the perfect saxophone.
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button size="sm" className="bg-[#D4AF37] hover:bg-[#c4a030] text-[#2f3f4f] font-semibold text-xs md:text-sm px-4 h-8 md:h-9" asChild>
                <Link href="tel:+17025551234">
                  <Phone className="mr-1.5 h-3.5 w-3.5" />
                  Call (702) 555-1234
                </Link>
              </Button>
              <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-xs md:text-sm px-4 h-8 md:h-9" asChild>
                <Link href="/inquiry">Message</Link>
              </Button>
            </div>
          </div>
          
          {/* Main Grid - Desktop - 5 equal columns */}
          <div className="grid grid-cols-5 gap-8 lg:gap-12">
            
            {/* Store Info - Logo & Contact */}
            <div>
              <div className="border border-[#D4AF37]/50 rounded-lg p-2.5 inline-block mb-3 bg-[#D4AF37]/5">
                <Image
                  src="/logo.png"
                  alt="James Sax Corner"
                  width={120}
                  height={40}
                  className="h-8 w-auto"
                  priority
                />
              </div>
              <div className="space-y-1.5 text-sm text-white/80">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                  <span>Las Vegas, NV 89101</span>
                </div>
                <Link href="tel:+17025551234" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="h-4 w-4 text-[#D4AF37] flex-shrink-0" />
                  <span>(702) 555-1234</span>
                </Link>
                <Link href="mailto:info@jamessaxcorner.com" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="h-4 w-4 text-[#D4AF37] flex-shrink-0" />
                  <span className="truncate">info@jamessaxcorner.com</span>
                </Link>
              </div>
            </div>

            {/* Hours */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-white">
                <Clock className="h-4 w-4 text-[#D4AF37]" />
                Hours
              </h4>
              <ul className="space-y-1.5 text-sm text-white/80">
                <li>Mon-Fri: 10AM - 6PM</li>
                <li>Sat: 10AM - 5PM</li>
                <li>Sun: Closed</li>
              </ul>
            </div>

            {/* Shop */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-white">
                <Music className="h-4 w-4 text-[#D4AF37]" />
                Shop
              </h4>
              <ul className="space-y-1.5 text-sm text-white/80">
                <li>
                  <Link href="/shop" className="hover:text-white transition-colors">All Instruments</Link>
                </li>
                <li>
                  <Link href="/cart" className="hover:text-white transition-colors">Cart</Link>
                </li>
                <li>
                  <Link href="/checkout" className="hover:text-white transition-colors">Checkout</Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-white">
                <Heart className="h-4 w-4 text-[#D4AF37]" />
                Support
              </h4>
              <ul className="space-y-1.5 text-sm text-white/80">
                <li>
                  <Link href="/inquiry" className="hover:text-white transition-colors">Inquiry</Link>
                </li>
                <li>
                  <Link href="/account" className="hover:text-white transition-colors">Account</Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                </li>
              </ul>
            </div>

            {/* Follow Us */}
            <div>
              <h4 className="font-semibold mb-3 text-white">Follow Us</h4>
              <div className="flex gap-2 mb-3">
                {[
                  { href: 'https://facebook.com', icon: 'f', label: 'Facebook' },
                  { href: 'https://instagram.com', icon: '📷', label: 'Instagram' },
                  { href: 'https://youtube.com', icon: '▶', label: 'YouTube' },
                  { href: 'https://twitter.com', icon: '𝕏', label: 'Twitter' },
                ].map((social) => (
                  <Link
                    key={social.href}
                    href={social.href}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-[#D4AF37] flex items-center justify-center text-white hover:text-[#2f3f4f] transition-all duration-300 text-xs"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </Link>
                ))}
              </div>
              {/* Rating */}
              <div className="flex items-center gap-1.5">
                <span className="text-[#D4AF37] text-base">★</span>
                <span className="text-white font-bold text-sm">4.9/5</span>
                <span className="text-white/60 text-xs">500+ reviews</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-4">
          <p className="text-[9px] sm:text-sm text-white/60 text-center flex items-center justify-center gap-1">
            © {new Date().getFullYear()} James Sax Corner
            <Heart className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-red-400 fill-current" />
          </p>
        </div>
      </div>
    </footer>
  )
}
