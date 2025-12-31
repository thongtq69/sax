'use client'

import { usePathname } from 'next/navigation'
import { TopBar } from './TopBar'
import { Header } from './Header'
import { Footer } from './Footer'
import { useNavigationLoading } from '@/hooks/use-navigation-loading'
import { Loader2 } from 'lucide-react'

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')
  const { isNavigating } = useNavigationLoading()

  if (isAdminRoute) {
    return <>{children}</>
  }

  return (
    <>
      <TopBar />
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      
      {/* Global Navigation Loading Overlay */}
      {isNavigating && (
        <div className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-xl p-6 shadow-2xl flex flex-col items-center gap-4 pointer-events-auto">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg font-medium text-secondary">Loading page...</p>
          </div>
        </div>
      )}
    </>
  )
}

