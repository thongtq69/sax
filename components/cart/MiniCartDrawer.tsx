'use client'

import Link from 'next/link'
import Image from 'next/image'
import { X, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface MiniCartDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MiniCartDrawer({ open, onOpenChange }: MiniCartDrawerProps) {
  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const subtotal = useCartStore((state) => state.getSubtotal())

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
          <SheetDescription>
            {items.length > 0
              ? `${items.length} item${items.length > 1 ? 's' : ''} in your cart`
              : 'Your cart is empty'}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center">
            <ShoppingBag className="mb-4 h-16 w-16 text-gray-300" />
            <p className="mb-2 text-lg font-medium">No products in cart</p>
            <p className="mb-6 text-sm text-gray-500">
              Start shopping to add items to your cart
            </p>
            <Button asChild onClick={() => onOpenChange(false)}>
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto py-4">
              {items.map((item) => (
                <div key={item.id} className="flex space-x-4">
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <Link
                        href={`/product/${item.slug}`}
                        className="font-medium hover:text-primary"
                      >
                        {item.name}
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeItem(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      ${item.price.toFixed(2)} each
                    </div>
                    <div className="mt-2 flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        -
                      </Button>
                      <span className="w-8 text-center text-sm">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="space-y-2">
                <Button className="w-full" asChild>
                  <Link href="/cart" onClick={() => onOpenChange(false)}>
                    View Cart
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/checkout" onClick={() => onOpenChange(false)}>
                    Checkout
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

