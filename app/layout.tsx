import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/site/Header'
import { Footer } from '@/components/site/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Specialty Music Store - Professional Instruments & Accessories',
  description: 'Family-owned specialty music store offering the finest instruments and accessories. Expert advice and professional setup included.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}

