'use client'

import { useRef, useState, useCallback, CSSProperties } from 'react'
import { useReducedMotion } from './use-reduced-motion'

interface TiltEffectOptions {
  maxTilt?: number      // Maximum tilt angle in degrees (default: 15)
  scale?: number        // Scale on hover (default: 1.02)
  speed?: number        // Transition speed in ms (default: 400)
  glare?: boolean       // Enable glare effect (default: true)
  glareMaxOpacity?: number // Max glare opacity (default: 0.3)
  perspective?: number  // Perspective value (default: 1000)
}

interface TiltState {
  rotateX: number
  rotateY: number
  scale: number
  glareX: number
  glareY: number
  glareOpacity: number
}

const defaultOptions: Required<TiltEffectOptions> = {
  maxTilt: 15,
  scale: 1.02,
  speed: 400,
  glare: true,
  glareMaxOpacity: 0.3,
  perspective: 1000,
}

export function useTiltEffect<T extends HTMLElement = HTMLDivElement>(
  options: TiltEffectOptions = {}
) {
  const prefersReducedMotion = useReducedMotion()
  const ref = useRef<T>(null)
  const [tiltState, setTiltState] = useState<TiltState>({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    glareX: 50,
    glareY: 50,
    glareOpacity: 0,
  })

  const opts = { ...defaultOptions, ...options }

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<T>) => {
      if (prefersReducedMotion || !ref.current) return

      const element = ref.current
      const rect = element.getBoundingClientRect()
      
      // Calculate cursor position relative to element center (0 to 1)
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      
      // Calculate tilt angles (-maxTilt to +maxTilt)
      const rotateX = (0.5 - y) * opts.maxTilt * 2
      const rotateY = (x - 0.5) * opts.maxTilt * 2
      
      // Calculate glare position (percentage)
      const glareX = x * 100
      const glareY = y * 100
      
      setTiltState({
        rotateX,
        rotateY,
        scale: opts.scale,
        glareX,
        glareY,
        glareOpacity: opts.glare ? opts.glareMaxOpacity : 0,
      })
    },
    [prefersReducedMotion, opts.maxTilt, opts.scale, opts.glare, opts.glareMaxOpacity]
  )

  const handleMouseLeave = useCallback(() => {
    setTiltState({
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      glareX: 50,
      glareY: 50,
      glareOpacity: 0,
    })
  }, [])

  const style: CSSProperties = prefersReducedMotion
    ? {}
    : {
        transform: `perspective(${opts.perspective}px) rotateX(${tiltState.rotateX}deg) rotateY(${tiltState.rotateY}deg) scale(${tiltState.scale})`,
        transition: `transform ${opts.speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`,
        transformStyle: 'preserve-3d',
      }

  const glareStyle: CSSProperties = prefersReducedMotion
    ? { display: 'none' }
    : {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        background: `radial-gradient(circle at ${tiltState.glareX}% ${tiltState.glareY}%, rgba(255,255,255,${tiltState.glareOpacity}), transparent 60%)`,
        transition: `opacity ${opts.speed}ms ease`,
        borderRadius: 'inherit',
        zIndex: 10,
      }

  return {
    ref,
    style,
    glareStyle,
    tiltState,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
  }
}
