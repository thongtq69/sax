import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { TopBar } from '@/components/site/TopBar'
import { Header } from '@/components/site/Header'
import { Footer } from '@/components/site/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'James Sax Corner - Wind Instrument Specialists',
  description: 'Family-owned wind instrument specialists since 1985. Expert advice, professional setup, and personalized service for students, educators, and professionals.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TopBar />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
