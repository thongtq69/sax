'use client'

import { useEffect, useState } from 'react'
import { PromoCarousel } from './PromoCarousel'

interface Announcement {
  id: string
  title: string
  description: string
  ctaText: string | null
  ctaLink: string | null
}

interface PromoItem {
  id: string
  title: string
  description: string
  image: string
  ctaText: string
  ctaLink: string
}

export function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState<PromoItem[] | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/announcements')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAnnouncements(data.map((item: Announcement) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            image: '',
            ctaText: item.ctaText || '',
            ctaLink: item.ctaLink || '',
          })))
        }
        setLoaded(true)
      })
      .catch(() => {
        setLoaded(true)
      })
  }, [])

  // Don't render until loaded, and if no announcements, don't show the bar
  if (!loaded) return null
  if (!announcements || announcements.length === 0) return null

  return <PromoCarousel promos={announcements} />
}
