'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Home } from 'lucide-react'
import { InquiryFormContent } from '@/components/inquiry/InquiryFormContent'

export default function InquiryForm() {
  const searchParams = useSearchParams()
  const prefillProduct = searchParams.get('product') || ''
  const prefillSku = searchParams.get('sku') || ''

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/40 via-white to-white">
      <div className="container mx-auto px-4 py-10 md:py-14 lg:py-16 max-w-5xl">
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="flex items-center gap-1 hover:text-primary">
            <Home className="h-4 w-4" />
            Home
          </Link>
          <span className="text-muted-foreground/50">/</span>
          <span className="text-secondary font-medium">Product Inquiry</span>
        </div>
        <InquiryFormContent
          prefillProduct={prefillProduct}
          prefillSku={prefillSku}
          showBackToShop
        />
      </div>
    </div>
  )
}
