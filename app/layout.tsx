import type { Metadata } from 'next'
import { Lora } from 'next/font/google'
import './globals.css'
import { SiteLayout } from '@/components/site/SiteLayout'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { GoogleAnalytics } from '@next/third-parties/google'
import { OptimizedCSS } from '@/components/optimization/OptimizedCSS'
import { buildCanonicalUrl, getBaseUrl } from '@/lib/seo'

const lora = Lora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lora',
  preload: true,
  fallback: ['Georgia', 'serif']
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
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
    url: getBaseUrl(),
    title: 'James Sax Corner - Premium Saxophones & Professional Wind Instruments',
    description: 'Premium saxophones, expertly maintained for peak performance. Trusted by musicians worldwide, backed by outstanding reviews.',
    siteName: 'James Sax Corner',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'James Sax Corner - Premium Saxophones',
    description: 'Premium saxophones, expertly maintained for peak performance. Trusted by musicians worldwide.',
  },
  verification: {
    google: '_P7lYBUK9Gz8XYecWbXTg_pX3uoY4ZBU_jF6jgcqcC4',
  },
  alternates: {
    canonical: buildCanonicalUrl(),
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={lora.className} suppressHydrationWarning>
        <OptimizedCSS />
        <SessionProvider>
          <SiteLayout>{children}</SiteLayout>
        </SessionProvider>
        {(process.env.NEXT_PUBLIC_GA_ID || 'G-MRHKG8MELS') && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || 'G-MRHKG8MELS'}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID || 'G-MRHKG8MELS'}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </body>
    </html>
  )
}
