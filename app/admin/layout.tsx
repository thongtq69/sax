'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Package,
  FileText,
  FolderTree,
  Megaphone,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  Search,
} from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Check authentication (simple localStorage check for demo)
    const auth = localStorage.getItem('admin_authenticated')
    if (auth === 'true') {
      setIsAuthenticated(true)
    } else if (pathname !== '/admin/login') {
      router.push('/admin/login')
    }
    setIsLoading(false)
  }, [pathname, router])

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated')
    router.push('/admin/login')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  if (!isAuthenticated) {
    return null
  }

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/blog', label: 'Blog Posts', icon: FileText },
    { href: '/admin/categories', label: 'Categories', icon: FolderTree },
    { href: '/admin/promos', label: 'Promo Banners', icon: Megaphone },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  const getCurrentPageTitle = () => {
    const item = menuItems.find(item => 
      item.exact ? pathname === item.href : pathname.startsWith(item.href) && item.href !== '/admin'
    )
    return item?.label || 'Dashboard'
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50
            ${sidebarCollapsed ? 'w-20' : 'w-64'} h-screen
            bg-gradient-to-b from-gray-900 to-gray-800 text-white
            transform transition-all duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            flex flex-col
          `}
        >
          {/* Logo */}
          <div className="p-5 border-b border-white/10">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h1 className="text-lg font-bold">Sax Admin</h1>
                  <p className="text-xs text-gray-400">Management Panel</p>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = item.exact 
                ? pathname === item.href 
                : pathname.startsWith(item.href) && item.href !== '/admin'
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }
                  `}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="font-medium flex-1">{item.label}</span>
                      {isActive && <ChevronRight className="h-4 w-4" />}
                    </>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-white/10">
            {/* Collapse Toggle (desktop only) */}
            <Button
              variant="ghost"
              className="hidden lg:flex w-full justify-center text-gray-400 hover:text-white hover:bg-white/10 mb-2"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <ChevronRight className={`h-5 w-5 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
            </Button>
            
            {/* View Site Link */}
            <Link href="/" target="_blank">
              <Button
                variant="ghost"
                className={`w-full ${sidebarCollapsed ? 'justify-center' : 'justify-start'} text-gray-400 hover:text-white hover:bg-white/10 mb-2`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {!sidebarCollapsed && <span className="ml-3">View Site</span>}
              </Button>
            </Link>

            {/* Logout */}
            <Button
              variant="ghost"
              className={`w-full ${sidebarCollapsed ? 'justify-center' : 'justify-start'} text-red-400 hover:text-red-300 hover:bg-red-500/10`}
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              {!sidebarCollapsed && <span className="ml-3">Logout</span>}
            </Button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {/* Top Bar - Desktop */}
          <header className="hidden lg:flex bg-white border-b sticky top-0 z-30 h-16 items-center justify-between px-6 shadow-sm">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900">{getCurrentPageTitle()}</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search..." 
                  className="pl-10 w-64 bg-gray-50 border-gray-200"
                />
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-medium">
                A
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
