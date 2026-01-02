'use client'

import { useEffect } from 'react'

/**
 * ScrollAnimations component
 * Adds smooth scroll behavior and IntersectionObserver-based animations
 * Handles prefers-reduced-motion for accessibility
 */
export function ScrollAnimations() {
    useEffect(() => {
        // Add smooth scroll behavior
        document.documentElement.style.scrollBehavior = 'smooth'

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        if (prefersReducedMotion) {
            // Disable animations for users who prefer reduced motion
            return
        }

        // Setup Intersection Observer for scroll-triggered animations
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15 // Trigger when 15% of element is visible
        }

        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // Add visible class to trigger animations
                    entry.target.classList.add('reveal-visible', 'is-visible')

                    // Get stagger delay if specified
                    const delay = entry.target.getAttribute('data-delay')
                    if (delay) {
                        const element = entry.target as HTMLElement
                        element.style.transitionDelay = `${delay}ms`
                    }
                }
            })
        }

        const observer = new IntersectionObserver(handleIntersection, observerOptions)

        // Observe all elements with scroll-reveal or progressive-reveal classes
        const elementsToObserve = document.querySelectorAll('.scroll-reveal, .progressive-reveal')
        elementsToObserve.forEach((el) => observer.observe(el))

        // Cleanup
        return () => {
            observer.disconnect()
            document.documentElement.style.scrollBehavior = 'auto'
        }
    }, [])

    return null
}
