'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, Package, Mail, ArrowRight } from 'lucide-react'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderID = searchParams.get('orderID')

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-lg text-center">
        {/* Success Icon */}
        <div className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-500">
          <CheckCircle className="h-12 w-12" />
        </div>

        <h1 className="mb-3 text-3xl font-bold text-secondary">Payment Successful!</h1>
        
        <p className="mb-2 text-gray-600">
          Thank you for your purchase. Your order has been confirmed.
        </p>

        {orderID && (
          <div className="mb-6 p-4 bg-gray-50 border">
            <p className="text-sm text-muted-foreground">Order ID</p>
            <p className="font-mono font-semibold text-secondary">{orderID}</p>
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-blue-50 border border-blue-100">
            <Mail className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-blue-700">Confirmation Email</p>
            <p className="text-xs text-blue-600">Sent to your email</p>
          </div>
          <div className="p-4 bg-amber-50 border border-amber-100">
            <Package className="h-6 w-6 text-amber-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-amber-700">Shipping</p>
            <p className="text-xs text-amber-600">2-5 business days</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button asChild className="w-full h-12">
            <Link href="/shop" className="flex items-center justify-center gap-2">
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>

        {/* Support Info */}
        <p className="mt-8 text-xs text-muted-foreground">
          Questions about your order? Contact us at{' '}
          <a href="mailto:support@jamessaxcorner.com" className="text-primary hover:underline">
            support@jamessaxcorner.com
          </a>
        </p>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
