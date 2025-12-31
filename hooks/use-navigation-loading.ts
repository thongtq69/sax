'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

let globalNavigatingState = false
let globalNavigatingListeners: Set<(value: boolean) => void> = new Set()

export function useNavigationLoading() {
  const [isNavigating, setIsNavigating] = useState(globalNavigatingState)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const listener = (value: boolean) => setIsNavigating(value)
    globalNavigatingListeners.add(listener)
    return () => {
      globalNavigatingListeners.delete(listener)
    }
  }, [])

  useEffect(() => {
    // Reset loading when pathname changes (navigation complete) - no delay needed
    globalNavigatingState = false
    globalNavigatingListeners.forEach(listener => listener(false))
  }, [pathname])

  const handleNavigation = (href: string) => {
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      // External links or special protocols - no loading needed
      return
    }

    globalNavigatingState = true
    globalNavigatingListeners.forEach(listener => listener(true))
    
    // Use router.push for client-side navigation
    router.push(href)
  }

  return {
    isNavigating,
    handleNavigation,
  }
}

