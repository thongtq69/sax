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

const whyChooseUs = [
  { title: "Saxophone Specialists", desc: "We focus exclusively on saxophones, allowing us to maintain high standards in selection and preparation." },
  { title: "Individually Prepared", desc: "Each instrument is inspected and adjusted before sale to ensure reliable playability." },
  { title: "Honest & Clear Listings", desc: "Every saxophone is listed as a unique instrument with accurate descriptions." },
  { title: "Secure Purchasing", desc: "All payments are processed through PayPal with full buyer protection." },
  { title: "Trusted Worldwide", desc: "Serving players from different countries and musical backgrounds." }
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
      {/* Hero Section */}
      <section className="relative bg-secondary text-white py-20 md:py-28 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
              <span className="text-sm font-medium">Est. Professional Saxophone Shop</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              About <span className="text-primary">James Sax Corner</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed">
              A specialized saxophone shop dedicated to musicians who value quality, precision, and professional standards.
            </p>
          </div>
        </div>
      </section>

      {/* Main About Content */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h2 className="text-3xl font-bold text-secondary mb-6">Our Mission</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We focus exclusively on premium and professional saxophones, carefully selected to meet the expectations of serious students, advanced players, and working musicians.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Each instrument is individually inspected and prepared to ensure reliable playability, proper mechanical function, and consistent performance before being offered for sale.
                </p>
              </div>
              <div className="relative h-80 rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/homepage3.png"
                  alt="James Sax Corner"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/50 to-transparent" />
              </div>
            </div>

            {/* Services Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20">
                <h3 className="text-xl font-bold text-secondary mb-3">Instrument Sales</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Premium and professional saxophones, carefully selected and individually prepared for serious musicians.
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200/50">
                <h3 className="text-xl font-bold text-secondary mb-3">Private Lessons</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Online and in-person lessons for beginners and advanced players, tailored to individual goals.
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl border border-amber-200/50">
                <h3 className="text-xl font-bold text-secondary mb-3">Repair Services</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Professional repair and maintenance for local clients, focusing on precision and quality.
                </p>
              </div>
            </div>

            {/* Trust Statement */}
            <div className="bg-secondary/5 rounded-2xl p-8 md:p-12 text-center">
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
                Over time, James Sax Corner has earned the trust of musicians worldwide through honest representation, careful preparation of instruments, and consistent service standards. Our reputation is reflected in the feedback and testimonials shared by musicians from different countries and musical backgrounds.
              </p>
              <div className="mt-6 flex items-center justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-amber-400 text-xl">★</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">Why Choose Us</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">What sets James Sax Corner apart from other saxophone dealers</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {whyChooseUs.map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-lg hover:border-primary/30 transition-all duration-300 text-center group">
                <h3 className="font-bold text-secondary mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full FAQ Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-600">Everything you need to know about our products and services</p>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading FAQs...</div>
              ) : (
                faqs.map((faq, i) => (
                  <div key={i} className="border rounded-xl overflow-hidden hover:border-primary/30 transition-colors">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-secondary pr-4">{faq.q}</span>
                      {openFaq === i ? (
                        <ChevronUp className="h-5 w-5 text-primary flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    {openFaq === i && (
                      <div className="px-5 pb-5 pt-0">
                        <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-secondary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Values</h2>
            <p className="text-xl text-white/80 leading-relaxed mb-8">
              At James Sax Corner, we believe in long-term relationships, respect for the instrument, and doing business with integrity.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="px-6 py-3 bg-white/10 rounded-full">
                <span className="font-medium">Quality</span>
              </div>
              <div className="px-6 py-3 bg-white/10 rounded-full">
                <span className="font-medium">Integrity</span>
              </div>
              <div className="px-6 py-3 bg-white/10 rounded-full">
                <span className="font-medium">Precision</span>
              </div>
              <div className="px-6 py-3 bg-white/10 rounded-full">
                <span className="font-medium">Trust</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary/5 via-white to-primary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-4">Ready to Find Your Perfect Saxophone?</h2>
            <p className="text-gray-600 mb-8">Browse our collection of premium instruments or contact us for personalized assistance.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="px-8">
                <Link href="/shop">Browse Instruments</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8">
                <Link href="/inquiry">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
