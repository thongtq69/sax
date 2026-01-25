import type { Metadata } from 'next'
import { Lora } from 'next/font/google'
import './globals.css'
import { SiteLayout } from '@/components/site/SiteLayout'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { GoogleAnalytics } from '@next/third-parties/google'
import { OptimizedCSS } from '@/components/optimization/OptimizedCSS'

const lora = Lora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lora',
  preload: true,
  fallback: ['Georgia', 'serif']
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://jamessaxcorner.com'),
  title: {
    default: 'James Sax Corner - Premium Saxophones & Professional Wind Instruments',
    template: '%s | James Sax Corner'
  },
  description: 'Premium saxophones, expertly maintained for peak performance. Trusted by musicians worldwide, backed by outstanding reviews. Unmatched customer service—your satisfaction comes first! Buy with confidence!',
  keywords: [
    'saxophone',
    'sax',
    'professional saxophone',
    'vintage saxophone',
    'selmer saxophone',
    'yamaha saxophone',
    'tenor saxophone',
    'alto saxophone',
    'soprano saxophone',
    'baritone saxophone',
    'wind instruments',
    'musical instruments',
    'professional music gear',
    'saxophone repair',
    'saxophone maintenance'
  ],
  authors: [{ name: 'James Sax Corner' }],
  creator: 'James Sax Corner',
  publisher: 'James Sax Corner',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://jamessaxcorner.com',
    title: 'James Sax Corner - Premium Saxophones & Professional Wind Instruments',
    description: 'Premium saxophones, expertly maintained for peak performance. Trusted by musicians worldwide, backed by outstanding reviews.',
    siteName: 'James Sax Corner',
    images: [
      {
        url: '/og-image.jpg', // TODO: Tạo ảnh OG 1200x630px
        width: 1200,
        height: 630,
        alt: 'James Sax Corner - Premium Saxophones',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'James Sax Corner - Premium Saxophones',
    description: 'Premium saxophones, expertly maintained for peak performance. Trusted by musicians worldwide.',
    images: ['/og-image.jpg'], // TODO: Tạo ảnh Twitter card
  },
  verification: {
    google: '_P7lYBUK9Gz8XYecWbXTg_pX3uoY4ZBU_jF6jgcqcC4',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={lora.className}>
        <OptimizedCSS />
        <SessionProvider>
          <SiteLayout>{children}</SiteLayout>
        </SessionProvider>
        {process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  )
}
