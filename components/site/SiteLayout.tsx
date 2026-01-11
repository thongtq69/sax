'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { Header } from './Header'
import { AnnouncementBar } from './AnnouncementBar'
import { Footer } from './Footer'
import { useNavigationLoading } from '@/hooks/use-navigation-loading'
import { SiteSettingsProvider } from '@/contexts/SiteSettingsContext'
import { WishlistProvider } from '@/contexts/WishlistContext'

// Lazy load popup - not needed on initial paint
const NewYearPopup = dynamic(
  () => import('./NewYearPopup').then(m => m.NewYearPopup),
  { ssr: false }
)

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')
  const { isNavigating } = useNavigationLoading()

  if (isAdminRoute) {
    return <>{children}</>
  }

  return (
    <SiteSettingsProvider>
      <WishlistProvider>
        <Header />
        <AnnouncementBar />
        <main className="min-h-screen">{children}</main>
        <Footer />

        {/* New Year 2026 Flash Sale Popup - temporarily hidden */}
        {/* <NewYearPopup /> */}

        {/* Global Navigation Loading Indicator - Lightweight progress bar */}
        {isNavigating && (
          <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-none">
            <div className="h-1 bg-primary/20">
              <div className="h-full bg-primary animate-pulse" style={{ width: '30%' }} />
            </div>
          </div>
        )}
      </WishlistProvider>
    </SiteSettingsProvider>
  )
}
