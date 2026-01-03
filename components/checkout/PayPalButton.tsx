'use client'

import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store/cart'
import { Loader2 } from 'lucide-react'

interface PayPalButtonProps {
  shippingInfo: {
    email: string
    firstName: string
    lastName: string
    address1: string
    address2: string
    city: string
    state: string
    zip: string
    country: string
    phone: string
  }
  onSuccess?: (details: any) => void
  onError?: (error: any) => void
}

export function PayPalButton({ shippingInfo, onSuccess, onError }: PayPalButtonProps) {
  const [{ isPending, isRejected }] = usePayPalScriptReducer()
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)

  const createOrder = async () => {
    try {
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, shippingInfo }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order')
      }

      return data.orderID
    } catch (error) {
      console.error('Create order error:', error)
      onError?.(error)
      throw error
    }
  }

  const onApprove = async (data: any) => {
    try {
      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderID: data.orderID,
          items,
          shippingInfo 
        }),
      })

      const captureData = await response.json()

      if (!response.ok) {
        throw new Error(captureData.error || 'Failed to capture order')
      }

      // Clear cart and redirect to success page
      clearCart()
      onSuccess?.(captureData)
      router.push(`/checkout/success?orderID=${captureData.orderID}`)
    } catch (error) {
      console.error('Capture order error:', error)
      onError?.(error)
    }
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading PayPal...</span>
      </div>
    )
  }

  if (isRejected) {
    return (
      <div className="text-center py-4 text-red-500">
        Failed to load PayPal. Please refresh the page.
      </div>
    )
  }

  return (
    <PayPalButtons
      style={{
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'paypal',
        height: 48,
      }}
      createOrder={createOrder}
      onApprove={onApprove}
      onError={(err) => {
        console.error('PayPal error:', err)
        onError?.(err)
      }}
      onCancel={() => {
        console.log('Payment cancelled')
      }}
    />
  )
}
