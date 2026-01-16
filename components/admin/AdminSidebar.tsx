'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Package,
  FileText,
  FolderTree,
  Megaphone,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  HelpCircle,
  MessageSquare,
  Home,
  Star,
  CircleHelp,
  MessageSquareText,
  Truck,
  Tag,
  Mail,
  MailCheck,
} from 'lucide-react'

interface AdminSidebarProps {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  onLogout: () => void
}

export const menuItems: { href: string; label: string; icon: any; exact?: boolean }[] = [
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/brands', label: 'Brands', icon: Tag },
  { href: '/admin/featured-collections', label: 'Featured Collections', icon: Star },
  { href: '/admin/blog', label: 'Blog Posts', icon: FileText },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/announcements', label: 'Announcement Bar', icon: Megaphone },
  { href: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
  { href: '/admin/quick-faq', label: 'Quick FAQ (Product)', icon: CircleHelp },
  { href: '/admin/inquiry-titles', label: 'Inquiry Titles', icon: MessageSquareText },
  { href: '/admin/testimonials', label: 'Testimonials & Reviews', icon: MessageSquare },
  { href: '/admin/content', label: 'Homepage Content', icon: Home },
  { href: '/admin/subscribers', label: 'Subscribers', icon: Mail },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/shipping', label: 'Shipping Zones', icon: Truck },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/settings', label: 'Site Settings', icon: Settings },
  { href: '/admin/test-email', label: 'Test Email', icon: MailCheck },
]

export default function AdminSidebar({
  sidebarCollapsed,
  setSidebarCollapsed,
  sidebarOpen,
  setSidebarOpen,
  onLogout,
}: AdminSidebarProps) {
  const pathname = usePathname()

  return (
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
              <p className="text-xs text-gray-400">CMS Dashboard</p>
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
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5" />
          {!sidebarCollapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </aside>
  )
}
