'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Music, Award, Shield, Globe, CheckCircle, ChevronDown, ChevronUp,
  Package, Truck, CreditCard, MessageCircle, Wrench, GraduationCap,
  Star, Heart, Users, Target
} from 'lucide-react'

const faqs = [
  {
    q: "Is this a beginner saxophone?",
    a: "No. We sell professional models only, intended for serious students and working musicians."
  },
  {
    q: "Is this instrument ready to ship?",
    a: "Yes. All listed saxophones are fully prepared and ready for immediate shipment."
  },
  {
    q: "How long does delivery to the U.S. take?",
    a: "We use FedEx, DHL, or UPS express international shipping, with delivery typically in 3–4 business days."
  },
  {
    q: "Is payment secure?",
    a: "Yes. All payments are processed via PayPal with full buyer protection."
  },
  {
    q: "Can I ask questions before buying?",
    a: "Absolutely. We encourage you to contact us before purchase for detailed guidance."
  },
  {
    q: "What saxophones do you sell?",
    a: "We specialize exclusively in professional-level saxophones. We do not sell beginner or entry-level models. All instruments are selected for serious students, advanced players, and working musicians. If you cannot find the exact model you are looking for, we also accept tailor-made sourcing requests and will assist in locating the right instrument whenever possible."
  },
  {
    q: "What shipping carriers do you use?",
    a: "We use FedEx, DHL, and UPS express services exclusively to ensure fast, reliable, and fully trackable international delivery."
  },
  {
    q: "What payment methods do you accept?",
    a: "All payments are processed securely through PayPal, providing full buyer protection and peace of mind for U.S. customers."
  },
  {
    q: "Do you accept returns?",
    a: "Due to the complexity and high cost of international logistics, we do not accept returns. Every saxophone is professionally prepared before shipping, and the consistency of our quality and service is reflected in the testimonials from satisfied U.S. customers."
  },
  {
    q: "Are your reviews from real buyers?",
    a: "Yes. All testimonials come from verified customers and reflect real experiences with our instruments and services."
  },
  {
    q: "Do you ship internationally?",
    a: "Yes. We ship to the United States, Canada, and selected European countries using express international services. Availability may vary by destination."
  },
  {
    q: "Do you offer private saxophone lessons?",
    a: "Yes. We offer private lessons for both beginners and advanced players, available online and in person, tailored to individual musical goals."
  },
  {
    q: "Do you offer repair services?",
    a: "We provide professional repair and maintenance services for local clients only, focusing on precision setup, pad sealing, and balanced mechanical response."
  }
]

const whyChooseUs = [
  { icon: Music, title: "Saxophone Specialists", desc: "We focus exclusively on saxophones, allowing us to maintain high standards in selection and preparation." },
  { icon: Target, title: "Individually Prepared", desc: "Each instrument is inspected and adjusted before sale to ensure reliable playability." },
  { icon: CheckCircle, title: "Honest & Clear Listings", desc: "Every saxophone is listed as a unique instrument with accurate descriptions." },
  { icon: Shield, title: "Secure Purchasing", desc: "All payments are processed through PayPal with full buyer protection." },
  { icon: Globe, title: "Trusted Worldwide", desc: "Serving players from different countries and musical backgrounds." }
]

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-secondary text-white py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-8xl">♪</div>
          <div className="absolute top-20 right-20 text-6xl">♫</div>
          <div className="absolute bottom-10 left-1/4 text-7xl">♬</div>
          <div className="absolute bottom-20 right-1/3 text-5xl">𝄞</div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
              <Music className="h-4 w-4 text-primary" />
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
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-secondary mb-3">Instrument Sales</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Premium and professional saxophones, carefully selected and individually prepared for serious musicians.
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200/50">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-secondary mb-3">Private Lessons</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Online and in-person lessons for beginners and advanced players, tailored to individual goals.
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl border border-amber-200/50">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                  <Wrench className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-secondary mb-3">Repair Services</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Professional repair and maintenance for local clients, focusing on precision and quality.
                </p>
              </div>
            </div>

            {/* Trust Statement */}
            <div className="bg-secondary/5 rounded-2xl p-8 md:p-12 text-center">
              <Star className="h-10 w-10 text-primary mx-auto mb-4" />
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
                Over time, James Sax Corner has earned the trust of musicians worldwide through honest representation, careful preparation of instruments, and consistent service standards. Our reputation is reflected in the feedback and testimonials shared by musicians from different countries and musical backgrounds.
              </p>
              <div className="mt-6 flex items-center justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
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
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-bold text-secondary mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-600">Everything you need to know about our products and services</p>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
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
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-secondary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Heart className="h-12 w-12 text-primary mx-auto mb-6" />
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
