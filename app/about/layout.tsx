import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About James Sax Corner - Professional Saxophone Specialists',
  description: 'Learn about James Sax Corner, your trusted source for professional saxophones. We specialize in premium instruments from top brands, expert maintenance, and worldwide shipping with exceptional customer service.',
  keywords: [
    'about james sax corner',
    'professional saxophone dealer',
    'saxophone specialist',
    'musical instrument expert',
    'saxophone maintenance',
    'saxophone repair',
    'professional wind instruments',
    'saxophone history'
  ],
  openGraph: {
    title: 'About James Sax Corner - Professional Saxophone Specialists',
    description: 'Learn about James Sax Corner, your trusted source for professional saxophones. Expert maintenance and worldwide shipping.',
    type: 'website',
    siteName: 'James Sax Corner',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About James Sax Corner - Professional Saxophone Specialists',
    description: 'Learn about James Sax Corner, your trusted source for professional saxophones.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://jamessaxcorner.com'}/about`,
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}