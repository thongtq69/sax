'use client'

import { useState, useCallback } from 'react'
import { useReducedMotion } from './use-reduced-motion'

interface Ripple {
  id: string
  x: number
  y: number
  size: number
}

interface RippleEffectOptions {
  color?: string        // Ripple color (default: 'rgba(255, 255, 255, 0.5)')
  duration?: number     // Animation duration in ms (default: 600)
  opacity?: number      // Initial opacity (default: 0.5)
}

const defaultOptions: Required<RippleEffectOptions> = {
  color: 'rgba(255, 255, 255, 0.5)',
  duration: 600,
  opacity: 0.5,
}

interface RippleEffectReturn {
  ripples: Ripple[]
  createRipple: (e: React.MouseEvent<HTMLElement>) => void
  RippleContainer: () => JSX.Element
}

export function useRippleEffect(options: RippleEffectOptions = {}): RippleEffectReturn {
  const prefersReducedMotion = useReducedMotion()
  const [ripples, setRipples] = useState<Ripple[]>([])
  const opts = { ...defaultOptions, ...options }

  const createRipple = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (prefersReducedMotion) return

      const element = e.currentTarget
      const rect = element.getBoundingClientRect()
      
      // Calculate ripple position relative to element
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      // Calculate ripple size (should cover the entire element)
      const size = Math.max(rect.width, rect.height) * 2
      
      const newRipple: Ripple = {
        id: `ripple-${Date.now()}-${Math.random()}`,
        x: x - size / 2,
        y: y - size / 2,
        size,
      }

      setRipples((prev) => [...prev, newRipple])

      // Remove ripple after animation completes
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
      }, opts.duration)
    },
    [prefersReducedMotion, opts.duration]
  )

  // Ripple container component
  const RippleContainer = useCallback(
    () => (
      <span
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          borderRadius: 'inherit',
        }}
      >
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            style={{
              position: 'absolute',
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              borderRadius: '50%',
              backgroundColor: opts.color,
              opacity: opts.opacity,
              transform: 'scale(0)',
              animation: `ripple-expand ${opts.duration}ms ease-out forwards`,
            }}
          />
        ))}
        <style jsx>{`
          @keyframes ripple-expand {
            0% {
              transform: scale(0);
              opacity: ${opts.opacity};
            }
            100% {
              transform: scale(1);
              opacity: 0;
            }
          }
        `}</style>
      </span>
    ),
    [ripples, opts.color, opts.duration, opts.opacity]
  )

  return {
    ripples,
    createRipple,
    RippleContainer,
  }
}
