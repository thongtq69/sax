'use client'

import { useEffect, useState } from 'react'
import { Package, FileText, ShoppingCart, DollarSign, TrendingUp, Users, Plus, ArrowUpRight, ArrowDownRight, Eye, Star } from 'lucide-react'
import { getProducts, getBlogPosts, getPromoBanners } from '@/lib/api'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalBlogPosts: 0,
    totalPromos: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
    recentProducts: [] as any[],
    recentPosts: [] as any[],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [productsResponse, blogResponse, promosResponse] = await Promise.all([
          getProducts({ limit: 1000 }),
          getBlogPosts({ limit: 1000 }),
          getPromoBanners(),
        ])
        
        const products = productsResponse.products
        const lowStock = products.filter((p: any) => (p.stock || 0) < 5 && p.inStock).length
        
        setStats({
          totalProducts: products.length,
          totalBlogPosts: blogResponse.posts.length,
          totalPromos: promosResponse.length,
          totalOrders: 0,
          totalRevenue: 0,
          lowStockProducts: lowStock,
          recentProducts: products.slice(0, 5),
          recentPosts: blogResponse.posts.slice(0, 3),
        })
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
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-600',
      href: '/admin/products',
      change: '+12%',
      trend: 'up',
    },
    {
      title: 'Blog Posts',
      value: stats.totalBlogPosts,
      icon: FileText,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-600',
      href: '/admin/blog',
      change: '+5%',
      trend: 'up',
    },
    {
      title: 'Promo Banners',
      value: stats.totalPromos,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-600',
      href: '/admin/promos',
      change: '0%',
      trend: 'neutral',
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockProducts,
      icon: Package,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-600',
      href: '/admin/products?filter=low-stock',
      change: stats.lowStockProducts > 0 ? 'Needs attention' : 'All good',
      trend: stats.lowStockProducts > 0 ? 'down' : 'up',
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
            <p className="text-white/80 mt-2">Here&apos;s what&apos;s happening with your store today.</p>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.href}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all duration-200 cursor-pointer group">
                <div className="flex items-start justify-between">
                  <div className={`${stat.bgColor} p-3 rounded-xl`}>
                    <Icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${
                    stat.trend === 'up' ? 'text-emerald-600' : 
                    stat.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {stat.trend === 'up' && <ArrowUpRight className="h-3 w-3" />}
                    {stat.trend === 'down' && <ArrowDownRight className="h-3 w-3" />}
                    {stat.change}
                  </div>
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

      {/* Quick Actions & Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/admin/products" className="block">
              <Button className="w-full justify-start" variant="outline">
                <Package className="h-4 w-4 mr-3" />
                Add New Product
              </Button>
            </Link>
            <Link href="/admin/blog" className="block">
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-3" />
                Create Blog Post
              </Button>
            </Link>
            <Link href="/admin/promos" className="block">
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp className="h-4 w-4 mr-3" />
                Add Promo Banner
              </Button>
            </Link>
            <Link href="/admin/categories" className="block">
              <Button className="w-full justify-start" variant="outline">
                <Package className="h-4 w-4 mr-3" />
                Manage Categories
              </Button>
            </Link>
            <Link href="/admin/reviews" className="block">
              <Button className="w-full justify-start" variant="outline">
                <Star className="h-4 w-4 mr-3" />
                Manage Reviews
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Products</h2>
            <Link href="/admin/products" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          {stats.recentProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No products yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentProducts.map((product: any) => (
                <div key={product.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {product.images?.[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">${product.price?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Blog Posts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Posts</h2>
            <Link href="/admin/blog" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          {stats.recentPosts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No posts yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentPosts.map((post: any) => (
                <div key={post.id} className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{post.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {post.author} • {new Date(post.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500">Database</p>
            <p className="text-sm font-medium text-gray-900 mt-1">MongoDB Atlas</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Image Storage</p>
            <p className="text-sm font-medium text-gray-900 mt-1">Cloudinary</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Framework</p>
            <p className="text-sm font-medium text-gray-900 mt-1">Next.js 14</p>
          </div>
        </div>
      </div>
    </div>
  )
}
