'use client'

import { useRef, useState, useCallback, useEffect, CSSProperties } from 'react'
import { useReducedMotion } from './use-reduced-motion'

interface CursorSpotlightOptions {
  size?: number           // Spotlight size in px (default: 200)
  opacity?: number        // Spotlight opacity (default: 0.15)
  color?: string          // Spotlight color (default: 'hsl(38 70% 50%)')
  blur?: number           // Blur amount in px (default: 40)
}

const defaultOptions: Required<CursorSpotlightOptions> = {
  size: 200,
  opacity: 0.15,
  color: 'hsl(38 70% 50%)',
  blur: 40,
}

/**
 * Detect if device is touch-capable
 */
function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

export function useCursorSpotlight<T extends HTMLElement = HTMLDivElement>(
  options: CursorSpotlightOptions = {}
) {
  const prefersReducedMotion = useReducedMotion()
  const ref = useRef<T>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [isTouch, setIsTouch] = useState(false)

  const opts = { ...defaultOptions, ...options }

  // Check for touch device on mount
  useEffect(() => {
    setIsTouch(isTouchDevice())
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<T>) => {
      if (prefersReducedMotion || isTouch || !ref.current) return

      const element = ref.current
      const rect = element.getBoundingClientRect()
      
      // Calculate position relative to element
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      setPosition({ x, y })
    },
    [prefersReducedMotion, isTouch]
  )

  const handleMouseEnter = useCallback(() => {
    if (!prefersReducedMotion && !isTouch) {
      setIsHovering(true)
    }
  }, [prefersReducedMotion, isTouch])

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
  }, [])

  // Spotlight style
  const spotlightStyle: CSSProperties =
    prefersReducedMotion || isTouch || !isHovering
      ? { display: 'none' }
      : {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          background: `radial-gradient(circle ${opts.size}px at ${position.x}px ${position.y}px, ${opts.color}, transparent)`,
          opacity: opts.opacity,
          filter: `blur(${opts.blur}px)`,
          transition: 'opacity 0.3s ease',
          zIndex: 1,
          borderRadius: 'inherit',
        }

  return {
    ref,
    spotlightStyle,
    position,
    isHovering,
    isTouch,
    onMouseMove: handleMouseMove,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  }
}

/**
 * Hook for magnetic button effect
 */
export function useMagneticEffect<T extends HTMLElement = HTMLButtonElement>(
  strength: number = 0.3
) {
  const prefersReducedMotion = useReducedMotion()
  const ref = useRef<T>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch(isTouchDevice())
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<T>) => {
      if (prefersReducedMotion || isTouch || !ref.current) return

      const element = ref.current
      const rect = element.getBoundingClientRect()
      
      // Calculate center of element
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      // Calculate offset from center
      const offsetX = (e.clientX - centerX) * strength
      const offsetY = (e.clientY - centerY) * strength
      
      setOffset({ x: offsetX, y: offsetY })
    },
    [prefersReducedMotion, isTouch, strength]
  )

  const handleMouseLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 })
  }, [])

  const style: CSSProperties =
    prefersReducedMotion || isTouch
      ? {}
      : {
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          transition: 'transform 0.2s ease-out',
        }

  return {
    ref,
    style,
    offset,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
  }
}
