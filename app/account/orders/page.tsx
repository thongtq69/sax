import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ShoppingBag, Package, Clock, Truck, CheckCircle, XCircle, CreditCard } from 'lucide-react'
import Link from 'next/link'

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending Payment', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-800', icon: CreditCard },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-800', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
}

export default async function OrdersPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  // Fetch user's orders
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          // We can't include product directly since it might be deleted
          // So we'll fetch product info separately
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Fetch product details for all order items
  const productIds = orders.flatMap(order => order.items.map(item => item.productId))
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, images: true, slug: true, sku: true }
  })
  const productMap = new Map(products.map(p => [p.id, p]))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-6">
              <ShoppingBag className="h-6 w-6 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
              <span className="ml-2 text-sm text-gray-500">({orders.length} orders)</span>
            </div>
            
            {orders.length === 0 ? (
              /* Empty State */
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-600 mb-6">
                  When you place your first order, it will appear here.
                </p>
                <Link 
                  href="/shop" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              /* Orders List */
              <div className="space-y-4">
                {orders.map((order) => {
                  const status = statusConfig[order.status] || statusConfig.pending
                  const StatusIcon = status.icon
                  const shippingAddr = order.shippingAddress as any

                  return (
                    <div key={order.id} className="border rounded-lg p-4 hover:border-blue-200 transition-colors">
                      {/* Order Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div>
                          <span className="font-semibold text-gray-900">
                            Order #{order.orderNumber || order.id.slice(-8).toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                          <StatusIcon className="h-4 w-4" />
                          {status.label}
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-2 mb-3">
                        {order.items.map((item) => {
                          const product = productMap.get(item.productId)
                          return (
                            <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                              {product?.images?.[0] ? (
                                <img 
                                  src={product.images[0]} 
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                {product ? (
                                  <Link 
                                    href={`/product/${product.sku}-${product.slug}`}
                                    className="font-medium text-gray-900 hover:text-blue-600 truncate block"
                                  >
                                    {product.name}
                                  </Link>
                                ) : (
                                  <span className="font-medium text-gray-500">Product no longer available</span>
                                )}
                                <span className="text-sm text-gray-500">
                                  Qty: {item.quantity} × ${item.price.toLocaleString()}
                                </span>
                              </div>
                              <span className="font-medium text-gray-900">
                                ${(item.quantity * item.price).toLocaleString()}
                              </span>
                            </div>
                          )
                        })}
                      </div>

                      {/* Order Footer */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t">
                        <div className="text-sm text-gray-500">
                          {shippingAddr?.city && (
                            <span>Ship to: {shippingAddr.city}, {shippingAddr.country}</span>
                          )}
                        </div>
                        <div className="text-lg font-bold text-primary">
                          Total: ${order.total.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
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
