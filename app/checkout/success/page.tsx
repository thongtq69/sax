import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

export default function CheckoutSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
        <h1 className="mb-2 text-3xl font-bold">Order Confirmed!</h1>
        <p className="mb-2 text-gray-600">
          Thank you for your order. Order #12345 has been confirmed.
        </p>
        <p className="mb-8 text-sm text-gray-500">
          We'll send you a shipping confirmation email once your order ships.
          Expected delivery: 2-3 business days.
        </p>
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/account/orders">Track Order</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

