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
import { Phone, Shield, Truck, CreditCard } from 'lucide-react'

export default function HomePage() {
  const featuredProducts = getFeaturedProducts('4') // New Arrivals collection

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto flex h-full items-center px-4">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-5xl font-bold text-gray-900">
              Welcome to Specialty Music Store
            </h1>
            <p className="text-lg text-gray-700">
              Family-owned specialty music store since 1985. We carefully curate
              the finest instruments and accessories from leading brands worldwide.
              Our expert team brings decades of experience to help you find the
              perfect gear for your musical journey—whether you're a student,
              educator, or professional performer.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="tel:+17025551234">
                  <Phone className="mr-2 h-5 w-5" />
                  Call an Expert
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/shop/woodwinds">Shop Woodwinds</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/shop/brasswinds">Shop Brasswinds</Link>
              </Button>
            </div>
            <p className="text-sm font-medium text-gray-600">
              You Have Questions - We Have Answers - Give Us A Call!
            </p>
          </div>
        </div>
      </section>

      {/* Promotional Banners */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {promoBanners.slice(0, 6).map((promo) => (
            <Card key={promo.id} className="group overflow-hidden">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={promo.image}
                  alt={promo.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                  <h3 className="mb-2 text-xl font-bold">{promo.title}</h3>
                  <p className="mb-2 text-sm opacity-90">{promo.description}</p>
                  <div className="mb-4 text-xs opacity-75">
                    Valid: {promo.validUntil}
                  </div>
                  <Button variant="secondary" size="sm" asChild>
                    <Link href={promo.ctaLink}>{promo.ctaText}</Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <p className="mt-2 text-gray-600">
              Handpicked selection of our finest instruments
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/shop">View All Products</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Trust Strip */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="mb-2 font-semibold">Expert Advice</h3>
              <p className="text-sm text-gray-600">
                Our team of professional musicians provides personalized guidance
              </p>
            </div>
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="mb-2 font-semibold">Professional Setup</h3>
              <p className="text-sm text-gray-600">
                Every instrument is carefully inspected and set up before shipping
              </p>
            </div>
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="mb-2 font-semibold">Fast Shipping</h3>
              <p className="text-sm text-gray-600">
                Free shipping on orders over $500. Most items ship within 2-3 days
              </p>
            </div>
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="mb-2 font-semibold">Financing Available</h3>
              <p className="text-sm text-gray-600">
                Flexible payment options with 0% APR promotions available
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

