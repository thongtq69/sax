'use client'

import { usePathname } from 'next/navigation'
import { TopBar } from './TopBar'
import { Header } from './Header'
import { AnnouncementBar } from './AnnouncementBar'
import { Footer } from './Footer'
import { NewYearPopup } from './NewYearPopup'
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
      <Header />
      <AnnouncementBar />
      <main className="min-h-screen">{children}</main>
      <Footer />

      {/* New Year 2026 Flash Sale Popup */}
      <NewYearPopup />

      {/* Global Navigation Loading Indicator - Lightweight progress bar */}
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-none">
          <div className="h-1 bg-primary/20">
            <div className="h-full bg-primary animate-pulse" style={{ width: '30%' }} />
          </div>
        </div>
      )}
    </>
  )
}
