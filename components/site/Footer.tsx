'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Youtube, Twitter, Music, ArrowRight, Heart, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function Footer() {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubscribed(true)
      setTimeout(() => {
        setIsSubscribed(false)
        setEmail('')
      }, 3000)
    }
  }

  return (
    <footer className="bg-secondary text-secondary-foreground relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-10 text-6xl text-white/5 animate-float">♪</div>
      <div className="absolute top-40 right-20 text-7xl text-white/5 animate-float" style={{ animationDelay: '1s' }}>♫</div>
      <div className="absolute bottom-40 left-1/4 text-5xl text-white/5 animate-float" style={{ animationDelay: '2s' }}>♩</div>

      {/* Newsletter Banner */}
      <div className="bg-gradient-to-r from-primary to-primary/80 py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2 justify-center md:justify-start">
                <Sparkles className="h-6 w-6" />
                Join Our Musical Community
              </h3>
              <p className="text-white/80 mt-1">Get exclusive deals, tips, and industry news</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/20 border-white/30 placeholder:text-white/60 text-white min-w-[250px] focus:bg-white/30 transition-all"
                disabled={isSubscribed}
              />
              <Button 
                type="submit"
                className={`bg-secondary hover:bg-secondary/90 text-white px-6 transition-all duration-300 ${
                  isSubscribed ? 'bg-green-500 hover:bg-green-500' : ''
                }`}
                disabled={isSubscribed}
              >
                {isSubscribed ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-bounce">✓</span> Subscribed!
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Subscribe <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">

          {/* Store Info */}
          <div className="lg:col-span-2 animate-fade-in">
            <div className="mb-4 flex items-center space-x-3 group">
              <Image
                src="/logo.png"
                alt="James Sax Corner"
                width={60}
                height={60}
                className="h-14 w-auto rounded transition-transform group-hover:scale-105"
              />
              <div>
                <span className="text-xl font-bold block">James Sax Corner</span>
                <span className="text-xs text-primary">Since 1985</span>
              </div>
            </div>
            <p className="mb-4 text-sm text-secondary-foreground/80 leading-relaxed">
              Family-owned wind instrument specialists since 1985. We provide expert advice,
              professional setup, and personalized service for students, educators, and professionals.
            </p>

            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3 group cursor-pointer hover:translate-x-1 transition-transform">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="font-medium">Main Showroom</p>
                  <p className="text-secondary-foreground/80">1234 Music Lane, Las Vegas, NV 89101</p>
                </div>
              </div>
              <Link href="tel:+17025551234" className="flex items-center space-x-3 group hover:translate-x-1 transition-transform">
                <Phone className="h-4 w-4 text-primary group-hover:animate-wiggle" />
                <span className="group-hover:text-white transition-colors">
                  (702) 555-1234
                </span>
              </Link>
              <Link href="mailto:info@jamessaxcorner.com" className="flex items-center space-x-3 group hover:translate-x-1 transition-transform">
                <Mail className="h-4 w-4 text-primary" />
                <span className="group-hover:text-white transition-colors">
                  info@jamessaxcorner.com
                </span>
              </Link>
              <div className="flex items-start space-x-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="text-secondary-foreground/80">
                  <p>Mon-Fri: 10AM - 6PM PST</p>
                  <p>Saturday: 10AM - 5PM PST</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h3 className="mb-4 font-semibold flex items-center gap-2">
              <Music className="h-4 w-4 text-primary" />
              Shop
            </h3>
            <ul className="space-y-2 text-sm text-secondary-foreground/80">
              {[
                { href: '/shop/woodwinds', label: 'Woodwinds' },
                { href: '/shop/brasswinds', label: 'Brasswinds' },
                { href: '/shop/mouthpieces', label: 'Mouthpieces' },
                { href: '/shop/accessories', label: 'Accessories' },
                { href: '/financing', label: 'Financing' },
                { href: '/rentals', label: 'Rentals' },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="footer-link inline-flex items-center hover:text-white transition-all duration-300 hover:translate-x-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h3 className="mb-4 font-semibold flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              Support
            </h3>
            <ul className="space-y-2 text-sm text-secondary-foreground/80">
              {[
                { href: '/contact', label: 'Contact Us' },
                { href: '/about', label: 'About Us' },
                { href: '/blog', label: 'Blog' },
                { href: '/repairs', label: 'Repairs' },
                { href: '/music-lessons', label: 'Music Lessons' },
                { href: '/shipping', label: 'Shipping Info' },
                { href: '/returns', label: 'Returns & Exchanges' },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="footer-link inline-flex items-center hover:text-white transition-all duration-300 hover:translate-x-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h3 className="mb-4 font-semibold">Follow Us</h3>
            <p className="mb-4 text-sm text-secondary-foreground/80">
              Join our community for tips, demos, and exclusive content.
            </p>

            {/* Social Links with hover effects */}
            <div className="flex flex-wrap gap-3">
              {[
                { href: 'https://facebook.com', icon: Facebook, label: 'Facebook', color: 'hover:bg-blue-600' },
                { href: 'https://instagram.com', icon: Instagram, label: 'Instagram', color: 'hover:bg-pink-600' },
                { href: 'https://youtube.com', icon: Youtube, label: 'YouTube', color: 'hover:bg-red-600' },
                { href: 'https://twitter.com', icon: Twitter, label: 'Twitter', color: 'hover:bg-sky-500' },
              ].map((social) => (
                <Link
                  key={social.href}
                  href={social.href}
                  className={`rounded-full bg-white/10 p-3 transition-all duration-300 hover:scale-110 ${social.color}`}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>

            {/* Trust badge */}
            <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-yellow-400 text-lg">⭐</span>
                <div>
                  <p className="font-semibold text-white">4.9/5 Rating</p>
                  <p className="text-xs text-secondary-foreground/60">Based on 500+ reviews</p>
                </div>
              </div>
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
                {['VISA', 'MC', 'AMEX'].map((card) => (
                  <div 
                    key={card}
                    className="rounded bg-white px-3 py-1 text-xs font-bold text-gray-800 transition-transform hover:scale-105"
                  >
                    {card}
                  </div>
                ))}
                <div className="rounded bg-white px-3 py-1 text-xs font-bold text-blue-600 transition-transform hover:scale-105">
                  PayPal
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-4 text-xs text-secondary-foreground/60">
              <span className="flex items-center gap-1">
                <span className="text-green-400">🔒</span> Secure Checkout
              </span>
              <span>✓ Authorized Dealer</span>
              <span>🇺🇸 Made in USA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-secondary-foreground/20 bg-secondary/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center justify-between gap-4 text-xs text-secondary-foreground/60 md:flex-row">
            <p className="flex items-center gap-1">
              © {new Date().getFullYear()} James Sax Corner. Made with 
              <Heart className="h-3 w-3 text-red-400 fill-current animate-heartbeat" /> 
              for musicians
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { href: '/terms', label: 'Terms & Conditions' },
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/prop65', label: 'Proposition 65' },
                { href: '/accessibility', label: 'Accessibility' },
              ].map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className="hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
