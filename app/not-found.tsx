import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        <h1 className="mb-2 text-4xl font-bold">404</h1>
        <h2 className="mb-4 text-2xl font-semibold">Page Not Found</h2>
        <p className="mb-8 text-gray-600">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="space-x-4">
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/shop">Browse Products</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

