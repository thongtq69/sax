'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCartStore } from '@/lib/store/cart'
import { Button } from '@/components/ui/button'
import { Clock, CheckCircle, ExternalLink, Copy, Loader2 } from 'lucide-react'

function PayPalMePendingContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const amount = searchParams.get('amount')
  const clearCart = useCartStore((state) => state.clearCart)

  useEffect(() => {
    // Clear cart after order is created
    clearCart()
  }, [clearCart])

  const copyOrderId = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId)
      alert('Order ID copied!')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="h-10 w-10 text-amber-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Pending
          </h1>
          <p className="text-gray-600 mb-6">
            Please complete your payment on PayPal.me
          </p>

          {/* Order Info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-500">Order ID</span>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono bg-white px-2 py-1 rounded border">
                  {orderId?.slice(0, 8)}...
                </code>
                <button 
                  onClick={copyOrderId}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Copy Order ID"
                >
                  <Copy className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Amount</span>
              <span className="text-xl font-bold text-primary">${amount}</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Next Steps
            </h3>
            <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
              <li>Complete payment on PayPal.me (should have opened in new tab)</li>
              <li>Include your Order ID in the payment note</li>
              <li>We'll confirm your order within 24 hours</li>
            </ol>
          </div>

          {/* PayPal.me Link */}
          <a
            href={`https://paypal.me/jamescuongle/${amount}USD`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-[#0070ba] hover:bg-[#005ea6] transition-colors flex items-center justify-center gap-2 mb-4"
          >
            <ExternalLink className="h-5 w-5" />
            Open PayPal.me Again
          </a>

          {/* Contact */}
          <p className="text-sm text-gray-500 mb-4">
            Having trouble? Contact us at{' '}
            <a href="mailto:support@example.com" className="text-primary hover:underline">
              support@example.com
            </a>
          </p>

          {/* Back to Shop */}
          <Button asChild variant="outline" className="w-full">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function PayPalMePendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <PayPalMePendingContent />
    </Suspense>
  )
}
