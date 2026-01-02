'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { useReducedMotion } from './use-reduced-motion'

interface ScrollAnimationOptions {
  threshold?: number      // Intersection threshold (default: 0.15)
  rootMargin?: string     // Root margin (default: '0px')
  triggerOnce?: boolean   // Only trigger once (default: true)
  delay?: number          // Animation delay in ms (default: 0)
}

const defaultOptions: Required<ScrollAnimationOptions> = {
  threshold: 0.15,
  rootMargin: '0px',
  triggerOnce: true,
  delay: 0,
}

export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  options: ScrollAnimationOptions = {}
) {
  const prefersReducedMotion = useReducedMotion()
  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)

  const opts = { ...defaultOptions, ...options }

  useEffect(() => {
    // If reduced motion is preferred, show immediately
    if (prefersReducedMotion) {
      setIsVisible(true)
      setHasAnimated(true)
      return
    }

    const element = ref.current
    if (!element) return

    // If already animated and triggerOnce is true, skip
    if (hasAnimated && opts.triggerOnce) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Apply delay if specified
            if (opts.delay > 0) {
              setTimeout(() => {
                setIsVisible(true)
                setHasAnimated(true)
              }, opts.delay)
            } else {
              setIsVisible(true)
              setHasAnimated(true)
            }

            // Unobserve if triggerOnce
            if (opts.triggerOnce) {
              observer.unobserve(entry.target)
            }
          } else if (!opts.triggerOnce) {
            setIsVisible(false)
          }
        })
      },
      {
        threshold: opts.threshold,
        rootMargin: opts.rootMargin,
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [prefersReducedMotion, hasAnimated, opts.threshold, opts.rootMargin, opts.triggerOnce, opts.delay])

  return {
    ref,
    isVisible,
    hasAnimated,
  }
}

/**
 * Hook for scroll direction detection (for sticky header)
 */
export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up')
  const [scrollY, setScrollY] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Determine scroll direction
      if (currentScrollY > lastScrollY.current) {
        setScrollDirection('down')
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection('up')
      }
      
      // Update scroll position
      setScrollY(currentScrollY)
      setIsScrolled(currentScrollY > 50)
      lastScrollY.current = currentScrollY
    }

    // Throttle scroll handler for performance
    let ticking = false
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', throttledScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', throttledScroll)
    }
  }, [])

  return {
    scrollDirection,
    scrollY,
    isScrolled,
  }
}

/**
 * Hook for staggered animations on multiple elements
 */
export function useStaggeredAnimation(
  itemCount: number,
  baseDelay: number = 100,
  options: ScrollAnimationOptions = {}
) {
  const { ref, isVisible, hasAnimated } = useScrollAnimation(options)

  const getItemDelay = useCallback(
    (index: number) => {
      return index * baseDelay
    },
    [baseDelay]
  )

  const getItemStyle = useCallback(
    (index: number) => {
      return {
        animationDelay: `${getItemDelay(index)}ms`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s ease ${getItemDelay(index)}ms, transform 0.5s ease ${getItemDelay(index)}ms`,
      }
    },
    [isVisible, getItemDelay]
  )

  return {
    ref,
    isVisible,
    hasAnimated,
    getItemDelay,
    getItemStyle,
  }
}
