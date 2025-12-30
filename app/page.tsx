'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ProductCard } from '@/components/product/ProductCard'
import {
  products,
  promoBanners,
  categories,
} from '@/lib/data'
import { getFeaturedProducts } from '@/lib/data'
import { Phone, Shield, Truck, CreditCard, Award, Headphones, Music, ChevronRight, Star, Sparkles } from 'lucide-react'
import { PromoCarousel } from '@/components/site/PromoCarousel'

export default function HomePage() {
  const featuredProducts = getFeaturedProducts('4') // New Arrivals collection
  const saleProducts = products.filter(p => p.badge === 'sale').slice(0, 8) // Get more for carousel
  const [isCarouselPaused, setIsCarouselPaused] = useState(false)
  const [isSaleCarouselPaused, setIsSaleCarouselPaused] = useState(false)
  
  return (
    <div className="space-y-0 page-content">
      {/* Promo Carousel */}
      <PromoCarousel />

      {/* Hero Section - Vintage Classic Style */}
      <section className="relative min-h-[600px] overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/90">
        {/* Animated Vintage Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 animate-pulse-soft" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M40 0l40 40-40 40L0 40 40 0zm0 10L10 40l30 30 30-30-30-30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Floating musical notes decoration */}
        <div className="absolute top-20 left-10 text-4xl text-secondary/20 animate-float">♪</div>
        <div className="absolute top-40 right-20 text-5xl text-secondary/20 animate-float" style={{ animationDelay: '1s' }}>♫</div>
        <div className="absolute bottom-40 left-1/4 text-3xl text-secondary/20 animate-float" style={{ animationDelay: '2s' }}>♩</div>
        <div className="absolute top-1/3 right-1/3 text-4xl text-secondary/20 animate-float" style={{ animationDelay: '0.5s' }}>♬</div>

        {/* Art Deco Lines */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-secondary opacity-40" />
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-secondary opacity-20" />

        <div className="container relative mx-auto flex min-h-[600px] items-center px-4 py-16">
          <div className="max-w-3xl space-y-6">
            {/* Vintage Badge with animation */}
            <div className="hero-title inline-flex items-center space-x-2 rounded border-2 border-secondary/30 bg-secondary/10 px-4 py-2 backdrop-blur-sm">
              <Music className="h-4 w-4 text-secondary animate-bounce-soft" />
              <span className="text-sm font-medium tracking-widest uppercase text-secondary">
                Est. 1985 • Family Owned
              </span>
            </div>

            {/* Classic Typography with stagger animation */}
            <h1 className="hero-subtitle text-5xl font-bold leading-tight text-secondary md:text-6xl lg:text-7xl tracking-tight">
              <span className="block">James Sax</span>
              <span className="block text-white/90">Corner</span>
            </h1>

            {/* Decorative Divider with animation */}
            <div className="hero-subtitle flex items-center space-x-4" style={{ animationDelay: '0.5s' }}>
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-secondary/50" />
              <span className="text-2xl text-secondary animate-pulse">✦</span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-secondary/50" />
            </div>

            <p className="hero-subtitle text-2xl font-medium text-secondary/90 italic" style={{ animationDelay: '0.6s' }}>
              Wind Instrument Specialists
            </p>

            <p className="hero-cta text-lg leading-relaxed text-secondary/80 max-w-2xl">
              For nearly four decades, we've been the trusted destination for saxophonists,
              clarinetists, and wind musicians of all kinds. From vintage horns to the latest
              professional models – our expertise is your advantage.
            </p>

            <p className="hero-cta text-base font-medium text-accent flex items-center gap-2" style={{ animationDelay: '0.7s' }}>
              <Phone className="h-5 w-5 animate-wiggle" style={{ animationDuration: '2s' }} />
              You Have Questions – We Have Answers – Give Us A Call!
            </p>

            <div className="hero-cta flex flex-wrap gap-4 pt-4" style={{ animationDelay: '0.8s' }}>
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-semibold tracking-wide hover:scale-105 transition-transform shadow-xl hover:shadow-2xl" asChild>
                <Link href="tel:+17025551234">
                  <Phone className="mr-2 h-5 w-5" />
                  (702) 555-1234
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-white group" asChild>
                <Link href="/shop/woodwinds" className="flex items-center">
                  Shop Woodwinds
                  <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-white group" asChild>
                <Link href="/shop/brasswinds" className="flex items-center">
                  Shop Brasswinds
                  <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Art Deco Lines */}
        <div className="absolute bottom-3 left-0 right-0 h-0.5 bg-secondary opacity-20" />
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-secondary opacity-40" />
      </section>

      {/* Trust Strip - Classic Style with animations */}
      <section className="border-y-2 border-primary/30 bg-white py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { icon: Headphones, title: 'Expert Advice', desc: 'Pro musicians on staff', delay: 0 },
              { icon: Award, title: 'Professional Setup', desc: 'Play-tested before shipping', delay: 0.1 },
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over $500', delay: 0.2 },
              { icon: CreditCard, title: 'Financing', desc: '0% APR available', delay: 0.3 },
            ].map((item, i) => (
              <div 
                key={i} 
                className="flex flex-col items-center text-center space-y-3 p-4 rounded-xl hover:bg-primary/5 transition-all duration-300 hover:shadow-lg group animate-fade-in-up"
                style={{ animationDelay: `${item.delay}s` }}
              >
                <div className="rounded-full border-2 border-primary p-4 group-hover:bg-primary group-hover:border-primary transition-all duration-300 group-hover:scale-110">
                  <item.icon className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
                </div>
                <p className="font-semibold text-secondary">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-10 text-center animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary">Shop by Category</h2>
          <div className="mt-3 flex items-center justify-center space-x-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary" />
            <span className="text-2xl text-primary">🎷</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { name: 'Flutes', slug: 'flutes', icon: '🎵', count: 12 },
            { name: 'Saxophones', slug: 'saxophones', icon: '🎷', count: 2 },
            { name: 'Clarinets', slug: 'clarinets', icon: '🎼', count: 1 },
            { name: 'Piccolos', slug: 'piccolos', icon: '🎶', count: 2 },
          ].map((cat, i) => (
            <Link 
              key={cat.slug}
              href={`/shop?category=${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 p-6 text-center text-white transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] animate-fade-in-up"
              style={{ animationDelay: `${0.1 * i}s` }}
            >
              {/* Decorative background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              
              <div className="relative z-10">
                <span className="text-5xl block mb-3 group-hover:scale-125 transition-transform duration-300">
                  {cat.icon}
                </span>
                <h3 className="text-xl font-bold mb-1">{cat.name}</h3>
                <p className="text-sm text-white/70">{cat.count} Products</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Promotional Banners */}
      <section className="bg-gradient-to-b from-muted to-white py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary">Current Promotions</h2>
            <div className="mt-3 flex items-center justify-center space-x-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary" />
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary" />
            </div>
            <p className="mt-3 text-muted-foreground">Limited time offers on premium instruments</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {promoBanners.slice(0, 6).map((promo, i) => (
              <Card 
                key={promo.id} 
                className="group overflow-hidden border-2 border-primary/10 shadow-md hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${0.1 * i}s` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={promo.image}
                    alt={promo.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/50 to-transparent" />
                  
                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                    <h3 className="mb-2 text-xl font-bold group-hover:translate-x-1 transition-transform">
                      {promo.title}
                    </h3>
                    <p className="mb-4 text-sm opacity-90 line-clamp-2">{promo.description}</p>
                    <Button 
                      size="sm" 
                      className="w-fit bg-primary hover:bg-primary/90 group-hover:shadow-lg transition-all" 
                      asChild
                    >
                      <Link href={promo.ctaLink} className="flex items-center">
                        {promo.ctaText}
                        <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products - New Arrivals */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-10 text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Just Arrived
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-secondary">Featured Instruments</h2>
          <div className="mt-3 flex items-center justify-center space-x-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary" />
            <span className="text-2xl text-primary">♫</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary" />
          </div>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Handpicked selection of our finest instruments, each professionally setup and ready to play
          </p>
        </div>
        
        {/* Auto-scrolling Product Carousel - Shows 4 products at a time */}
        <div className="relative overflow-hidden w-full">
          <div 
            className="flex gap-6"
            style={{
              animation: `productCarousel ${50 + featuredProducts.length * 3}s linear infinite`,
              animationPlayState: isCarouselPaused ? 'paused' : 'running',
              width: 'fit-content',
            }}
            onMouseEnter={() => setIsCarouselPaused(true)}
            onMouseLeave={() => setIsCarouselPaused(false)}
          >
            {/* Duplicate products for seamless infinite loop */}
            {[...featuredProducts, ...featuredProducts].map((product, index) => (
              <div key={`${product.id}-${index}`} className="flex-shrink-0" style={{ width: 'calc((100vw - 128px) / 4)', minWidth: '280px', maxWidth: '320px' }}>
                <ProductCard product={product} index={index % featuredProducts.length} />
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-10 text-center">
          <Button 
            variant="outline" 
            size="lg" 
            className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-white group px-8" 
            asChild
          >
            <Link href="/shop" className="flex items-center">
              View All Instruments
              <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>

      {/* On Sale Section */}
      {saleProducts.length > 0 && (
        <section className="bg-gradient-to-br from-red-50 to-orange-50 py-16 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-red-100 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-100 rounded-full translate-x-1/3 translate-y-1/3 opacity-50" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="mb-10 text-center animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500 text-white text-sm font-medium mb-4 animate-pulse-soft">
                🔥 Hot Deals
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-secondary">Special Offers</h2>
              <p className="mt-3 text-muted-foreground">Save big on these premium instruments</p>
            </div>
            
            {/* Auto-scrolling Sale Products Carousel - Shows 4 products at a time */}
            <div className="relative overflow-hidden w-full">
              <div 
                className="flex gap-6"
                style={{
                  animation: `productCarousel ${50 + saleProducts.length * 3}s linear infinite`,
                  animationPlayState: isSaleCarouselPaused ? 'paused' : 'running',
                  width: 'fit-content',
                }}
                onMouseEnter={() => setIsSaleCarouselPaused(true)}
                onMouseLeave={() => setIsSaleCarouselPaused(false)}
              >
                {/* Duplicate products for seamless infinite loop */}
                {[...saleProducts, ...saleProducts].map((product, index) => (
                  <div key={`${product.id}-${index}`} className="flex-shrink-0" style={{ width: 'calc((100vw - 128px) / 4)', minWidth: '280px', maxWidth: '320px' }}>
                    <ProductCard product={product} index={index % saleProducts.length} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonial / Why Choose Us */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="animate-fade-in-left">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-6">
              Why Musicians Choose Us
            </h2>
            <div className="space-y-4">
              {[
                { title: '40+ Years of Expertise', desc: 'Trusted by professional musicians since 1985' },
                { title: 'Professional Setup', desc: 'Every instrument is play-tested and adjusted by our technicians' },
                { title: 'Expert Consultation', desc: 'Our staff includes professional players who understand your needs' },
                { title: 'Lifetime Support', desc: 'We\'re here to help you throughout your musical journey' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl bg-white border-2 border-transparent hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="animate-fade-in-right">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-8 text-center">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-8 w-8 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <blockquote className="text-xl italic text-secondary mb-6">
                "The team at James Sax Corner helped me find my dream horn. Their expertise and patience made all the difference in my selection process."
              </blockquote>
              <div className="font-semibold text-secondary">— Michael T., Professional Saxophonist</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action - Vintage Style */}
      <section className="relative bg-secondary py-20 text-white overflow-hidden">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Floating elements */}
        <div className="absolute top-10 left-10 text-4xl text-white/10 animate-float">♪</div>
        <div className="absolute bottom-10 right-10 text-5xl text-white/10 animate-float" style={{ animationDelay: '1s' }}>♫</div>

        <div className="container relative mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-5xl animate-fade-in-up">
            Need Help Choosing the Right Instrument?
          </h2>
          <div className="mt-4 mb-8 flex items-center justify-center space-x-4">
            <div className="h-px w-16 bg-white/30" />
            <span className="text-accent text-xl">★</span>
            <div className="h-px w-16 bg-white/30" />
          </div>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-white/90 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Our team of professional musicians is ready to help you find the perfect instrument.
            With decades of experience, we'll guide you to the horn that matches your sound and budget.
          </p>
          <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold text-lg px-8 hover:scale-105 transition-transform shadow-xl" asChild>
              <Link href="tel:+17025551234">
                <Phone className="mr-2 h-5 w-5" />
                Call (702) 555-1234
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-secondary text-lg px-8" asChild>
              <Link href="/contact">Send a Message</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
