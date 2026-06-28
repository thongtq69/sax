'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  Users,
  Mail,
  Shield,
  ShoppingBag,
  Heart,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
  Eye,
  MapPin,
  Package,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// Format date helper
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface User {
  id: string
  name: string | null
  email: string
  emailVerified: string | null
  image: string | null
  role: string
  createdAt: string
  _count: {
    orders: number
    wishlist: number
  }
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface UserDetail {
  user: User & {
    updatedAt: string
  }
  addresses: Array<{
    id: string
    firstName: string
    lastName: string
    address1: string
    address2?: string | null
    city: string
    state: string
    zip: string
    country: string
    phone: string
    isDefault: boolean
  }>
  wishlist: Array<{
    id: string
    productId: string
    createdAt: string
    product: {
      id: string
      name: string
      sku: string
      slug: string
      images: string[]
      price: number
      stockStatus: string | null
      inStock: boolean | null
      isVisible: boolean | null
      status: string | null
    } | null
  }>
  orders: Array<{
    id: string
    orderNumber: string | null
    status: string
    total: number
    discount?: number | null
    couponCode?: string | null
    shippingAddress?: any
    createdAt: string
    items: Array<{
      id: string
      productId: string
      quantity: number
      price: number
      product: {
        id: string
        name: string
        sku: string
        slug: string
      } | null
    }>
  }>
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedDetail, setSelectedDetail] = useState<UserDetail | null>(null)
  const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null)

  const fetchUsers = async (page: number = 1, search: string = '') => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })
      if (search) {
        params.set('search', search)
      }

      const response = await fetch(`/api/admin/users?${params}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(currentPage, searchTerm)
  }, [currentPage])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1)
      fetchUsers(1, searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user "${userEmail}"? This action cannot be undone.`)) {
      return
    }

    setDeletingId(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId))
        if (pagination) {
          setPagination({ ...pagination, total: pagination.total - 1 })
        }
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
    } finally {
      setDeletingId(null)
    }
  }

  const handleViewUser = async (userId: string) => {
    setDetailLoadingId(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}`)
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load user detail')
      }
      const data = await response.json()
      setSelectedDetail(data)
    } catch (error: any) {
      alert(error.message || 'Failed to load user detail')
    } finally {
      setDetailLoadingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-2">
            Manage user accounts {pagination && `(${pagination.total} total users)`}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No users found</p>
            <p className="text-sm text-gray-400 mt-2">
              {searchTerm ? 'Try a different search term' : 'User accounts will appear here once they register'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {user.image ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={user.image}
                                alt={user.name || 'User'}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-primary font-medium">
                                  {(user.name || user.email)[0].toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || 'No name'}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.emailVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <XCircle className="h-3 w-3" />
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <Shield className="h-3 w-3" />
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1" title="Orders">
                            <ShoppingBag className="h-4 w-4 text-gray-400" />
                            {user._count.orders}
                          </span>
                          <span className="flex items-center gap-1" title="Wishlist items">
                            <Heart className="h-4 w-4 text-gray-400" />
                            {user._count.wishlist}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewUser(user.id)}
                          disabled={detailLoadingId === user.id}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          title="View user details"
                        >
                          {detailLoadingId === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          disabled={deletingId === user.id || user.role === 'admin'}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          title={user.role === 'admin' ? 'Cannot delete admin users' : 'Delete user'}
                        >
                          {deletingId === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} users
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => p - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={currentPage >= pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={!!selectedDetail} onOpenChange={() => setSelectedDetail(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>

          {selectedDetail && (
            <div className="space-y-6">
              <section className="rounded-lg border bg-gray-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedDetail.user.name || 'No name'}
                    </h2>
                    <p className="text-sm text-gray-600">{selectedDetail.user.email}</p>
                    <p className="text-xs text-gray-500">
                      Joined {formatDate(selectedDetail.user.createdAt)} · Role: {selectedDetail.user.role}
                    </p>
                  </div>
                  <span className={`inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    selectedDetail.user.emailVerified
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedDetail.user.emailVerified ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {selectedDetail.user.emailVerified ? 'Verified email' : 'Unverified email'}
                  </span>
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-gray-900">Addresses</h3>
                </div>
                {selectedDetail.addresses.length === 0 ? (
                  <p className="rounded-lg border p-4 text-sm text-gray-500">No saved addresses.</p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {selectedDetail.addresses.map((address) => (
                      <div key={address.id} className="rounded-lg border p-4 text-sm">
                        <div className="mb-1 flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{address.firstName} {address.lastName}</p>
                          {address.isDefault && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">Default</span>
                          )}
                        </div>
                        <p>{address.address1}{address.address2 ? `, ${address.address2}` : ''}</p>
                        <p>{address.city}, {address.state} {address.zip}</p>
                        <p>{address.country}</p>
                        <p className="mt-1 text-gray-600">Phone: {address.phone}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <div className="mb-3 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-gray-900">Wishlist</h3>
                </div>
                {selectedDetail.wishlist.length === 0 ? (
                  <p className="rounded-lg border p-4 text-sm text-gray-500">No wishlist products.</p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {selectedDetail.wishlist.map((item) => (
                      <div key={item.id} className="rounded-lg border p-4 text-sm">
                        <p className="font-semibold text-gray-900">{item.product?.name || 'Deleted product'}</p>
                        {item.product && (
                          <>
                            <p className="text-gray-600">${item.product.price.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">
                              Status: {item.product.stockStatus || (item.product.inStock ? 'in-stock' : 'sold-out')}
                              {item.product.isVisible === false ? ' · hidden' : ''}
                              {item.product.status === 'draft' ? ' · draft' : ''}
                            </p>
                          </>
                        )}
                        <p className="mt-1 text-xs text-gray-400">Added {formatDate(item.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <div className="mb-3 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-gray-900">Orders</h3>
                </div>
                {selectedDetail.orders.length === 0 ? (
                  <p className="rounded-lg border p-4 text-sm text-gray-500">No orders yet.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedDetail.orders.map((order) => (
                      <div key={order.id} className="rounded-lg border p-4">
                        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">Order {order.orderNumber || order.id}</p>
                            <p className="text-xs text-gray-500">{formatDate(order.createdAt)} · {order.status}</p>
                          </div>
                          <p className="font-bold text-primary">${order.total.toLocaleString()}</p>
                        </div>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between gap-3 rounded bg-gray-50 px-3 py-2 text-sm">
                              <span className="min-w-0 truncate">
                                {item.product?.name || 'Deleted product'} x {item.quantity}
                              </span>
                              <span className="font-medium">${(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                        {order.shippingAddress && (
                          <div className="mt-3 rounded bg-blue-50 p-3 text-xs text-blue-900">
                            <p className="font-semibold">Shipping address</p>
                            <p>
                              {order.shippingAddress.firstName} {order.shippingAddress.lastName}, {order.shippingAddress.address1}
                              {order.shippingAddress.address2 ? `, ${order.shippingAddress.address2}` : ''}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}, {order.shippingAddress.country}
                            </p>
                            {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
