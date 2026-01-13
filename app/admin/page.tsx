'use client'

import { useEffect, useState } from 'react'
import {
  Package, FileText, ShoppingCart, TrendingUp, Users, Plus,
  ArrowUpRight, ArrowDownRight, Eye, Star, Image as ImageIcon,
  HelpCircle, MessageSquare, Settings, Home, Layers, ListOrdered,
  ClipboardList, Tag
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface DashboardStats {
  banners: number
  faqs: number
  testimonials: number
  products: number
  orders: number
  users: number
  blogPosts: number
  reviews: number
  pendingOrders: number
  totalRevenue: number
}

interface RecentOrder {
  id: string
  orderNumber?: string
  status: string
  total: number
  createdAt: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
          setRecentOrders(data.recentOrders || [])
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statCards = [
    {
      title: 'Products',
      value: stats?.products || 0,
      icon: Package,
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-600',
      href: '/admin/products',
    },
    {
      title: 'Orders',
      value: stats?.orders || 0,
      icon: ShoppingCart,
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-600',
      href: '/admin/orders',
      badge: stats?.pendingOrders ? `${stats.pendingOrders} pending` : undefined,
    },
    {
      title: 'Blog Posts',
      value: stats?.blogPosts || 0,
      icon: FileText,
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-600',
      href: '/admin/blog',
    },
    {
      title: 'Reviews',
      value: stats?.reviews || 0,
      icon: Star,
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-600',
      href: '/admin/reviews',
    },
  ]

  const cmsCards = [
    {
      title: 'Banners',
      value: stats?.banners || 0,
      icon: ImageIcon,
      bgColor: 'bg-pink-500/10',
      textColor: 'text-pink-600',
      href: '/admin/banners',
      description: 'Homepage banners',
    },
    {
      title: 'FAQs',
      value: stats?.faqs || 0,
      icon: HelpCircle,
      bgColor: 'bg-cyan-500/10',
      textColor: 'text-cyan-600',
      href: '/admin/faqs',
      description: 'Frequently asked questions',
    },
    {
      title: 'Testimonials',
      value: stats?.testimonials || 0,
      icon: MessageSquare,
      bgColor: 'bg-indigo-500/10',
      textColor: 'text-indigo-600',
      href: '/admin/testimonials',
      description: 'Customer reviews',
    },
    {
      title: 'Users',
      value: stats?.users || 0,
      icon: Users,
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-600',
      href: '/admin/users',
      description: 'Registered users',
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 md:p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Welcome back, Admin! 👋</h1>
            <p className="text-white/80 mt-2">Manage your website content from here.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/products">
              <Button variant="secondary" className="bg-white text-primary hover:bg-white/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </Link>
            <Link href="/" target="_blank">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Eye className="h-4 w-4 mr-2" />
                View Store
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.href}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all duration-200 cursor-pointer group">
                <div className="flex items-start justify-between">
                  <div className={`${stat.bgColor} p-3 rounded-xl`}>
                    <Icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                  {stat.badge && (
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                      {stat.badge}
                    </span>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600 mt-1 group-hover:text-primary transition-colors">{stat.title}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* CMS Content Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Management</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {cmsCards.map((card) => {
            const Icon = card.icon
            return (
              <Link key={card.title} href={card.href}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all duration-200 cursor-pointer group h-full">
                  <div className={`${card.bgColor} p-3 rounded-xl w-fit`}>
                    <Icon className={`h-6 w-6 ${card.textColor}`} />
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-sm font-medium text-gray-900 mt-1 group-hover:text-primary transition-colors">{card.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Quick Actions - All Admin Functions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          <Link href="/admin/products">
            <Button className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-4" variant="outline">
              <Package className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">Products</span>
            </Button>
          </Link>
          <Link href="/admin/brands">
            <Button className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-4" variant="outline">
              <Tag className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">Brands</span>
            </Button>
          </Link>
          <Link href="/admin/featured-collections">
            <Button className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-4" variant="outline">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">Collections</span>
            </Button>
          </Link>
          <Link href="/admin/blog">
            <Button className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-4" variant="outline">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">Blog Posts</span>
            </Button>
          </Link>
          <Link href="/admin/categories">
            <Button className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-4" variant="outline">
              <Layers className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">Categories</span>
            </Button>
          </Link>
          <Link href="/admin/announcements">
            <Button className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-4" variant="outline">
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">Announcements</span>
            </Button>
          </Link>
          <Link href="/admin/faqs">
            <Button className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-4" variant="outline">
              <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">FAQs</span>
            </Button>
          </Link>
          <Link href="/admin/quick-faq">
            <Button className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-4" variant="outline">
              <ClipboardList className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">Quick FAQ</span>
            </Button>
          </Link>
          <Link href="/admin/inquiry-titles">
            <Button className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-4" variant="outline">
              <ListOrdered className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">Inquiry Titles</span>
            </Button>
          </Link>
          <Link href="/admin/inquiries">
            <Button className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-4" variant="outline">
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">Inquiries</span>
            </Button>
          </Link>
          <Link href="/admin/testimonials">
            <Button className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-4" variant="outline">
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">Testimonials</span>
            </Button>
          </Link>
          <Link href="/admin/reviews">
            <Button className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-4" variant="outline">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">Reviews</span>
            </Button>
          </Link>
          <Link href="/admin/content">
            <Button className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-4" variant="outline">
              <Home className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">Homepage</span>
            </Button>
          </Link>
          <Link href="/admin/banners">
            <Button className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-4" variant="outline">
              <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">Banners</span>
            </Button>
          </Link>
          <Link href="/admin/subscribers">
            <Button className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-4" variant="outline">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">Subscribers</span>
            </Button>
          </Link>
          <Link href="/admin/orders">
            <Button className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-4" variant="outline">
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">Orders</span>
            </Button>
          </Link>
          <Link href="/admin/shipping">
            <Button className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-4" variant="outline">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">Shipping</span>
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-4" variant="outline">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">Users</span>
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-4" variant="outline">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">Settings</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No orders yet</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">Order #{order.orderNumber || order.id.slice(-6)}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">${order.total.toLocaleString()}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                    }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Revenue Card */}
      {stats?.totalRevenue !== undefined && stats.totalRevenue > 0 && (
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100">Total Revenue</p>
              <p className="text-3xl font-bold mt-1">${stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white/20 p-4 rounded-xl">
              <TrendingUp className="h-8 w-8" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
