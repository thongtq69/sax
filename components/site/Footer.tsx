import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop" className="text-gray-600 hover:text-primary">
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  href="/financing"
                  className="text-gray-600 hover:text-primary"
                >
                  Financing
                </Link>
              </li>
              <li>
                <Link
                  href="/rentals"
                  className="text-gray-600 hover:text-primary"
                >
                  Rentals
                </Link>
              </li>
              <li>
                <Link
                  href="/locations"
                  className="text-gray-600 hover:text-primary"
                >
                  Locations
                </Link>
              </li>
              <li>
                <Link
                  href="/videos"
                  className="text-gray-600 hover:text-primary"
                >
                  Videos
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="mb-4 font-semibold">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/contact"
                  className="text-gray-600 hover:text-primary"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-primary">
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/repairs"
                  className="text-gray-600 hover:text-primary"
                >
                  Repairs
                </Link>
              </li>
              <li>
                <Link
                  href="/music-lessons"
                  className="text-gray-600 hover:text-primary"
                >
                  Music Lessons
                </Link>
              </li>
              <li>
                <Link
                  href="/why-us"
                  className="text-gray-600 hover:text-primary"
                >
                  Why Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/terms"
                  className="text-gray-600 hover:text-primary"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-600 hover:text-primary"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/prop65"
                  className="text-gray-600 hover:text-primary"
                >
                  Proposition 65 Warning
                </Link>
              </li>
              <li>
                <Link
                  href="/international-orders"
                  className="text-gray-600 hover:text-primary"
                >
                  International Orders
                </Link>
              </li>
              <li>
                <Link
                  href="/opt-out"
                  className="text-gray-600 hover:text-primary"
                >
                  Opt-out Preferences
                </Link>
              </li>
            </ul>
          </div>

          {/* Store Hours & Search */}
          <div>
            <h3 className="mb-4 font-semibold">Store Hours</h3>
            <div className="mb-6 space-y-1 text-sm text-gray-600">
              <p>Monday - Friday: 10:00 AM - 6:00 PM PST</p>
              <p>Saturday: 10:00 AM - 5:00 PM PST</p>
              <p>Sunday: Closed</p>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold">Search</h4>
              <div className="flex space-x-2">
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="flex-1"
                />
                <Button size="sm">Search</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Specialty Music Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

