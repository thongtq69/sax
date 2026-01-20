import { Suspense } from 'react'
import type { Metadata } from 'next'
import InquiryForm from './InquiryForm'

export const metadata: Metadata = {
  title: 'Product Inquiry - Contact Us | James Sax Corner',
  description: 'Have questions about our professional saxophones? Contact James Sax Corner for expert advice, product information, and personalized recommendations. We\'re here to help you find the perfect instrument.',
  keywords: [
    'saxophone inquiry',
    'contact james sax corner',
    'saxophone questions',
    'professional saxophone advice',
    'instrument consultation',
    'saxophone expert',
    'product information',
    'saxophone help'
  ],
  openGraph: {
    title: 'Product Inquiry - Contact Us | James Sax Corner',
    description: 'Have questions about our professional saxophones? Contact us for expert advice and personalized recommendations.',
    type: 'website',
    siteName: 'James Sax Corner',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Product Inquiry - Contact Us | James Sax Corner',
    description: 'Have questions about our professional saxophones? Contact us for expert advice.',
  },
  alternates: {
    canonical: 'https://jamessaxcorner.com/inquiry',
  },
}

function InquiryFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/40 via-white to-white">
      <div className="container mx-auto px-4 py-10 md:py-14 lg:py-16 max-w-5xl">
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
          <div className="bg-secondary text-white px-5 py-4">
            <h1 className="text-xl md:text-2xl font-bold">Product Inquiry</h1>
            <p className="text-sm text-white/80">Loading inquiry form...</p>
          </div>
          <div className="p-6 md:p-8 text-sm text-muted-foreground">Please wait a moment.</div>
        </div>
      </div>
    </div>
  )
}

export default function InquiryPage() {
  return (
    <Suspense fallback={<InquiryFallback />}>
      <InquiryForm />
    </Suspense>
  )
}
