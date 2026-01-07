'use client'

import { useState } from 'react'
import { useCartStore } from '@/lib/store/cart'
import { Loader2, ExternalLink } from 'lucide-react'

interface PayPalMeButtonProps {
  shippingInfo: {
    email: string
    firstName: string
    lastName: string
    address1: string
    address2?: string
    city: string
    state: string
    zip: string
    country: string
    phone: string
  } | null
  shippingCost?: number | null
  onError?: (error: Error) => void
}

export function PayPalMeButton({ shippingInfo, shippingCost, onError }: PayPalMeButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const items = useCartStore((state) => state.items)
  const subtotal = useCartStore((state) => state.getSubtotal())
  // Use calculated shipping cost if provided, otherwise default logic
  const shipping = shippingCost ?? (subtotal > 500 ? 0 : 25)
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const PAYPAL_ME_LINK = 'https://paypal.me/jamescuongle'

  const handlePayPalMe = async () => {
    if (items.length === 0) {
      onError?.(new Error('Cart is empty'))
      return
    }

    setIsLoading(true)

    try {
      // Create order in database first
      const orderItems = items.map(item => ({
        productId: item.productId,
        name: item.name,
        sku: item.sku,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }))

      const response = await fetch('/api/paypal/create-standard-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: orderItems,
          subtotal,
          shipping,
          tax,
          total,
          shippingInfo,
          paymentMethod: 'paypal_me',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to create order')
      }

      const { orderId } = await response.json()

      // Open PayPal.me link with amount in new tab
      const paypalMeUrl = `${PAYPAL_ME_LINK}/${total.toFixed(2)}USD`
      window.open(paypalMeUrl, '_blank')

      // Redirect to pending page with order info
      window.location.href = `/checkout/paypal-me-pending?orderId=${orderId}&amount=${total.toFixed(2)}`

    } catch (error: any) {
      console.error('PayPal.me error:', error)
      onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Or pay directly</span>
        </div>
      </div>

      <button
        onClick={handlePayPalMe}
        disabled={isLoading || items.length === 0}
        className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-[#0070ba] hover:bg-[#005ea6] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <ExternalLink className="h-5 w-5" />
            Pay with PayPal.me (${total.toFixed(2)})
          </>
        )}
      </button>

      <p className="text-xs text-center text-gray-500">
        Opens PayPal.me in new tab for manual payment
      </p>
    </div>
  )
}
