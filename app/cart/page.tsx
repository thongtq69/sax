'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/store/cart'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Plus, Minus, ShoppingBag } from 'lucide-react'

export default function CartPage() {
  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const subtotal = useCartStore((state) => state.getSubtotal())
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center space-x-4 p-6">
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        href={`/product/${item.slug}`}
                        className="font-medium hover:text-primary"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-500">SKU: {item.id}</p>
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

              {subtotal > 500 && (
                <div className="rounded-lg border bg-gray-50 p-4 text-sm">
                  <div className="font-semibold">Financing Available</div>
                  <div className="text-gray-600">
                    ${(total / 12).toFixed(2)}/month (12 mo @ 0% APR)
                  </div>
                </div>
              )}

              <Button className="w-full" size="lg" asChild>
                <Link href="/checkout">Proceed to Checkout</Link>
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

