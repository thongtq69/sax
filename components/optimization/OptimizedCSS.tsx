'use client'

import { useEffect } from 'react'

export function OptimizedCSS() {
  useEffect(() => {
    // Preload critical resources
    const preloadLink = document.createElement('link')
    preloadLink.rel = 'preload'
    preloadLink.as = 'style'
    preloadLink.href = '/_next/static/css/app/layout.css'
    document.head.appendChild(preloadLink)

    // Load non-critical CSS asynchronously
    const loadCSS = (href: string) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      link.media = 'print'
      link.onload = () => {
        link.media = 'all'
      }
      document.head.appendChild(link)
    }

    // Defer non-critical stylesheets
    const deferredStyles: string[] = [
      // Add any non-critical CSS files here
    ]

    deferredStyles.forEach(loadCSS)

    // Optimize font loading
    if ('fonts' in document) {
      // @ts-ignore
      document.fonts.ready.then(() => {
        document.documentElement.classList.add('fonts-loaded')
      })
    }
  }, [])

  return null
}