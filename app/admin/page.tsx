'use client'

import { useEffect, useState } from 'react'
import { Package, FileText, ShoppingCart, DollarSign, TrendingUp, Users } from 'lucide-react'
import { products } from '@/lib/data'
import { blogPosts } from '@/data/blogPosts'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalBlogPosts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
    recentOrders: [] as any[],
  })

  useEffect(() => {
    // Calculate stats
    const lowStock = products.filter(p => (p.stock || 0) < 5 && p.inStock).length
    const revenue = 0 // Placeholder - would come from orders data
    
    setStats({
      totalProducts: products.length,
      totalBlogPosts: blogPosts.length,
      totalOrders: 0, // Placeholder
      totalRevenue: revenue,
      lowStockProducts: lowStock,
      recentOrders: [],
    })
  }, [])

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      href: '/admin/products',
    },
    {
      title: 'Blog Posts',
      value: stats.totalBlogPosts,
      icon: FileText,
      color: 'bg-green-500',
      href: '/admin/blog',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-purple-500',
      href: '/admin/orders',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-orange-500',
      href: '/admin/orders',
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockProducts,
      icon: TrendingUp,
      color: 'bg-red-500',
      href: '/admin/products?filter=low-stock',
    },
    {
      title: 'Active Users',
      value: 0,
      icon: Users,
      color: 'bg-indigo-500',
      href: '/admin/users',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to the admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.href}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-4 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/products/new">
            <Button className="w-full">Add New Product</Button>
          </Link>
          <Link href="/admin/blog/new">
            <Button className="w-full" variant="outline">Create Blog Post</Button>
          </Link>
          <Link href="/admin/categories">
            <Button className="w-full" variant="outline">Manage Categories</Button>
          </Link>
          <Link href="/admin/promos">
            <Button className="w-full" variant="outline">Manage Promos</Button>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center py-8 text-gray-500">
          <p>No recent activity to display</p>
        </div>
      </div>
    </div>
  )
}

