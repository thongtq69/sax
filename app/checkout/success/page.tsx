'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, Package, Mail, ArrowRight, Clock, Loader2 } from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'
import { useCartStore } from '@/lib/store/cart'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderID = searchParams.get('orderID') || searchParams.get('orderId')
  const clearCart = useCartStore((state) => state.clearCart)
  const [isPolling, setIsPolling] = useState(true)
  const [customerInfo, setCustomerInfo] = useState<any>(null)

  // Clear cart when success page loads (for Standard Button flow)
  useEffect(() => {
    clearCart()
  }, [clearCart])

  // Poll for customer info from PayPal
  useEffect(() => {
    if (!orderID) return

    let attempts = 0
    const maxAttempts = 10 // Try for ~30 seconds
    
    const pollForInfo = async () => {
      try {
        const response = await fetch(`/api/paypal/get-transaction?orderId=${orderID}`)
        const data = await response.json()
        
        if (data.hasInfo) {
          setCustomerInfo(data)
          setIsPolling(false)
          return true
        }
      } catch (error) {
        console.error('Error polling for info:', error)
      }
      return false
    }

    const interval = setInterval(async () => {
      attempts++
      const found = await pollForInfo()
      
      if (found || attempts >= maxAttempts) {
        clearInterval(interval)
        setIsPolling(false)
      }
    }, 3000)

    // Initial poll
    pollForInfo()

    return () => clearInterval(interval)
  }, [orderID])

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-lg text-center">
        {/* Success Icon */}
        <div className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full text-green-500">
          <CheckCircle className="h-12 w-12" />
        </div>

        <h1 className="mb-3 text-3xl font-bold text-secondary">Payment Successful!</h1>
        
        <p className="mb-2 text-gray-600">
          Thank you for your purchase. Your order has been confirmed.
        </p>

        {orderID && (
          <div className="mb-6 p-4 bg-gray-50 border rounded-lg">
            <p className="text-sm text-muted-foreground">Order ID</p>
            <p className="font-mono font-semibold text-secondary">{orderID}</p>
          </div>
        )}

        {/* Payment Processing Notice */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            {isPolling ? (
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            ) : (
              <Clock className="h-5 w-5 text-blue-600" />
            )}
            <span className="font-medium text-blue-800">
              {isPolling ? 'Processing Payment...' : 'Payment Confirmed'}
            </span>
          </div>
          <p className="text-sm text-blue-700">
            {isPolling 
              ? 'PayPal is processing your payment. Please wait...'
              : 'You will receive a confirmation email shortly.'}
          </p>
        </div>

        {/* Customer Info (if available) */}
        {customerInfo?.shippingAddress?.email && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-left">
            <h3 className="font-medium text-green-800 mb-2">Shipping To:</h3>
            <div className="text-sm text-green-700 space-y-1">
              <p className="font-medium">{customerInfo.shippingAddress.name}</p>
              {customerInfo.shippingAddress.address1 && (
                <p>{customerInfo.shippingAddress.address1}</p>
              )}
              {(customerInfo.shippingAddress.city || customerInfo.shippingAddress.state) && (
                <p>
                  {[
                    customerInfo.shippingAddress.city,
                    customerInfo.shippingAddress.state,
                    customerInfo.shippingAddress.zip
                  ].filter(Boolean).join(', ')}
                </p>
              )}
              <p>{customerInfo.shippingAddress.email}</p>
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <Mail className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-blue-700">Confirmation Email</p>
            <p className="text-xs text-blue-600">Sent to your email</p>
          </div>
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
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
