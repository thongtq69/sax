import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ShoppingBag, Package, Truck, CheckCircle } from 'lucide-react'

export default async function OrdersPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-6">
              <ShoppingBag className="h-6 w-6 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            </div>
            
            {/* Empty State */}
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-6">
                When you place your first order, it will appear here.
              </p>
              <a 
                href="/shop" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Start Shopping
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'My Orders - James Sax Corner',
  description: 'View your order history and track shipments',
}