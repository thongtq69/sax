'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  order: number
  isActive: boolean
}

// Fallback FAQs in case database is unavailable
const fallbackFaqs = [
  { q: "What saxophones do you sell?", a: "We specialize exclusively in professional-level saxophones. We do not sell beginner or entry-level models." },
  { q: "What shipping carriers do you use?", a: "We use FedEx, DHL, and UPS express services exclusively to ensure fast, reliable, and fully trackable international delivery." },
  { q: "What payment methods do you accept?", a: "All payments are processed securely through PayPal, providing full buyer protection and peace of mind for U.S. customers." },
  { q: "Do you accept returns?", a: "Due to the complexity and high cost of international logistics, we do not accept returns. Every saxophone is professionally prepared before shipping." },
  { q: "Do you ship internationally?", a: "Yes. We ship to the United States, Canada, and selected European countries using express international services." }
]

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [faqs, setFaqs] = useState<{ q: string; a: string }[]>(fallbackFaqs)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFaqs() {
      try {
        const response = await fetch('/api/admin/faqs?activeOnly=true')
        if (response.ok) {
          const data = await response.json()
          const activeFaqs = (data.faqs || [])
            .sort((a: FAQ, b: FAQ) => a.order - b.order)
            .map((faq: FAQ) => ({ q: faq.question, a: faq.answer }))
          if (activeFaqs.length > 0) {
            setFaqs(activeFaqs)
          }
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchFaqs()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section - Compact with Logo */}
      <section className="relative bg-secondary text-white py-3 md:py-4 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Logo Banner */}
            <div className="flex justify-center mb-1.5">
              <Image
                src="/74249d1e1cf393adcae2.jpg"
                alt="James Sax Corner"
                width={350}
                height={90}
                className="w-[220px] md:w-[280px] lg:w-[350px] h-auto"
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
            <p className="text-xs md:text-sm text-white/80 leading-relaxed">
              A specialized saxophone shop dedicated to musicians who value quality, precision, and professional standards.
            </p>
          </div>
        </div>
      </section>

      {/* Main About Content */}
      <section className="py-5 md:py-6 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 items-center mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-4">Our Mission</h2>
                <p className="text-gray-600 leading-relaxed mb-3 text-sm md:text-base">
                  We focus exclusively on premium and professional saxophones, carefully selected to meet the expectations of serious students, advanced players, and working musicians.
                </p>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  Each instrument is individually inspected and prepared to ensure reliable playability, proper mechanical function, and consistent performance before being offered for sale.
                </p>
              </div>
              <div className="relative h-64 md:h-72 rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/20260112_0006.jpg"
                  alt="James Sax Corner - Professional Saxophone"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/50 to-transparent" />
              </div>
            </div>

            {/* Our Values - Same style as Our Mission */}
            <div className="grid md:grid-cols-2 gap-6 items-center mb-6">
              <div className="order-2 md:order-1 relative h-64 md:h-72 rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/20260112_0005.jpg"
                  alt="Our Values"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/50 to-transparent" />
              </div>
              <div className="order-1 md:order-2">
                <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-4">Our Values</h2>
                <p className="text-gray-600 leading-relaxed mb-4 text-sm md:text-base">
                  At James Sax Corner, we believe in long-term relationships, respect for the instrument, and doing business with integrity.
                </p>
                <div className="flex flex-wrap gap-2">
                  <div className="px-4 py-2 bg-secondary/10 rounded-full border border-secondary/20">
                    <span className="font-medium text-sm text-secondary">Quality</span>
                  </div>
                  <div className="px-4 py-2 bg-secondary/10 rounded-full border border-secondary/20">
                    <span className="font-medium text-sm text-secondary">Integrity</span>
                  </div>
                  <div className="px-4 py-2 bg-secondary/10 rounded-full border border-secondary/20">
                    <span className="font-medium text-sm text-secondary">Precision</span>
                  </div>
                  <div className="px-4 py-2 bg-secondary/10 rounded-full border border-secondary/20">
                    <span className="font-medium text-sm text-secondary">Trust</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Services Grid */}
            <div className="grid md:grid-cols-3 gap-4 md:gap-5 mb-6">
              <div className="p-4 md:p-5 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                <h3 className="text-lg font-bold text-secondary mb-2">Instrument Sales</h3>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                  Premium and professional saxophones, carefully selected and individually prepared for serious musicians.
                </p>
              </div>
              <div className="p-4 md:p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50">
                <h3 className="text-lg font-bold text-secondary mb-2">Private Lessons</h3>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                  Online and in-person lessons for beginners and advanced players, tailored to individual goals.
                </p>
              </div>
              <div className="p-4 md:p-5 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl border border-amber-200/50">
                <h3 className="text-lg font-bold text-secondary mb-2">Repair Services</h3>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                  Professional repair and maintenance for local clients, focusing on precision and quality.
                </p>
              </div>
            </div>

            {/* Trust Statement */}
            <div className="bg-secondary/5 rounded-xl p-5 md:p-6 text-center mb-0">
              <p className="text-sm md:text-base text-gray-700 leading-relaxed max-w-3xl mx-auto">
                Over time, James Sax Corner has earned the trust of musicians worldwide through honest representation, careful preparation of instruments, and consistent service standards. Our reputation is reflected in the feedback and testimonials shared by musicians from different countries and musical backgrounds.
              </p>
              <div className="mt-2 flex items-center justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-amber-400 text-lg">★</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-3 md:py-4 bg-gradient-to-br from-primary/5 via-white to-primary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-base md:text-lg font-bold text-secondary mb-1">Ready to Find Your Perfect Saxophone?</h2>
            <p className="text-gray-600 text-xs md:text-sm mb-2">Browse our collection of premium instruments or contact us for personalized assistance.</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild size="sm" className="px-5">
                <Link href="/shop">Browse Instruments</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="px-5">
                <Link href="/inquiry">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Full FAQ Section */}
      <section className="py-4 md:py-5 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-3">
              <h2 className="text-xl md:text-2xl font-bold text-secondary mb-1">Frequently Asked Questions</h2>
              <p className="text-gray-600 text-xs md:text-sm">Everything you need to know about our products and services</p>
            </div>
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-4 text-gray-500">Loading FAQs...</div>
              ) : (
                faqs.map((faq, i) => (
                  <div key={i} className="border rounded-lg overflow-hidden hover:border-primary/30 transition-colors">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-3 text-left bg-white hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-secondary pr-4 text-xs md:text-sm">{faq.q}</span>
                      {openFaq === i ? (
                        <ChevronUp className="h-4 w-4 text-primary flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    {openFaq === i && (
                      <div className="px-3 pb-3 pt-0">
                        <p className="text-gray-600 leading-relaxed text-xs md:text-sm">{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
