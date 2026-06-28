'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store/cart'
import { useCartAvailability } from '@/hooks/use-cart-availability'
import { getProductUrl } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Loader2, X, Plus, Minus, ShoppingBag, Zap } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function CartPage() {
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const subtotal = useCartStore((state) => state.getSubtotal())
  const {
    resultByItemId,
    hasUnavailable,
    isValidating,
    error: availabilityError,
  } = useCartAvailability(items)
  const shipping = subtotal > 500 ? 0 : 25
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + shipping + tax

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md text-center">
          <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <h1 className="mb-2 text-2xl font-bold">Your cart is empty</h1>
          <p className="mb-6 text-gray-600">
            Start shopping to add items to your cart
          </p>
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">Shopping Cart</h1>

      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {(hasUnavailable || availabilityError) && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="flex gap-3 p-4 text-amber-800">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Please review your cart</p>
                  <p className="text-sm">
                    {availabilityError || 'Some instruments are no longer available. Remove them before checkout.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          {items.map((item) => (
            (() => {
              const availability = resultByItemId.get(item.id)
              const unavailable = availability && !availability.available
              return (
            <Card key={item.id} className={unavailable ? 'border-red-200 bg-red-50/30' : ''}>
              <CardContent className="flex items-center space-x-3 md:space-x-4 p-3 md:p-6">
                <div className="relative h-20 w-20 md:h-24 md:w-24 flex-shrink-0 overflow-hidden rounded-md border">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/saxophone-icon.svg' }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        href={getProductUrl(item.sku, item.slug, (item as any).serialNumber || (item as any).specs?.SN)}
                        className="font-medium hover:text-primary"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-500">Serial: {item.sku}</p>
                      {availability && (
                        <p className={`mt-1 text-sm font-medium ${availability.available ? 'text-green-600' : 'text-red-600'}`}>
                          {availability.message}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={unavailable}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-lg font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
              )
            })()
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-20 lg:h-fit">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="pt-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      placeholder="Promo code"
                      className="h-10 text-xs"
                    />
                    <Zap className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <Button variant="outline" className="h-10 px-4 text-xs font-bold border-zinc-200">
                    APPLY
                  </Button>
                </div>
                <p className="mt-2 text-[10px] text-zinc-500 font-medium">
                  Try <span className="text-[#D4AF37] font-bold">WELCOME-PREMIUM</span> for $200 off!
                </p>
              </div>

              <Button
                className="w-full"
                size="lg"
                disabled={isValidating || hasUnavailable || Boolean(availabilityError)}
                onClick={() => {
                  if (isValidating || hasUnavailable || availabilityError) return
                  router.push('/checkout')
                }}
              >
                {isValidating ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking availability...
                  </span>
                ) : hasUnavailable ? (
                  'Remove unavailable items'
                ) : (
                  'Proceed to Checkout'
                )}
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/shop">Continue Shopping</Link>
              </Button>

              <div className="pt-4 text-center text-xs text-gray-500">
                <div className="flex items-center justify-center space-x-1">
                  <span>🔒</span>
                  <span>Secure checkout</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
