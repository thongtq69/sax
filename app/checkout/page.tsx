'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useCartStore } from '@/lib/store/cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ShieldCheck, Lock, Package, Truck, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react'
import { PayPalStandardButton } from '@/components/checkout/PayPalStandardButton'
import { PayPalMeButton } from '@/components/checkout/PayPalMeButton'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const items = useCartStore((state) => state.items)
  const subtotal = useCartStore((state) => state.getSubtotal())
  const shipping = subtotal > 500 ? 0 : 25
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const [shippingInfo, setShippingInfo] = useState({
    email: '', firstName: '', lastName: '', address1: '', address2: '',
    city: '', state: '', zip: '', country: 'United States', phone: '',
  })

  // Check if payment was cancelled
  useEffect(() => {
    if (searchParams.get('cancelled') === 'true') {
      setPaymentError('Payment was cancelled. Please try again.')
    }
  }, [searchParams])

  const handleChange = (field: string, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }))
  }

  const allFieldsFilled = shippingInfo.email && shippingInfo.firstName && shippingInfo.lastName && 
    shippingInfo.address1 && shippingInfo.city && shippingInfo.state && shippingInfo.zip && shippingInfo.phone

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <Button asChild><Link href="/shop">Continue Shopping</Link></Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/shop" className="inline-flex items-center text-sm text-gray-500 hover:text-primary mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Continue Shopping
          </Link>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>

        {/* Payment cancelled warning */}
        {paymentError && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <p className="text-amber-800">{paymentError}</p>
            <button 
              onClick={() => setPaymentError(null)}
              className="ml-auto text-amber-600 hover:text-amber-800"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center gap-3 mb-6">
                <Truck className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Shipping Information</h2>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Fill this form if your shipping address differs from your PayPal address
              </p>
              <div className="space-y-4">
                <Input placeholder="Email *" value={shippingInfo.email} onChange={(e) => handleChange('email', e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="First Name *" value={shippingInfo.firstName} onChange={(e) => handleChange('firstName', e.target.value)} />
                  <Input placeholder="Last Name *" value={shippingInfo.lastName} onChange={(e) => handleChange('lastName', e.target.value)} />
                </div>
                <Input placeholder="Address *" value={shippingInfo.address1} onChange={(e) => handleChange('address1', e.target.value)} />
                <Input placeholder="Apt, Suite (optional)" value={shippingInfo.address2} onChange={(e) => handleChange('address2', e.target.value)} />
                <div className="grid grid-cols-3 gap-4">
                  <Input placeholder="City *" value={shippingInfo.city} onChange={(e) => handleChange('city', e.target.value)} />
                  <Input placeholder="State *" value={shippingInfo.state} onChange={(e) => handleChange('state', e.target.value)} />
                  <Input placeholder="ZIP *" value={shippingInfo.zip} onChange={(e) => handleChange('zip', e.target.value)} />
                </div>
                <Input placeholder="Phone *" value={shippingInfo.phone} onChange={(e) => handleChange('phone', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <h2 className="text-xl font-semibold">Order Summary</h2>
              <div className="space-y-3 max-h-[200px] overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 p-2 bg-gray-50 rounded-lg">
                    <div className="relative h-14 w-14 overflow-hidden rounded bg-white border">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">${item.price.toLocaleString()} x {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold">${(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span className={shipping === 0 ? "text-green-600" : ""}>{shipping === 0 ? "FREE" : "$" + shipping}</span></div>
                <div className="flex justify-between"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
                <Separator />
                <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-primary">${total.toFixed(2)}</span></div>
              </div>
              <Separator />
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">Secured with PayPal</span>
              </div>
              
              {/* PayPal Standard Button */}
              <PayPalStandardButton
                shippingInfo={allFieldsFilled ? shippingInfo : null}
                onError={(error) => setPaymentError(error.message || 'Payment failed. Please try again.')}
              />

              {/* PayPal.me Button */}
              <PayPalMeButton
                shippingInfo={allFieldsFilled ? shippingInfo : null}
                onError={(error) => setPaymentError(error.message || 'Payment failed. Please try again.')}
              />
              
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-2">
                <Lock className="h-3 w-3" /><span>Powered by PayPal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
