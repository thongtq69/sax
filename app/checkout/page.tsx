'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/store/cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ChevronLeft, ChevronRight, ShieldCheck, Lock, CreditCard } from 'lucide-react'
import { PayPalProvider } from '@/components/checkout/PayPalProvider'
import { PayPalButton } from '@/components/checkout/PayPalButton'

type Step = 1 | 2 | 3

export default function CheckoutPage() {
  const [step, setStep] = useState<Step>(1)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const items = useCartStore((state) => state.items)
  const subtotal = useCartStore((state) => state.getSubtotal())
  const shipping = subtotal > 500 ? 0 : 25
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const [shippingInfo, setShippingInfo] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    phone: '',
  })

  const isShippingValid = 
    shippingInfo.email &&
    shippingInfo.firstName &&
    shippingInfo.lastName &&
    shippingInfo.address1 &&
    shippingInfo.city &&
    shippingInfo.state &&
    shippingInfo.zip &&
    shippingInfo.phone

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold">Your cart is empty</h1>
          <p className="mb-6 text-muted-foreground">Add some items to your cart to checkout</p>
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <PayPalProvider>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl md:text-4xl font-bold text-secondary">Checkout</h1>

        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-center space-x-4">
          <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
            <div className={`flex h-10 w-10 items-center justify-center border-2 ${
              step >= 1 ? 'border-primary bg-primary text-white' : 'border-gray-300'
            }`}>
              1
            </div>
            <span className="ml-2 hidden font-medium sm:inline">Shipping</span>
          </div>
          <div className={`h-1 w-16 ${step >= 2 ? 'bg-primary' : 'bg-gray-300'}`} />
          <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
            <div className={`flex h-10 w-10 items-center justify-center border-2 ${
              step >= 2 ? 'border-primary bg-primary text-white' : 'border-gray-300'
            }`}>
              2
            </div>
            <span className="ml-2 hidden font-medium sm:inline">Payment</span>
          </div>
          <div className={`h-1 w-16 ${step >= 3 ? 'bg-primary' : 'bg-gray-300'}`} />
          <div className={`flex items-center ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>
            <div className={`flex h-10 w-10 items-center justify-center border-2 ${
              step >= 3 ? 'border-primary bg-primary text-white' : 'border-gray-300'
            }`}>
              3
            </div>
            <span className="ml-2 hidden font-medium sm:inline">Review</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Form */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>Shipping Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Email Address *"
                    value={shippingInfo.email}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="First Name *"
                      value={shippingInfo.firstName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                    />
                    <Input
                      placeholder="Last Name *"
                      value={shippingInfo.lastName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                    />
                  </div>
                  <Input
                    placeholder="Address Line 1 *"
                    value={shippingInfo.address1}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address1: e.target.value })}
                  />
                  <Input
                    placeholder="Address Line 2 (Optional)"
                    value={shippingInfo.address2}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address2: e.target.value })}
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      placeholder="City *"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                    />
                    <Input
                      placeholder="State *"
                      value={shippingInfo.state}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                    />
                    <Input
                      placeholder="ZIP Code *"
                      value={shippingInfo.zip}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, zip: e.target.value })}
                    />
                  </div>
                  <Input
                    placeholder="Phone Number *"
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                  />
                  <Button
                    className="w-full h-12 text-base"
                    onClick={() => setStep(2)}
                    disabled={!isShippingValid}
                  >
                    Continue to Payment
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Payment Method</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Security Badge */}
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-700 text-sm">
                    <ShieldCheck className="h-5 w-5" />
                    <span>Your payment is secured with PayPal's buyer protection</span>
                  </div>

                  {/* PayPal Button */}
                  <div className="py-4">
                    <p className="text-sm text-muted-foreground mb-4 text-center">
                      Click the button below to pay securely with PayPal
                    </p>
                    <PayPalButton
                      shippingInfo={shippingInfo}
                      onSuccess={(details) => {
                        console.log('Payment successful:', details)
                      }}
                      onError={(error) => {
                        setPaymentError('Payment failed. Please try again.')
                        console.error('Payment error:', error)
                      }}
                    />
                    {paymentError && (
                      <p className="mt-4 text-center text-red-500 text-sm">{paymentError}</p>
                    )}
                  </div>

                  <Separator />

                  {/* Back Button */}
                  <Button variant="outline" onClick={() => setStep(1)} className="w-full">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Shipping
                  </Button>

                  {/* Sandbox Notice */}
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 text-xs">
                    <p className="font-semibold mb-1">🧪 Sandbox Mode</p>
                    <p>This is a test environment. Use PayPal sandbox credentials to test payments.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Shipping To:</h3>
                    <p className="text-gray-600">
                      {shippingInfo.firstName} {shippingInfo.lastName}<br />
                      {shippingInfo.address1}
                      {shippingInfo.address2 && <><br />{shippingInfo.address2}</>}<br />
                      {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip}
                    </p>
                  </div>
                  <Separator />
                  <div className="flex space-x-4">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-20 lg:h-fit">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden border bg-gray-50">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                        <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ${item.price.toLocaleString()} × {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-semibold">
                        ${(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Security Info */}
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                  <Lock className="h-3 w-3" />
                  <span>Secure checkout powered by PayPal</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PayPalProvider>
  )
}
