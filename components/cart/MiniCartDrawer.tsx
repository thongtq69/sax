'use client'

import Link from 'next/link'
import Image from 'next/image'
import { X, ShoppingBag, Trash2, Plus, Minus, Sparkles, ArrowRight, Package } from 'lucide-react'
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
import { useState } from 'react'
import { getProductUrl } from '@/lib/api'

interface MiniCartDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MiniCartDrawer({ open, onOpenChange }: MiniCartDrawerProps) {
  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const subtotal = useCartStore((state) => state.getSubtotal())
  const [removingId, setRemovingId] = useState<string | null>(null)

  const handleRemove = (id: string) => {
    setRemovingId(id)
    setTimeout(() => {
      removeItem(id)
      setRemovingId(null)
    }, 300)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg p-0 border-l-0 shadow-2xl">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-secondary via-secondary/95 to-secondary p-6 text-white">
          <SheetHeader className="text-left">
            <SheetTitle className="text-white flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-pulse-soft">
                <ShoppingBag className="h-5 w-5" />
              </div>
              Shopping Cart
            </SheetTitle>
            <SheetDescription className="text-white/80">
              {items.length > 0
                ? `${items.length} item${items.length > 1 ? 's' : ''} in your cart`
                : 'Your cart is empty'}
            </SheetDescription>
          </SheetHeader>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-6 animate-fade-in-up">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-6 animate-float">
              <ShoppingBag className="h-12 w-12 text-primary/50" />
            </div>
            <p className="mb-2 text-xl font-semibold text-secondary">Your cart is empty</p>
            <p className="mb-8 text-sm text-muted-foreground text-center max-w-xs">
              Discover our premium collection of saxophones and accessories
            </p>
            <Button
              size="lg"
              className="group bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300"
              asChild
              onClick={() => onOpenChange(false)}
            >
              <Link href="/shop" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Start Shopping
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex gap-4 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group animate-fade-in-up ${removingId === item.id ? 'opacity-0 scale-95 -translate-x-full' : ''
                    }`}
                  style={{
                    animationDelay: `${index * 0.05}s`,
                    transitionDuration: removingId === item.id ? '0.3s' : '0.3s'
                  }}
                >
                  {/* Image */}
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border bg-white">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -translate-x-full group-hover:translate-x-full" style={{ transitionDuration: '0.8s' }} />
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <Link
                        href={getProductUrl(item.sku, item.slug)}
                        onClick={() => onOpenChange(false)}
                        className="font-semibold text-secondary hover:text-primary transition-colors line-clamp-2 text-sm"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-1.5 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-all duration-300 hover:rotate-12 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-2">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-1 bg-gray-100 rounded-full p-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white hover:shadow transition-all duration-200 active:scale-90"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white hover:shadow transition-all duration-200 active:scale-90"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="font-bold text-primary">
                          ${(item.price * item.quantity).toLocaleString()}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-xs text-muted-foreground">
                            ${item.price.toLocaleString()} each
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t bg-gradient-to-b from-gray-50 to-white p-4 space-y-4">
              {/* Subtotal */}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-2xl font-bold text-secondary">
                  ${subtotal.toLocaleString()}
                </span>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Shipping calculated at checkout
              </p>

              <Separator />

              {/* Action buttons */}
              <div className="space-y-2">
                <Button
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 group"
                  asChild
                >
                  <Link href="/checkout" onClick={() => onOpenChange(false)} className="flex items-center justify-center gap-2">
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-11 border-2 hover:bg-secondary hover:text-white hover:border-secondary transition-all duration-300"
                  asChild
                >
                  <Link href="/cart" onClick={() => onOpenChange(false)}>
                    View Full Cart
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
