'use client'

import { useEffect, useState } from 'react'
import { PromoCarousel } from './PromoCarousel'

// Default announcements (fallback if no data from DB)
const defaultAnnouncements = [
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

interface Announcement {
  id: string
  title: string
  description: string
  ctaText: string | null
  ctaLink: string | null
}

export function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState(defaultAnnouncements)

  useEffect(() => {
    fetch('/api/announcements')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setAnnouncements(data.map((item: Announcement) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            image: '',
            ctaText: item.ctaText || '',
            ctaLink: item.ctaLink || '',
          })))
        }
      })
      .catch(() => {
        // Keep default announcements on error
      })
  }, [])

  return <PromoCarousel promos={announcements} />
}
