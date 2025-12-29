import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Youtube, Twitter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">

          {/* Store Info */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center space-x-3">
              <Image
                src="/logo.png"
                alt="James Sax Corner"
                width={60}
                height={60}
                className="h-14 w-auto rounded"
              />
              <span className="text-xl font-bold">James Sax Corner</span>
            </div>
            <p className="mb-4 text-sm text-secondary-foreground/80">
              Family-owned wind instrument specialists since 1985. We provide expert advice,
              professional setup, and personalized service for students, educators, and professionals.
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex items-start space-x-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium">Main Showroom</p>
                  <p className="text-secondary-foreground/80">1234 Music Lane, Las Vegas, NV 89101</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <Link href="tel:+17025551234" className="hover:underline">
                  (702) 555-1234
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <Link href="mailto:info@jamessaxcorner.com" className="hover:underline">
                  info@jamessaxcorner.com
                </Link>
              </div>
              <div className="flex items-start space-x-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="text-secondary-foreground/80">
                  <p>Mon-Fri: 10AM - 6PM PST</p>
                  <p>Saturday: 10AM - 5PM PST</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="mb-4 font-semibold">Shop</h3>
            <ul className="space-y-2 text-sm text-secondary-foreground/80">
              <li>
                <Link href="/shop/woodwinds" className="hover:text-white hover:underline">
                  Woodwinds
                </Link>
              </li>
              <li>
                <Link href="/shop/brasswinds" className="hover:text-white hover:underline">
                  Brasswinds
                </Link>
              </li>
              <li>
                <Link href="/shop/mouthpieces" className="hover:text-white hover:underline">
                  Mouthpieces
                </Link>
              </li>
              <li>
                <Link href="/shop/accessories" className="hover:text-white hover:underline">
                  Accessories
                </Link>
              </li>
              <li>
                <Link href="/financing" className="hover:text-white hover:underline">
                  Financing
                </Link>
              </li>
              <li>
                <Link href="/rentals" className="hover:text-white hover:underline">
                  Rentals
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="mb-4 font-semibold">Support</h3>
            <ul className="space-y-2 text-sm text-secondary-foreground/80">
              <li>
                <Link href="/contact" className="hover:text-white hover:underline">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white hover:underline">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/repairs" className="hover:text-white hover:underline">
                  Repairs
                </Link>
              </li>
              <li>
                <Link href="/music-lessons" className="hover:text-white hover:underline">
                  Music Lessons
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white hover:underline">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white hover:underline">
                  Returns & Exchanges
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div>
            <h3 className="mb-4 font-semibold">Stay Connected</h3>
            <p className="mb-3 text-sm text-secondary-foreground/80">
              Subscribe for deals, tips, and industry news.
            </p>
            <form className="mb-4 flex flex-col gap-2">
              <Input
                type="email"
                placeholder="Your email"
                className="bg-white/10 border-white/20 placeholder:text-secondary-foreground/50 text-white"
              />
              <Button className="w-full bg-primary hover:bg-primary/90">
                Subscribe
              </Button>
            </form>

            {/* Social Links */}
            <div className="flex space-x-3">
              <Link
                href="https://facebook.com"
                className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </Link>
              <Link
                href="https://instagram.com"
                className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </Link>
              <Link
                href="https://youtube.com"
                className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </Link>
              <Link
                href="https://twitter.com"
                className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Payment & Trust */}
      <div className="border-t border-secondary-foreground/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            {/* Payment Methods */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-secondary-foreground/60">We Accept:</span>
              <div className="flex gap-2">
                <div className="rounded bg-white px-2 py-1 text-xs font-bold text-gray-800">VISA</div>
                <div className="rounded bg-white px-2 py-1 text-xs font-bold text-gray-800">MC</div>
                <div className="rounded bg-white px-2 py-1 text-xs font-bold text-gray-800">AMEX</div>
                <div className="rounded bg-white px-2 py-1 text-xs font-bold text-blue-600">PayPal</div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-4 text-xs text-secondary-foreground/60">
              <span>🔒 Secure Checkout</span>
              <span>✓ Authorized Dealer</span>
              <span>⭐ 4.9/5 Customer Rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-secondary-foreground/20 bg-secondary/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center justify-between gap-4 text-xs text-secondary-foreground/60 md:flex-row">
            <p>© {new Date().getFullYear()} James Sax Corner. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/terms" className="hover:text-white hover:underline">
                Terms & Conditions
              </Link>
              <Link href="/privacy" className="hover:text-white hover:underline">
                Privacy Policy
              </Link>
              <Link href="/prop65" className="hover:text-white hover:underline">
                Proposition 65
              </Link>
              <Link href="/accessibility" className="hover:text-white hover:underline">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
