'use client'

import { useState } from 'react'
import { useCartStore } from '@/lib/store/cart'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface PayPalStandardButtonProps {
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
  shippingCost?: number | null
  onError?: (error: any) => void
}

export function PayPalStandardButton({ shippingInfo, shippingCost, onError }: PayPalStandardButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const items = useCartStore((state) => state.items)
  const subtotal = useCartStore((state) => state.getSubtotal())
  // Use calculated shipping cost if provided, otherwise default logic
  const shipping = shippingCost ?? (subtotal > 500 ? 0 : 25)
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  // PayPal Business Email (Sandbox or Live)
  const paypalEmail = process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL || 'sb-stwky48264789@business.example.com'
  const isSandbox = process.env.NEXT_PUBLIC_PAYPAL_MODE !== 'live'
  
  // PayPal Standard Button URL
  const paypalUrl = isSandbox 
    ? 'https://www.sandbox.paypal.com/cgi-bin/webscr'
    : 'https://www.paypal.com/cgi-bin/webscr'

  // Get the base URL for return/cancel/notify URLs
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')

  const handlePayPalSubmit = async () => {
    if (items.length === 0) {
      onError?.({ message: 'Your cart is empty' })
      return
    }

    setIsLoading(true)
    
    try {
      // First, create order in database
      const response = await fetch('/api/paypal/create-standard-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shippingInfo,
          total,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create order')
      }

      const { orderId } = await response.json()
      console.log('Order created:', orderId)

      // Create and submit PayPal form
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = paypalUrl
      form.target = '_self'

      // Using _cart command to send detailed cart with multiple items
      // This shows each product separately + shipping + tax in PayPal
      const params: Record<string, string> = {
        cmd: '_cart',
        upload: '1', // Required for _cart command
        business: paypalEmail,
        currency_code: 'USD',
        
        // Shipping cost (shown separately in PayPal)
        shipping_1: shipping.toFixed(2),
        
        // Tax (shown separately in PayPal)
        tax_cart: tax.toFixed(2),
        
        // Order tracking
        custom: orderId,
        invoice: orderId,
        
        // URLs
        return: `${baseUrl}/checkout/success?orderId=${orderId}&source=paypal`,
        cancel_return: `${baseUrl}/checkout?cancelled=true`,
        notify_url: `${baseUrl}/api/paypal/ipn`,
        
        // Settings
        rm: '2', // Return method: 2 = POST
        no_shipping: '0', // 0 = prompt for address
        no_note: '1',
        charset: 'utf-8',
        lc: 'US',
        bn: 'JSC_ShoppingCart_WPS_US',
      }

      // Add each cart item with detailed info
      // PayPal _cart uses item_name_X, amount_X, quantity_X format
      items.forEach((item, index) => {
        const itemNum = index + 1
        // Product name with details (brand, model, condition if available)
        let itemName = item.name
        if (item.name.length > 127) {
          itemName = item.name.substring(0, 124) + '...'
        }
        
        params[`item_name_${itemNum}`] = itemName
        params[`amount_${itemNum}`] = item.price.toFixed(2)
        params[`quantity_${itemNum}`] = item.quantity.toString()
        
        // Optional: Add item number/SKU if available
        if (item.productId) {
          params[`item_number_${itemNum}`] = item.productId
        }
      })

      // Add shipping info if provided
      if (shippingInfo) {
        // Override PayPal's default address with user-provided address
        params.address_override = '1' // Force use of provided address
        params.first_name = shippingInfo.firstName
        params.last_name = shippingInfo.lastName
        params.address1 = shippingInfo.address1
        if (shippingInfo.address2) params.address2 = shippingInfo.address2
        params.city = shippingInfo.city
        params.state = shippingInfo.state
        params.zip = shippingInfo.zip
        params.country = shippingInfo.country
        params.email = shippingInfo.email
        params.night_phone_b = shippingInfo.phone
      }

      console.log('PayPal Cart params:', { 
        ...params, 
        business: params.business.replace(/(.{3}).*(@.*)/, '$1***$2'),
        itemCount: items.length,
        subtotal: subtotal.toFixed(2),
        shipping: shipping.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
      })

      // Create hidden inputs
      Object.entries(params).forEach(([key, value]) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = value
        form.appendChild(input)
      })

      // Append form and submit
      document.body.appendChild(form)
      form.submit()
    } catch (error: any) {
      console.error('PayPal Standard error:', error)
      onError?.(error)
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handlePayPalSubmit}
        disabled={isLoading || items.length === 0}
        className="w-full h-12 bg-[#0070ba] hover:bg-[#003087] text-white font-bold text-base"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Redirecting to PayPal...
          </>
        ) : (
          <>
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .757-.629h6.724c2.332 0 4.058.625 5.13 1.86.976 1.121 1.333 2.584 1.062 4.347-.026.17-.06.348-.1.532-.41 1.893-1.202 3.39-2.354 4.45-1.152 1.06-2.7 1.598-4.6 1.598h-1.94a.77.77 0 0 0-.757.629l-.924 5.855a.641.641 0 0 1-.633.74h-.233v-.765z"/>
              <path d="M18.27 7.468c-.02.126-.044.255-.07.387-.84 3.894-3.376 5.24-6.71 5.24h-1.7a.82.82 0 0 0-.81.693l-.87 5.518-.247 1.565a.431.431 0 0 0 .426.498h2.99a.72.72 0 0 0 .71-.607l.03-.152.56-3.558.036-.196a.72.72 0 0 1 .71-.607h.447c2.896 0 5.163-1.177 5.826-4.58.277-1.422.134-2.61-.6-3.443a2.86 2.86 0 0 0-.728-.558z"/>
            </svg>
            Pay with PayPal (${total.toFixed(2)})
          </>
        )}
      </Button>
      
      {isSandbox && (
        <p className="text-xs text-center text-amber-600 bg-amber-50 p-2 rounded">
          🧪 Sandbox Mode - Use test buyer account to complete payment
        </p>
      )}
    </div>
  )
}
