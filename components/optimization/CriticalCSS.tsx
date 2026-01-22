'use client'

import { useEffect } from 'react'

export function CriticalCSS() {
  useEffect(() => {
    // Load non-critical CSS after initial render
    const loadNonCriticalCSS = () => {
      // This will be handled by Next.js automatically for non-critical styles
      // We can add any additional non-critical stylesheets here if needed
    }

    // Load after initial paint
    if (typeof window !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadNonCriticalCSS)
      } else {
        loadNonCriticalCSS()
      }
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', loadNonCriticalCSS)
    }
  }, [])

  return null
}