'use client'

import { PayPalButtons, usePayPalScriptReducer, SCRIPT_LOADING_STATE } from '@paypal/react-paypal-js'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store/cart'
import { Loader2, AlertCircle } from 'lucide-react'

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
  } | null
  onSuccess?: (details: any) => void
  onError?: (error: any) => void
}

// Inner component that uses PayPal hooks - only rendered when PayPal is configured
function PayPalButtonInner({ shippingInfo, onSuccess, onError }: PayPalButtonProps) {
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

// Main export - checks if PayPal is configured before rendering
export function PayPalButton(props: PayPalButtonProps) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

  if (!clientId) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-5 w-5" />
          <span className="font-semibold">PayPal Not Configured</span>
        </div>
        <p className="text-sm">
          Payment system is not available. Please contact the store administrator.
        </p>
      </div>
    )
  }

  return <PayPalButtonInner {...props} />
}
