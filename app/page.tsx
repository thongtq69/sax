import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ProductCard } from '@/components/product/ProductCard'
import {
  products,
  promoBanners,
  featuredCollections,
} from '@/lib/data'
import { getFeaturedProducts } from '@/lib/data'
import { Phone, Shield, Truck, CreditCard, Award, Headphones, Music } from 'lucide-react'
import { PromoCarousel } from '@/components/site/PromoCarousel'

export default function HomePage() {
  const featuredProducts = getFeaturedProducts('4') // New Arrivals collection

  return (
    <div className="space-y-0">
      {/* Promo Carousel */}
      <PromoCarousel />

      {/* Hero Section - Vintage Classic Style */}
      <section className="relative min-h-[550px] overflow-hidden bg-primary">
        {/* Vintage Pattern Background */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M40 0l40 40-40 40L0 40 40 0zm0 10L10 40l30 30 30-30-30-30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Art Deco Lines */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-secondary opacity-40" />
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-secondary opacity-20" />

        <div className="container relative mx-auto flex min-h-[550px] items-center px-4 py-16">
          <div className="max-w-3xl space-y-6">
            {/* Vintage Badge */}
            <div className="inline-flex items-center space-x-2 rounded border-2 border-secondary/30 bg-secondary/10 px-4 py-2">
              <Music className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium tracking-widest uppercase text-secondary">
                Est. 1985 • Family Owned
              </span>
            </div>

            {/* Classic Typography */}
            <h1 className="text-4xl font-bold leading-tight text-secondary md:text-5xl lg:text-6xl tracking-tight">
              James Sax Corner
            </h1>

            {/* Decorative Divider */}
            <div className="flex items-center space-x-4">
              <div className="h-px w-16 bg-secondary/50" />
              <span className="text-2xl text-secondary">✦</span>
              <div className="h-px w-16 bg-secondary/50" />
            </div>

            <p className="text-2xl font-medium text-secondary/90 italic">
              Wind Instrument Specialists
            </p>

            <p className="text-lg leading-relaxed text-secondary/80 max-w-2xl">
              For nearly four decades, we've been the trusted destination for saxophonists,
              clarinetists, and wind musicians of all kinds. From vintage horns to the latest
              professional models – our expertise is your advantage.
            </p>

            <p className="text-base font-medium text-accent">
              ✆ You Have Questions – We Have Answers – Give Us A Call!
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-semibold tracking-wide" asChild>
                <Link href="tel:+17025551234">
                  <Phone className="mr-2 h-5 w-5" />
                  (702) 555-1234
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-white" asChild>
                <Link href="/shop/woodwinds">Shop Woodwinds</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-white" asChild>
                <Link href="/shop/brasswinds">Shop Brasswinds</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Art Deco Lines */}
        <div className="absolute bottom-3 left-0 right-0 h-0.5 bg-secondary opacity-20" />
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-secondary opacity-40" />
      </section>

      {/* Trust Strip - Classic Style */}
      <section className="border-y-2 border-primary/30 bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="rounded-full border-2 border-primary p-3">
                <Headphones className="h-6 w-6 text-primary" />
              </div>
              <p className="font-semibold text-secondary">Expert Advice</p>
              <p className="text-xs text-muted-foreground">Pro musicians on staff</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="rounded-full border-2 border-primary p-3">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <p className="font-semibold text-secondary">Professional Setup</p>
              <p className="text-xs text-muted-foreground">Play-tested before shipping</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="rounded-full border-2 border-primary p-3">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <p className="font-semibold text-secondary">Free Shipping</p>
              <p className="text-xs text-muted-foreground">On orders over $500</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="rounded-full border-2 border-primary p-3">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <p className="font-semibold text-secondary">Financing</p>
              <p className="text-xs text-muted-foreground">0% APR available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Banners */}
      <section className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-secondary">Current Promotions</h2>
            <div className="mt-2 flex items-center justify-center space-x-4">
              <div className="h-px w-12 bg-primary" />
              <span className="text-primary">♪</span>
              <div className="h-px w-12 bg-primary" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {promoBanners.slice(0, 6).map((promo) => (
              <Card key={promo.id} className="group overflow-hidden border-2 border-primary/20 shadow-md hover:border-primary/40 transition-colors">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={promo.image}
                    alt={promo.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/40 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                    <h3 className="mb-2 text-xl font-bold">{promo.title}</h3>
                    <p className="mb-2 text-sm opacity-90">{promo.description}</p>
                    <div className="mb-4 text-xs opacity-75">
                      Valid: {promo.validUntil}
                    </div>
                    <Button size="sm" className="w-fit bg-primary hover:bg-primary/90" asChild>
                      <Link href={promo.ctaLink}>{promo.ctaText}</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-secondary">Featured Instruments</h2>
          <div className="mt-2 flex items-center justify-center space-x-4">
            <div className="h-px w-12 bg-primary" />
            <span className="text-primary">♫</span>
            <div className="h-px w-12 bg-primary" />
          </div>
          <p className="mt-4 text-muted-foreground">
            Handpicked selection of our finest instruments
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button variant="outline" size="lg" className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-white" asChild>
            <Link href="/shop">View All Instruments →</Link>
          </Button>
        </div>
      </section>

      {/* Call to Action - Vintage Style */}
      <section className="relative bg-secondary py-16 text-white overflow-hidden">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container relative mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Need Help Choosing the Right Instrument?
          </h2>
          <div className="mt-2 mb-6 flex items-center justify-center space-x-4">
            <div className="h-px w-12 bg-white/50" />
            <span className="text-accent">★</span>
            <div className="h-px w-12 bg-white/50" />
          </div>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90">
            Our team of professional musicians is ready to help you find the perfect instrument.
            With decades of experience, we'll guide you to the horn that matches your sound and budget.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold" asChild>
              <Link href="tel:+17025551234">
                <Phone className="mr-2 h-5 w-5" />
                Call (702) 555-1234
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-secondary" asChild>
              <Link href="/contact">Send a Message</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
