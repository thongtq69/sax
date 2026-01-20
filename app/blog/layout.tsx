import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Saxophone Blog - Tips, Reviews & Guides | James Sax Corner',
  description: 'Expert saxophone advice, instrument reviews, maintenance tips, and buying guides. Learn from professional saxophonists and instrument specialists at James Sax Corner.',
  keywords: [
    'saxophone blog',
    'saxophone tips',
    'saxophone reviews',
    'saxophone maintenance',
    'saxophone buying guide',
    'professional saxophone advice',
    'wind instrument blog',
    'saxophone techniques',
    'instrument care',
    'saxophone history'
  ],
  openGraph: {
    title: 'Saxophone Blog - Tips, Reviews & Guides | James Sax Corner',
    description: 'Expert saxophone advice, instrument reviews, maintenance tips, and buying guides from professional specialists.',
    type: 'website',
    siteName: 'James Sax Corner',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Saxophone Blog - Tips, Reviews & Guides | James Sax Corner',
    description: 'Expert saxophone advice, instrument reviews, maintenance tips, and buying guides.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://jamessaxcorner.com'}/blog`,
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}