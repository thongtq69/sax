'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import type { Product } from '@/lib/data'
import { ChevronRight, Star, Sparkles } from 'lucide-react'
import type { Review } from '@/lib/reviews'
import { ScrollAnimations } from '@/components/site/ScrollAnimations'

import { StaticProductGrid } from '@/components/home/StaticProductGrid'
import { FlashSale } from '@/components/site/FlashSale'

// Lazy load popup - only when user clicks "View All Reviews"
const TestimonialsPopup = dynamic(
  () => import('@/components/site/TestimonialsPopup').then(m => m.TestimonialsPopup),
  { ssr: false }
)

// Lazy load ReviewsCarousel
const ReviewsCarousel = dynamic(
  () => import('@/components/home/ReviewsCarousel').then(m => m.ReviewsCarousel),
  { ssr: false }
)

// Lazy load NewsletterPopup
const NewsletterPopup = dynamic(
  () => import('@/components/site/NewsletterPopup').then(m => m.NewsletterPopup),
  { ssr: false }
)

const PopupAd = dynamic(
  () => import('@/components/PopupAd'),
  { ssr: false }
)

export interface HomePageData {
  featuredProducts: Product[]
  saleProducts: Product[]
  onSaleProducts: Product[]
  professionalFlutesProducts: Product[]
  saxophonesProducts: Product[]
  studentInstrumentsProducts: Product[]
  collectionTitles: Record<string, string>
  collectionBackgrounds: Record<string, string>
  heroContent: {
    image: string
    logoImage: string
    buttonText: string
    buttonLink: string
  }
  allProducts: Product[]
  reviews: Review[]
}

export function HomePageClient({ data }: { data: HomePageData }) {
  const {
    featuredProducts,
    saleProducts,
    onSaleProducts,
    professionalFlutesProducts,
    saxophonesProducts,
    studentInstrumentsProducts,
    collectionTitles,
    collectionBackgrounds,
    heroContent,
    allProducts,
    reviews,
  } = data

  const [showTestimonials, setShowTestimonials] = useState(false)
  const [showNewsletter, setShowNewsletter] = useState(false)

  return (
    <div className="space-y-0 page-content">
      <ScrollAnimations />
      <section className="homepage-hero relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src={heroContent.image} alt="Saxophones Background" fill className="object-cover" priority sizes="100vw" quality={85} />
        </div>
        <div className="relative min-h-[280px] md:min-h-[350px] lg:min-h-[420px]">
          <div className="container mx-auto flex min-h-[280px] md:min-h-[350px] lg:min-h-[420px] items-center justify-center px-4 py-8 md:py-12">
            <div className="text-center space-y-4 md:space-y-6">
              <div className="hero-title flex justify-center">
                <Image src={heroContent.logoImage} alt="James Sax Corner" width={760} height={220} className="h-[70px] md:h-[90px] lg:h-[110px] w-auto drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]" priority />
              </div>
              <p className="hero-cta text-base md:text-lg lg:text-xl leading-relaxed text-white max-w-3xl mx-auto font-body drop-shadow-lg">
                Premium saxophones, expertly maintained for peak performance. Trusted by musicians worldwide, backed by outstanding reviews. Unmatched customer service—your satisfaction comes first! Buy with confidence!
              </p>
              <div className="hero-cta flex justify-center pt-2">
                <Button size="lg" variant="outline" className="border-2 border-white bg-white text-black hover:bg-white/90 hover:text-secondary hover:scale-105 group transition-all duration-300 font-body text-base md:text-lg px-6 md:px-8" asChild>
                  <Link href={heroContent.buttonLink} className="flex items-center">
                    {heroContent.buttonText}
                    <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-4">
              <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white/60 to-white/60" />
              <div className="flex items-center gap-2">
                <span className="text-white/80 text-2xl">♪</span>
                <span className="text-white/80 text-xl">♫</span>
                <span className="text-white/80 text-2xl">♪</span>
              </div>
              <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-white/60 to-white/60" />
            </div>
          </div>
        </div>
        <div className="relative py-8 sm:py-10 md:py-12">
          <div className="container mx-auto px-4">
            <div className="mb-4 sm:mb-6 text-center animate-fade-in-up">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/90 text-amber-700 text-[10px] sm:text-xs font-medium mb-3 rounded-full shadow-md backdrop-blur-sm">
                <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-amber-400 text-amber-400" />
                Trusted by Musicians Worldwide
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3 drop-shadow-lg">What Our Customers Say</h2>
            </div>
            <ReviewsCarousel reviews={reviews} productImages={allProducts.slice(0, 10).map(p => p.images[0])} onViewAll={() => setShowTestimonials(true)} />
          </div>
        </div>
      </section>


      {saleProducts.length > 0 && (
        <section className="relative overflow-hidden">
          {/* Title section - no background */}
          <div className="bg-white">
            <div className="container mx-auto px-4 pt-1 pb-0">
              <div className="flex items-center justify-center gap-3">
                <div className="flex-1 h-px bg-primary/30" />
                <span className="text-2xl sm:text-3xl text-primary">♪</span>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-secondary tracking-wide uppercase">{collectionTitles['new-arrivals']}</h2>
                <span className="text-2xl sm:text-3xl text-primary">♪</span>
                <div className="flex-1 h-px bg-primary/30" />
              </div>
              <div className="text-center mt-2">
                <Link href="/shop?badge=coming-soon" className="text-xs sm:text-sm text-primary hover:text-secondary transition-colors inline-flex items-center gap-1">
                  View All <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Link>
              </div>
            </div>
          </div>
          {/* Products section - with background */}
          <div className="relative" style={collectionBackgrounds['new-arrivals'] ? { backgroundImage: `url(${collectionBackgrounds['new-arrivals']})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
            {collectionBackgrounds['new-arrivals'] && <div className="absolute inset-0 bg-white/5" />}
            <div className="relative container mx-auto px-4 py-4 sm:py-6">
              <StaticProductGrid products={saleProducts} id="new-arrivals" />
            </div>
          </div>
        </section>
      )}

      {featuredProducts.length > 0 && (
        <section className="relative overflow-hidden">
          {/* Title section - no background */}
          <div className="bg-white">
            <div className="container mx-auto px-4 pt-1 pb-0">
              <div className="flex items-center justify-center gap-3">
                <div className="flex-1 h-px bg-primary/30" />
                <span className="text-2xl sm:text-3xl text-primary">♫</span>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-secondary tracking-wide uppercase">{collectionTitles['featured-instruments']}</h2>
                <span className="text-2xl sm:text-3xl text-primary">♫</span>
                <div className="flex-1 h-px bg-primary/30" />
              </div>
              <div className="text-center mt-2">
                <Link href="/shop?badge=new" className="text-xs sm:text-sm text-primary hover:text-secondary transition-colors inline-flex items-center gap-1">
                  View All <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Link>
              </div>
            </div>
          </div>
          {/* Products section - with background */}
          <div className="relative" style={collectionBackgrounds['featured-instruments'] ? { backgroundImage: `url(${collectionBackgrounds['featured-instruments']})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
            {collectionBackgrounds['featured-instruments'] && <div className="absolute inset-0 bg-white/5" />}
            <div className="relative container mx-auto px-4 py-4 sm:py-6">
              <StaticProductGrid products={featuredProducts} id="featured" />
            </div>
          </div>
        </section>
      )}

      {/* Flash Sale Section */}
      {onSaleProducts.length > 0 && (
        <FlashSale products={onSaleProducts} />
      )}



      {/* Professional Flutes Section */}
      {professionalFlutesProducts.length > 0 && (
        <section className="relative overflow-hidden">
          {/* Title section - no background */}
          <div className="bg-white">
            <div className="container mx-auto px-4 pt-1 pb-0">
              <div className="flex items-center justify-center gap-3">
                <div className="flex-1 h-px bg-primary/30" />
                <span className="text-2xl sm:text-3xl text-primary">🎵</span>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-secondary tracking-wide uppercase">{collectionTitles['professional-flutes']}</h2>
                <span className="text-2xl sm:text-3xl text-primary">🎵</span>
                <div className="flex-1 h-px bg-primary/30" />
              </div>
              <div className="text-center mt-2">
                <Link href="/shop?subcategory=flutes" className="text-xs sm:text-sm text-primary hover:text-secondary transition-colors inline-flex items-center gap-1">
                  View All <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Link>
              </div>
            </div>
          </div>
          {/* Products section - with background */}
          <div className="relative" style={collectionBackgrounds['professional-flutes'] ? { backgroundImage: `url(${collectionBackgrounds['professional-flutes']})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
            {collectionBackgrounds['professional-flutes'] && <div className="absolute inset-0 bg-white/5" />}
            <div className="relative container mx-auto px-4 py-4 sm:py-6">
              <StaticProductGrid products={professionalFlutesProducts} id="professional-flutes" />
            </div>
          </div>
        </section>
      )}

      {/* Saxophones Section */}
      {saxophonesProducts.length > 0 && (
        <section className="relative overflow-hidden">
          {/* Title section - no background */}
          <div className="bg-white">
            <div className="container mx-auto px-4 pt-1 pb-0">
              <div className="flex items-center justify-center gap-3">
                <div className="flex-1 h-px bg-primary/30" />
                <span className="text-2xl sm:text-3xl text-primary">🎷</span>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-secondary tracking-wide uppercase">{collectionTitles['saxophones']}</h2>
                <span className="text-2xl sm:text-3xl text-primary">🎷</span>
                <div className="flex-1 h-px bg-primary/30" />
              </div>
              <div className="text-center mt-2">
                <Link href="/shop?category=saxophones" className="text-xs sm:text-sm text-primary hover:text-secondary transition-colors inline-flex items-center gap-1">
                  View All <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Link>
              </div>
            </div>
          </div>
          {/* Products section - with background */}
          <div className="relative" style={collectionBackgrounds['saxophones'] ? { backgroundImage: `url(${collectionBackgrounds['saxophones']})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: 'linear-gradient(to bottom right, rgba(254, 243, 199, 0.3), white, rgba(219, 234, 254, 0.3))' }}>
            {collectionBackgrounds['saxophones'] && <div className="absolute inset-0 bg-white/5" />}
            <div className="relative container mx-auto px-4 py-4 sm:py-6">
              <StaticProductGrid products={saxophonesProducts} id="saxophones" />
            </div>
          </div>
        </section>
      )}

      {/* Student Instruments Section */}
      {studentInstrumentsProducts.length > 0 && (
        <section className="relative overflow-hidden">
          {/* Title section - no background */}
          <div className="bg-white">
            <div className="container mx-auto px-4 pt-1 pb-0">
              <div className="flex items-center justify-center gap-3">
                <div className="flex-1 h-px bg-primary/30" />
                <span className="text-2xl sm:text-3xl text-primary">📚</span>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-secondary tracking-wide uppercase">{collectionTitles['student-instruments']}</h2>
                <span className="text-2xl sm:text-3xl text-primary">📚</span>
                <div className="flex-1 h-px bg-primary/30" />
              </div>
              <div className="text-center mt-2">
                <Link href="/shop?productType=student" className="text-xs sm:text-sm text-primary hover:text-secondary transition-colors inline-flex items-center gap-1">
                  View All <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Link>
              </div>
            </div>
          </div>
          {/* Products section - with background */}
          <div className="relative" style={collectionBackgrounds['student-instruments'] ? { backgroundImage: `url(${collectionBackgrounds['student-instruments']})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
            {collectionBackgrounds['student-instruments'] && <div className="absolute inset-0 bg-white/5" />}
            <div className="relative container mx-auto px-4 py-4 sm:py-6">
              <StaticProductGrid products={studentInstrumentsProducts} id="student-instruments" />
            </div>
          </div>
        </section>
      )}

      <section className="bg-gradient-to-br from-amber-50/50 via-white to-blue-50/50">
        <div className="container mx-auto px-4 pt-1 pb-0">
          <div className="flex items-center justify-center gap-3">
            <div className="flex-1 h-px bg-primary/30" />
            <span className="text-2xl sm:text-3xl text-primary">♬</span>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-secondary tracking-wide uppercase">SHOP BY CATEGORY</h2>
            <span className="text-2xl sm:text-3xl text-primary">♬</span>
            <div className="flex-1 h-px bg-primary/30" />
          </div>
          <div className="text-center mt-2">
            <Link href="/shop" className="text-xs sm:text-sm text-primary hover:text-secondary transition-colors inline-flex items-center gap-1">
              View All <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Link>
          </div>
        </div>
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 w-full">
            {/* Fixed categories: Alto, Soprano, Tenor, Baritone */}
            {[
              { name: 'Alto', slug: 'alto' },
              { name: 'Soprano', slug: 'soprano' },
              { name: 'Tenor', slug: 'tenor' },
              { name: 'Baritone', slug: 'baritone' },
            ].map((sub, i) => {
              const musicNotes = ['♪', '♫', '♬', '𝄞']
              const noteIcon = musicNotes[i % musicNotes.length]
              return (
                <Link key={sub.slug} href={`/shop?subcategory=${sub.slug}`} className="group bg-secondary hover:bg-secondary/90 rounded-lg p-3 sm:p-5 transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: `${0.1 * i}s` }}>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-amber-400 text-xl sm:text-3xl group-hover:animate-bounce transition-transform duration-300">{noteIcon}</span>
                    <h3 className="text-sm sm:text-lg md:text-xl font-bold text-white group-hover:text-amber-300 transition-colors duration-300">{sub.name}</h3>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section id="reviews" className="bg-gradient-to-br from-amber-50/30 via-white to-blue-50/30 py-3 sm:py-4 md:py-6">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row gap-3 md:gap-6 items-stretch">
            <div className="animate-fade-in-left md:w-[35%] md:shrink-0">
              <h2 className="text-xl sm:text-2xl font-bold text-secondary mb-3 uppercase tracking-wide">WHY CHOOSE US</h2>
              <div className="space-y-0.5">
                {[
                  { title: 'Saxophone Specialists', desc: 'We focus exclusively on saxophones, maintaining high standards.' },
                  { title: 'Individually Prepared', desc: 'Each instrument is inspected and adjusted before sale.' },
                  { title: 'Honest & Clear Listings', desc: 'Every saxophone listed as unique with accurate descriptions.' },
                  { title: 'Secure Purchasing', desc: 'Payments processed through PayPal with buyer protection.' },
                  { title: 'Trusted Worldwide', desc: 'Serving players from different countries worldwide.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-2 py-1 px-2 bg-white border border-transparent hover:border-primary/30 transition-all duration-500 hover:shadow-lg">
                    <div className="flex-shrink-0 w-5 h-5 bg-primary/10 flex items-center justify-center rounded">
                      <Star className="h-3 w-3 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-secondary text-sm leading-tight">{item.title}</h3>
                      <p className="text-xs text-muted-foreground leading-snug">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="animate-fade-in-right flex flex-col md:flex-1">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-3 sm:p-4 h-full flex flex-col justify-center">
                <div className="flex justify-center mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-[11px] sm:text-sm italic text-secondary mb-1.5 leading-snug text-center">
                  &ldquo;This was the single best transaction I&apos;ve had with an online seller. James sent me a video detailing the horn. Shipping from Vietnam to US took 3 days with impeccable packaging. The horn arrived exactly as described. James did an excellent job replacing pads and adjusting. I would purchase from him again in a heartbeat.&rdquo;
                </blockquote>
                <div className="font-semibold text-secondary text-xs text-center">— Zach E.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="hidden lg:block bg-gradient-to-r from-primary to-primary/80 py-3 relative overflow-hidden cursor-pointer" onClick={() => setShowNewsletter(true)}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        <div className="container mx-auto px-6">
          {/* Join Our Musical Community */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold text-white flex items-center gap-1.5 whitespace-nowrap min-w-[320px]">
              <Sparkles className="h-4 w-4" />
              Join Our Musical Community
            </span>
            <div className="flex gap-2 flex-1 max-w-md">
              <input type="email" placeholder="Enter your email" className="bg-white/20 border border-white/30 placeholder:text-white/60 text-white min-w-0 flex-1 px-4 py-1.5 rounded text-sm h-9 cursor-pointer" readOnly />
              <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-white px-4 text-sm h-9">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <TestimonialsPopup isOpen={showTestimonials} onClose={() => setShowTestimonials(false)} />
      <NewsletterPopup isOpen={showNewsletter} onClose={() => setShowNewsletter(false)} />
      <PopupAd />
    </div>
  )
}
