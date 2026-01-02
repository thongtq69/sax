'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Youtube, Twitter, Music, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Footer() {

  return (
    <footer className="bg-secondary text-secondary-foreground">
      {/* CTA Section - Integrated */}
      <div className="bg-secondary/90 border-b border-white/10">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-lg md:text-xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
                <span className="text-primary">★</span>
                Need Help Choosing the Right Instrument?
              </h3>
              <p className="text-sm text-white/70 mt-1">
                Our team of professional musicians is ready to help you find the perfect saxophone.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-semibold" asChild>
                <Link href="tel:+17025551234">
                  <Phone className="mr-2 h-4 w-4" />
                  Call (702) 555-1234
                </Link>
              </Button>
              <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                <Link href="/inquiry">Send a Message</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 items-start">

          {/* Store Info */}
          <div className="col-span-1">
            <div className="mb-3 group">
              <Image
                src="/logo.png"
                alt="James Sax Corner"
                width={200}
                height={60}
                className="site-logo h-10 md:h-12 w-auto transition-transform group-hover:scale-105"
                priority
              />
            </div>
            <div className="text-sm text-secondary-foreground/80 space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span>1234 Music Lane, Las Vegas, NV 89101</span>
              </div>
              <Link href="tel:+17025551234" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="h-4 w-4 text-primary" />
                <span>(702) 555-1234</span>
              </Link>
              <Link href="mailto:info@jamessaxcorner.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="h-4 w-4 text-primary" />
                <span>info@jamessaxcorner.com</span>
              </Link>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Hours
            </h4>
            <div className="text-sm text-secondary-foreground/80 space-y-1">
              <p>Mon-Fri: 10AM - 6PM</p>
              <p>Sat: 10AM - 5PM</p>
              <p>Sun: Closed</p>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Music className="h-4 w-4 text-primary" />
              Shop
            </h4>
            <ul className="text-sm text-secondary-foreground/80 space-y-1">
              {[
                { href: '/shop', label: 'All Instruments' },
                { href: '/cart', label: 'Cart' },
                { href: '/checkout', label: 'Checkout' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              Support
            </h4>
            <ul className="text-sm text-secondary-foreground/80 space-y-1">
              {[
                { href: '/inquiry', label: 'Inquiry' },
                { href: '/account', label: 'Account' },
                { href: '/blog', label: 'Blog' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Rating */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Follow Us</h4>
            <div className="flex gap-2.5 mb-3">
              {[
                { href: 'https://facebook.com', icon: Facebook, label: 'Facebook' },
                { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
                { href: 'https://youtube.com', icon: Youtube, label: 'YouTube' },
                { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
              ].map((social) => (
                <Link
                  key={social.href}
                  href={social.href}
                  className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition-all"
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-yellow-400 text-lg">⭐</span>
              <span className="text-white font-semibold">4.9/5</span>
              <span className="text-secondary-foreground/70">500+ reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-secondary-foreground/20">
        <div className="container mx-auto px-4 py-3">
          <p className="text-xs text-secondary-foreground/60 text-center flex items-center justify-center gap-1">
            © {new Date().getFullYear()} James Sax Corner • Made with
            <Heart className="h-3 w-3 text-red-400 fill-current" />
            for musicians
          </p>
        </div>
      </div>
    </footer>
  )
}
