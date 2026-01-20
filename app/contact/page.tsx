import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Mail, MessageSquare, Clock, Globe } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us - James Sax Corner',
  description: 'Get in touch with James Sax Corner for professional saxophone inquiries, expert advice, and customer support. We\'re here to help you find the perfect instrument.',
  keywords: [
    'contact james sax corner',
    'saxophone customer service',
    'professional saxophone help',
    'instrument consultation',
    'saxophone expert contact',
    'musical instrument support'
  ],
  openGraph: {
    title: 'Contact Us - James Sax Corner',
    description: 'Get in touch with James Sax Corner for professional saxophone inquiries and expert advice.',
    type: 'website',
    siteName: 'James Sax Corner',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://jamessaxcorner.com'}/contact`,
  },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/40 via-white to-white">
      <div className="container mx-auto px-4 py-10 md:py-14 lg:py-16 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Contact James Sax Corner
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions about our professional saxophones? We're here to help you find the perfect instrument.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Methods */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Product Inquiry</h2>
              </div>
              <p className="text-gray-600 mb-4">
                For specific product questions, availability, and expert recommendations.
              </p>
              <Link href="/inquiry">
                <Button className="w-full">
                  Send Product Inquiry
                </Button>
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Email Support</h2>
              </div>
              <p className="text-gray-600 mb-4">
                General questions, order support, and customer service.
              </p>
              <a href="mailto:info@jamessaxcorner.com">
                <Button variant="outline" className="w-full">
                  info@jamessaxcorner.com
                </Button>
              </a>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Response Time</h2>
              </div>
              <p className="text-gray-600">
                We typically respond to all inquiries within 24 hours during business days.
              </p>
            </div>
          </div>

          {/* Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Worldwide Shipping</h2>
              </div>
              <p className="text-gray-600 mb-4">
                We ship professional saxophones worldwide using:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• FedEx Express International</li>
                <li>• DHL Express Worldwide</li>
                <li>• UPS Express International</li>
              </ul>
            </div>

            <div className="bg-primary/5 rounded-xl border border-primary/20 p-6">
              <h3 className="font-semibold text-primary mb-3">Why Choose James Sax Corner?</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Professional-grade instruments only</li>
                <li>✓ Expert maintenance and setup</li>
                <li>✓ Worldwide express shipping</li>
                <li>✓ Trusted by musicians globally</li>
                <li>✓ Outstanding customer reviews</li>
              </ul>
            </div>

            <div className="text-center">
              <Link href="/shop">
                <Button size="lg" className="w-full">
                  Browse Our Saxophones
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}