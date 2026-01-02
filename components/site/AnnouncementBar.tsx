'use client'

import { PromoCarousel } from './PromoCarousel'

const announcementPromos = [
  {
    id: 'professional-setup',
    title: 'Professional Setup',
    description: 'Every instrument professionally set up before shipping. Play-tested by our experts',
    image: '',
    ctaText: 'Learn More',
    ctaLink: '/inquiry',
  },
]

export function AnnouncementBar() {
  return <PromoCarousel promos={announcementPromos} />
}
