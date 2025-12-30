'use client'

import { usePathname } from 'next/navigation'
import { TopBar } from './TopBar'
import { Header } from './Header'
import { Footer } from './Footer'

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  if (isAdminRoute) {
    return <>{children}</>
  }

  return (
    <>
      <TopBar />
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}

