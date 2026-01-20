import type { Metadata } from 'next'
import { Lora } from 'next/font/google'
import './globals.css'
import { SiteLayout } from '@/components/site/SiteLayout'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { GoogleAnalytics } from '@next/third-parties/google'

const lora = Lora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lora'
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
    url: 'https://jamessaxcorner.com',
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
    google: 'YOUR_GOOGLE_VERIFICATION_CODE', // TODO: Add your Google Search Console verification code here
  },
  alternates: {
    canonical: 'https://jamessaxcorner.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={lora.className}>
        <SessionProvider>
          <SiteLayout>{children}</SiteLayout>
        </SessionProvider>
        {process.env.NODE_ENV === 'production' && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'} />
        )}
      </body>
    </html>
  )
}
