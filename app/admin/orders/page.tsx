'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, ShoppingCart, Package, Truck, CheckCircle, Loader2, Eye, RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
}

interface Order {
  id: string
  status: string
  total: number
  shippingAddress: {
    name?: string
    email?: string
    firstName?: string
    lastName?: string
    address1?: string
    address2?: string
    city?: string
    state?: string
    zip?: string
    country?: string
    countryCode?: string
    phone?: string
    addressStatus?: string // confirmed/unconfirmed from PayPal
  } | null
  billingAddress: {
    // PayPal Payer Info
    payerId?: string
    payerEmail?: string
    payerStatus?: string // verified/unverified
    firstName?: string
    lastName?: string
    // Payment Details
    txnId?: string
    paymentStatus?: string
    mcGross?: string
    mcFee?: string
    mcShipping?: string
    tax?: string
    currency?: string
    paymentDate?: string
    // Legacy fields
    paypalOrderId?: string
    paypalPayerId?: string
    paypalEmail?: string
  } | null
  items: OrderItem[]
  createdAt: string
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (searchTerm) params.set('search', searchTerm)

      const response = await fetch(`/api/orders?${params}`)
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  const handleSearch = () => {
    fetchOrders()
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId)
    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      })

      if (response.ok) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ))
      }
    } catch (error) {
      console.error('Error updating order:', error)
    } finally {
      setUpdating(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'delivered': return 'bg-emerald-100 text-emerald-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-2">View and manage customer orders</p>
        </div>
        <Button onClick={fetchOrders} variant="outline" className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by order ID, email, or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-gray-600 flex items-center">
            Total: {orders.length} orders
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-500">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No orders found</p>
            <p className="text-sm text-gray-400 mt-2">Orders will appear here once customers place them</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      #{order.id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.shippingAddress?.name || 
                         `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim() ||
                         (order.billingAddress?.firstName && order.billingAddress?.lastName 
                           ? `${order.billingAddress?.firstName} ${order.billingAddress?.lastName}`
                           : 'N/A')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.shippingAddress?.email || order.billingAddress?.payerEmail || 'No email'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${order.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Select
                        value={order.status}
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                        disabled={updating === order.id}
                      >
                        <SelectTrigger className={`w-32 h-8 text-xs font-medium ${getStatusColor(order.status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                        className="gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details #{selectedOrder?.id.slice(-8)}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Status & Date */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 text-sm font-medium rounded ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status.toUpperCase()}
                </span>
                <span className="text-sm text-gray-500">
                  {formatDate(selectedOrder.createdAt)}
                </span>
              </div>

              {/* Customer Info from PayPal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Shipping Address */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Shipping Address
                    {selectedOrder.shippingAddress?.addressStatus && (
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        selectedOrder.shippingAddress.addressStatus === 'confirmed' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {selectedOrder.shippingAddress.addressStatus}
                      </span>
                    )}
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-1">
                    {selectedOrder.shippingAddress ? (
                      <>
                        <p className="font-medium text-gray-900">
                          {selectedOrder.shippingAddress.name || 
                           `${selectedOrder.shippingAddress.firstName || ''} ${selectedOrder.shippingAddress.lastName || ''}`.trim() ||
                           'N/A'}
                        </p>
                        {selectedOrder.shippingAddress.address1 && (
                          <p className="text-gray-600">{selectedOrder.shippingAddress.address1}</p>
                        )}
                        {selectedOrder.shippingAddress.address2 && (
                          <p className="text-gray-600">{selectedOrder.shippingAddress.address2}</p>
                        )}
                        {(selectedOrder.shippingAddress.city || selectedOrder.shippingAddress.state || selectedOrder.shippingAddress.zip) && (
                          <p className="text-gray-600">
                            {[
                              selectedOrder.shippingAddress.city,
                              selectedOrder.shippingAddress.state,
                              selectedOrder.shippingAddress.zip
                            ].filter(Boolean).join(', ')}
                          </p>
                        )}
                        {selectedOrder.shippingAddress.country && (
                          <p className="text-gray-600">{selectedOrder.shippingAddress.country}</p>
                        )}
                        <div className="pt-2 border-t mt-2 space-y-1">
                          {selectedOrder.shippingAddress.email && (
                            <p className="text-gray-700">
                              📧 {selectedOrder.shippingAddress.email}
                            </p>
                          )}
                          {selectedOrder.shippingAddress.phone && (
                            <p className="text-gray-700">
                              📞 {selectedOrder.shippingAddress.phone}
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-400 italic">No shipping address</p>
                    )}
                  </div>
                </div>

                {/* Payment Info from PayPal */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Payment Info
                    {selectedOrder.billingAddress?.payerStatus && (
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        selectedOrder.billingAddress.payerStatus === 'verified' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {selectedOrder.billingAddress.payerStatus}
                      </span>
                    )}
                  </h4>
                  <div className="bg-blue-50 p-4 rounded-lg text-sm space-y-2">
                    {selectedOrder.billingAddress ? (
                      <>
                        {/* Transaction ID */}
                        {selectedOrder.billingAddress.txnId && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Transaction ID:</span>
                            <span className="font-mono text-xs">{selectedOrder.billingAddress.txnId}</span>
                          </div>
                        )}
                        
                        {/* PayPal Email */}
                        {(selectedOrder.billingAddress.payerEmail || selectedOrder.billingAddress.paypalEmail) && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">PayPal Email:</span>
                            <span className="text-blue-600">
                              {selectedOrder.billingAddress.payerEmail || selectedOrder.billingAddress.paypalEmail}
                            </span>
                          </div>
                        )}
                        
                        {/* Payer Name */}
                        {(selectedOrder.billingAddress.firstName || selectedOrder.billingAddress.lastName) && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payer Name:</span>
                            <span>
                              {`${selectedOrder.billingAddress.firstName || ''} ${selectedOrder.billingAddress.lastName || ''}`.trim()}
                            </span>
                          </div>
                        )}
                        
                        {/* Payment Status */}
                        {selectedOrder.billingAddress.paymentStatus && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment Status:</span>
                            <span className={`font-medium ${
                              selectedOrder.billingAddress.paymentStatus === 'Completed' 
                                ? 'text-green-600' 
                                : 'text-yellow-600'
                            }`}>
                              {selectedOrder.billingAddress.paymentStatus}
                            </span>
                          </div>
                        )}
                        
                        {/* Amount Details */}
                        <div className="pt-2 border-t border-blue-200 mt-2 space-y-1">
                          {selectedOrder.billingAddress.mcGross && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Gross Amount:</span>
                              <span className="font-medium">${selectedOrder.billingAddress.mcGross}</span>
                            </div>
                          )}
                          {selectedOrder.billingAddress.mcShipping && parseFloat(selectedOrder.billingAddress.mcShipping) > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Shipping:</span>
                              <span>${selectedOrder.billingAddress.mcShipping}</span>
                            </div>
                          )}
                          {selectedOrder.billingAddress.tax && parseFloat(selectedOrder.billingAddress.tax) > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tax:</span>
                              <span>${selectedOrder.billingAddress.tax}</span>
                            </div>
                          )}
                          {selectedOrder.billingAddress.mcFee && (
                            <div className="flex justify-between text-red-600">
                              <span>PayPal Fee:</span>
                              <span>-${selectedOrder.billingAddress.mcFee}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Payment Date */}
                        {selectedOrder.billingAddress.paymentDate && (
                          <div className="text-xs text-gray-500 pt-2">
                            Paid: {formatDate(selectedOrder.billingAddress.paymentDate)}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-400 italic">No payment info</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Order Items ({selectedOrder.items.length})
                </h4>
                <div className="border rounded-lg divide-y">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="p-3 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-mono text-gray-500">Product ID: {item.productId.slice(-8)}</p>
                        <p className="text-sm">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">${(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">${selectedOrder.total.toLocaleString()}</span>
                </div>
                
                {/* Net Amount (Actual Received) */}
                {selectedOrder.billingAddress?.mcGross && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-800">💰 Net Amount (Actual Received)</span>
                      <span className="text-xl font-bold text-green-600">
                        ${(
                          parseFloat(selectedOrder.billingAddress.mcGross || '0') -
                          parseFloat(selectedOrder.billingAddress.mcFee || '0') -
                          parseFloat(selectedOrder.billingAddress.mcShipping || '0')
                        ).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      = ${selectedOrder.billingAddress.mcGross} (Gross) 
                      - ${selectedOrder.billingAddress.mcFee || '0'} (PayPal Fee) 
                      - ${selectedOrder.billingAddress.mcShipping || '0'} (Shipping)
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
