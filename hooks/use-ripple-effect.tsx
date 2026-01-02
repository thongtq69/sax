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
  color?: string
  duration?: number
}

const defaultOptions = {
  color: 'rgba(255, 255, 255, 0.5)',
  duration: 600,
}

export function useRippleEffect(options: RippleEffectOptions = {}) {
  const prefersReducedMotion = useReducedMotion()
  const [ripples, setRipples] = useState<Ripple[]>([])
  const opts = { ...defaultOptions, ...options }

  const createRipple = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (prefersReducedMotion) return

      const element = e.currentTarget
      const rect = element.getBoundingClientRect()
      
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const size = Math.max(rect.width, rect.height) * 2
      
      const newRipple: Ripple = {
        id: `ripple-${Date.now()}-${Math.random()}`,
        x: x - size / 2,
        y: y - size / 2,
        size,
      }

      setRipples((prev) => [...prev, newRipple])

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
      }, opts.duration)
    },
    [prefersReducedMotion, opts.duration]
  )

  const RippleContainer = useCallback(
    () => {
      if (ripples.length === 0) return null
      
      return (
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
              className="ripple-animation"
              style={{
                position: 'absolute',
                left: ripple.x,
                top: ripple.y,
                width: ripple.size,
                height: ripple.size,
                borderRadius: '50%',
                backgroundColor: opts.color,
                animationDuration: `${opts.duration}ms`,
              }}
            />
          ))}
        </span>
      )
    },
    [ripples, opts.color, opts.duration]
  )

  return {
    ripples,
    createRipple,
    RippleContainer,
  }
}
