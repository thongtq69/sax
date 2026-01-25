import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop Professional Saxophones | James Sax Corner',
  description: 'Browse our collection of professional saxophones from top brands like Selmer, Yamaha, and more. Tenor, alto, soprano, and baritone saxophones available. Expert maintenance and worldwide shipping.',
  keywords: [
    'professional saxophone',
    'tenor saxophone',
    'alto saxophone',
    'soprano saxophone',
    'baritone saxophone',
    'selmer saxophone',
    'yamaha saxophone',
    'vintage saxophone',
    'saxophone for sale',
    'wind instruments',
    'musical instruments'
  ],
  openGraph: {
    title: 'Shop Professional Saxophones | James Sax Corner',
    description: 'Browse our collection of professional saxophones from top brands. Expert maintenance and worldwide shipping.',
    type: 'website',
    siteName: 'James Sax Corner',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop Professional Saxophones | James Sax Corner',
    description: 'Browse our collection of professional saxophones from top brands.',
  },
}

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}