import { Suspense } from 'react'
import InquiryForm from './InquiryForm'

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
