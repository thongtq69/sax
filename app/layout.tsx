import type { Metadata } from 'next'
import { Lora } from 'next/font/google'
import './globals.css'
import { SiteLayout } from '@/components/site/SiteLayout'
import { SessionProvider } from '@/components/providers/SessionProvider'
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
    default: 'Premium Saxophones | Yamaha, Yanagisawa & Selmer | James Sax Corner',
    template: '%s | James Sax Corner'
  },
  description: 'Professional Yamaha, Yanagisawa & Selmer saxophones carefully inspected and prepared. Premium instruments with worldwide shipping from James Sax Corner.',
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
    title: 'Premium Saxophones | Yamaha, Yanagisawa & Selmer | James Sax Corner',
    description: 'Professional Yamaha, Yanagisawa & Selmer saxophones carefully inspected and prepared. Premium instruments with worldwide shipping from James Sax Corner.',
    siteName: 'James Sax Corner',
    images: [
      {
        url: '/1000007654.svg',
        width: 1200,
        height: 630,
        alt: 'James Sax Corner Banner',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Premium Saxophones | Yamaha, Yanagisawa & Selmer | James Sax Corner',
    description: 'Professional Yamaha, Yanagisawa & Selmer saxophones carefully inspected and prepared. Worldwide shipping from James Sax Corner.',
    images: ['/1000007654.svg'],
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
