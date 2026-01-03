'use client'

import { PromoCarousel } from './PromoCarousel'

const announcementPromos = [
  {
    id: 'professional-setup',
    title: 'Professional Setup',
    description: 'Every instrument professionally set up before shipping. Play-tested by our experts',
    image: '',
    ctaText: '',
    ctaLink: '/inquiry',
  },
  {
    id: 'free-shipping',
    title: 'Free Shipping',
    description: 'Free worldwide shipping on all orders over $500. Fast & secure delivery',
    image: '',
    ctaText: '',
    ctaLink: '/shop',
  },
  {
    id: 'expert-support',
    title: 'Expert Support',
    description: 'Professional musicians available 24/7 to answer your questions',
    image: '',
    ctaText: '',
    ctaLink: '/contact',
  },
  {
    id: 'warranty',
    title: '2-Year Warranty',
    description: 'All instruments come with comprehensive 2-year warranty coverage',
    image: '',
    ctaText: '',
    ctaLink: '/about',
  },
]

export function AnnouncementBar() {
  return <PromoCarousel promos={announcementPromos} />
}
