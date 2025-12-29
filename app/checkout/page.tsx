'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/lib/store/cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Step = 1 | 2 | 3

export default function CheckoutPage() {
  const [step, setStep] = useState<Step>(1)
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

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardholderName: '',
    expiry: '',
    cvv: '',
  })

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md text-center">
          <h1 className="mb-2 text-2xl font-bold">Your cart is empty</h1>
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">Checkout</h1>

      {/* Progress Steps */}
      <div className="mb-8 flex items-center justify-center space-x-4">
        <div
          className={`flex items-center ${
            step >= 1 ? 'text-primary' : 'text-gray-400'
          }`}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
              step >= 1
                ? 'border-primary bg-primary text-white'
                : 'border-gray-300'
            }`}
          >
            1
          </div>
          <span className="ml-2 hidden font-medium sm:inline">Shipping</span>
        </div>
        <div className={`h-1 w-16 ${step >= 2 ? 'bg-primary' : 'bg-gray-300'}`} />
        <div
          className={`flex items-center ${
            step >= 2 ? 'text-primary' : 'text-gray-400'
          }`}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
              step >= 2
                ? 'border-primary bg-primary text-white'
                : 'border-gray-300'
            }`}
          >
            2
          </div>
          <span className="ml-2 hidden font-medium sm:inline">Payment</span>
        </div>
        <div className={`h-1 w-16 ${step >= 3 ? 'bg-primary' : 'bg-gray-300'}`} />
        <div
          className={`flex items-center ${
            step >= 3 ? 'text-primary' : 'text-gray-400'
          }`}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
              step >= 3
                ? 'border-primary bg-primary text-white'
                : 'border-gray-300'
            }`}
          >
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
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email Address *"
                  value={shippingInfo.email}
                  onChange={(e) =>
                    setShippingInfo({ ...shippingInfo, email: e.target.value })
                  }
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="First Name *"
                    value={shippingInfo.firstName}
                    onChange={(e) =>
                      setShippingInfo({
                        ...shippingInfo,
                        firstName: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Last Name *"
                    value={shippingInfo.lastName}
                    onChange={(e) =>
                      setShippingInfo({
                        ...shippingInfo,
                        lastName: e.target.value,
                      })
                    }
                  />
                </div>
                <Input
                  placeholder="Address Line 1 *"
                  value={shippingInfo.address1}
                  onChange={(e) =>
                    setShippingInfo({
                      ...shippingInfo,
                      address1: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Address Line 2"
                  value={shippingInfo.address2}
                  onChange={(e) =>
                    setShippingInfo({
                      ...shippingInfo,
                      address2: e.target.value,
                    })
                  }
                />
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    placeholder="City *"
                    value={shippingInfo.city}
                    onChange={(e) =>
                      setShippingInfo({
                        ...shippingInfo,
                        city: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="State *"
                    value={shippingInfo.state}
                    onChange={(e) =>
                      setShippingInfo({
                        ...shippingInfo,
                        state: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="ZIP *"
                    value={shippingInfo.zip}
                    onChange={(e) =>
                      setShippingInfo({
                        ...shippingInfo,
                        zip: e.target.value,
                      })
                    }
                  />
                </div>
                <Input
                  placeholder="Phone *"
                  value={shippingInfo.phone}
                  onChange={(e) =>
                    setShippingInfo({
                      ...shippingInfo,
                      phone: e.target.value,
                    })
                  }
                />
                <Button
                  className="w-full"
                  onClick={() => setStep(2)}
                  disabled={
                    !shippingInfo.email ||
                    !shippingInfo.firstName ||
                    !shippingInfo.lastName ||
                    !shippingInfo.address1 ||
                    !shippingInfo.city ||
                    !shippingInfo.state ||
                    !shippingInfo.zip ||
                    !shippingInfo.phone
                  }
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
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Card Number *"
                  value={paymentInfo.cardNumber}
                  onChange={(e) =>
                    setPaymentInfo({
                      ...paymentInfo,
                      cardNumber: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Cardholder Name *"
                  value={paymentInfo.cardholderName}
                  onChange={(e) =>
                    setPaymentInfo({
                      ...paymentInfo,
                      cardholderName: e.target.value,
                    })
                  }
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="MM/YY *"
                    value={paymentInfo.expiry}
                    onChange={(e) =>
                      setPaymentInfo({
                        ...paymentInfo,
                        expiry: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="CVV *"
                    type="password"
                    value={paymentInfo.cvv}
                    onChange={(e) =>
                      setPaymentInfo({
                        ...paymentInfo,
                        cvv: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => setStep(3)}
                    disabled={
                      !paymentInfo.cardNumber ||
                      !paymentInfo.cardholderName ||
                      !paymentInfo.expiry ||
                      !paymentInfo.cvv
                    }
                  >
                    Review Order
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
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
                    {shippingInfo.firstName} {shippingInfo.lastName}
                    <br />
                    {shippingInfo.address1}
                    {shippingInfo.address2 && (
                      <>
                        <br />
                        {shippingInfo.address2}
                      </>
                    )}
                    <br />
                    {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip}
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold">Payment Method:</h3>
                  <p className="text-gray-600">
                    •••• •••• •••• {paymentInfo.cardNumber.slice(-4)}
                  </p>
                </div>
                <Separator />
                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button className="flex-1" asChild>
                    <Link href="/checkout/success">Place Order</Link>
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
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

