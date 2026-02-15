'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ====== CONFIG ======
const TET_CONFIG = {
  enabled: true,
  // Lunar New Year 2026 (Year of the Horse): Jan 17 - Mar 5
  startDate: new Date('2026-01-10'),
  endDate: new Date('2026-03-05'),
  petalCount: 18,
  lanternCount: 5,
  showFireworks: true,
  fireworkInterval: 10000,
  // Horse gallop interval
  horseInterval: 15000,
}

// 2026 is Year of the Horse 🐴 — "Mã đáo thành công"
const PETAL_EMOJIS = ['🌸', '🏮', '🧧', '✨', '🎋', '💮', '🐴']
const FIREWORK_EMOJIS = ['🎆', '🎇', '✨', '⭐', '🎊']

interface Petal {
  id: number
  emoji: string
  left: number
  delay: number
  duration: number
  size: number
  wobble: number
  opacity: number
}

interface Firework {
  id: number
  emoji: string
  x: number
  y: number
  scale: number
}

interface Lantern {
  id: number
  left: number
  delay: number
  size: number
}

interface Horse {
  id: number
  y: number
  size: number
  speed: number
  direction: 'left' | 'right'
}

function useTetActive() {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (!TET_CONFIG.enabled) {
      console.log('[LunarNewYear] Effect disabled in config')
      return
    }
    const now = new Date()
    const active = now >= TET_CONFIG.startDate && now <= TET_CONFIG.endDate
    console.log('[LunarNewYear] Date check:', { now: now.toISOString(), active })
    setIsActive(active)
  }, [])

  return isActive
}

// SVG Horse silhouette component — galloping pose
function HorseSVG({ flip, size }: { flip?: boolean; size: number }) {
  return (
    <svg
      width={size}
      height={size * 0.7}
      viewBox="0 0 100 70"
      fill="none"
      style={{ transform: flip ? 'scaleX(-1)' : undefined }}
    >
      {/* Body */}
      <ellipse cx="50" cy="38" rx="22" ry="14" fill="#8B4513" />
      {/* Neck */}
      <path d="M68 30 Q72 18 66 8 Q64 5 60 6 Q56 7 58 14 Q60 22 62 32" fill="#8B4513" />
      {/* Head */}
      <ellipse cx="63" cy="8" rx="8" ry="5" fill="#8B4513" transform="rotate(-15 63 8)" />
      {/* Ear */}
      <path d="M67 3 L70 -2 L68 4" fill="#6B3410" />
      {/* Eye */}
      <circle cx="66" cy="7" r="1.2" fill="white" />
      <circle cx="66.3" cy="7" r="0.6" fill="#222" />
      {/* Mouth */}
      <path d="M70 9 Q72 10 71 11" stroke="#6B3410" strokeWidth="0.8" fill="none" />
      {/* Front legs — galloping */}
      <path d="M60 50 Q62 58 66 65" stroke="#8B4513" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M56 50 Q52 56 48 62" stroke="#8B4513" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {/* Back legs — galloping */}
      <path d="M38 50 Q34 58 30 65" stroke="#8B4513" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M42 50 Q46 56 50 64" stroke="#8B4513" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {/* Hooves */}
      <circle cx="66" cy="66" r="2" fill="#4A2800" />
      <circle cx="48" cy="63" r="2" fill="#4A2800" />
      <circle cx="30" cy="66" r="2" fill="#4A2800" />
      <circle cx="50" cy="65" r="2" fill="#4A2800" />
      {/* Tail — flowing */}
      <path d="M28 32 Q18 28 14 35 Q12 40 16 42 Q20 38 24 36" fill="#4A2800" />
      <path d="M28 34 Q20 32 16 38 Q14 43 18 44" fill="#5C3317" opacity="0.7" />
      {/* Mane */}
      <path d="M64 12 Q60 16 62 22 Q64 18 66 14" fill="#4A2800" />
      <path d="M62 10 Q58 14 60 20" stroke="#4A2800" strokeWidth="1.5" fill="none" />
      {/* Gold saddle */}
      <ellipse cx="50" cy="32" rx="10" ry="5" fill="#D4AF37" opacity="0.8" />
      <path d="M42 30 Q50 26 58 30" stroke="#FFD700" strokeWidth="1" fill="none" />
      {/* Red tassel on saddle */}
      <circle cx="50" cy="28" r="2" fill="#CC0000" />
      <path d="M49 30 L48 34" stroke="#CC0000" strokeWidth="0.8" />
      <path d="M51 30 L52 34" stroke="#CC0000" strokeWidth="0.8" />
    </svg>
  )
}

export function LunarNewYearEffect() {
  const isActive = useTetActive()
  const [fireworks, setFireworks] = useState<Firework[]>([])
  const [horses, setHorses] = useState<Horse[]>([])
  const [dismissed, setDismissed] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Check session dismissal on mount
  useEffect(() => {
    setMounted(true)
    try {
      // Allow re-enabling via URL param ?tet=1
      const params = new URLSearchParams(window.location.search)
      if (params.get('tet') === '1') {
        sessionStorage.removeItem('tet-effect-dismissed')
        console.log('[LunarNewYear] Re-enabled via ?tet=1')
        setDismissed(false)
        return
      }

      const wasDismissed = sessionStorage.getItem('tet-effect-dismissed')
      if (wasDismissed) {
        console.log('[LunarNewYear] Previously dismissed by user')
        setDismissed(true)
      }
    } catch {
      // sessionStorage not available (SSR)
    }
  }, [])

  // Generate petals once
  const petals = useMemo<Petal[]>(() => {
    if (!isActive) return []
    return Array.from({ length: TET_CONFIG.petalCount }, (_, i) => ({
      id: i,
      emoji: PETAL_EMOJIS[i % PETAL_EMOJIS.length],
      left: Math.random() * 100,
      delay: Math.random() * 15,
      duration: 8 + Math.random() * 12,
      size: 14 + Math.random() * 14,
      wobble: Math.random() * 60 - 30,
      opacity: 0.35 + Math.random() * 0.45,
    }))
  }, [isActive])

  // Generate lanterns
  const lanterns = useMemo<Lantern[]>(() => {
    if (!isActive) return []
    return Array.from({ length: TET_CONFIG.lanternCount }, (_, i) => ({
      id: i,
      left: 8 + (i * (84 / (TET_CONFIG.lanternCount - 1))),
      delay: i * 0.8,
      size: 26 + Math.random() * 14,
    }))
  }, [isActive])

  // Fireworks
  const spawnFireworks = useCallback(() => {
    if (!TET_CONFIG.showFireworks) return
    const count = 4 + Math.floor(Math.random() * 4)
    const newFw: Firework[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      emoji: FIREWORK_EMOJIS[Math.floor(Math.random() * FIREWORK_EMOJIS.length)],
      x: 10 + Math.random() * 80,
      y: 5 + Math.random() * 45,
      scale: 0.8 + Math.random() * 1.5,
    }))
    setFireworks(newFw)
    setTimeout(() => setFireworks([]), 2500)
  }, [])

  // Horse gallop across screen — "Mã đáo thành công" (Instant success)
  const spawnHorse = useCallback(() => {
    const direction = Math.random() > 0.5 ? 'left' : 'right' as const
    const newHorse: Horse = {
      id: Date.now(),
      y: 55 + Math.random() * 30,
      size: 50 + Math.random() * 30,
      speed: 3 + Math.random() * 2,
      direction,
    }
    setHorses(prev => [...prev, newHorse])
    // Remove horse after animation completes
    setTimeout(() => {
      setHorses(prev => prev.filter(h => h.id !== newHorse.id))
    }, 6000)
  }, [])

  useEffect(() => {
    if (!isActive || dismissed) return
    const fwInitial = setTimeout(spawnFireworks, 3000)
    const fwInterval = setInterval(spawnFireworks, TET_CONFIG.fireworkInterval)
    // First horse after 5s, then periodic
    const horseInitial = setTimeout(spawnHorse, 5000)
    const horseInterval = setInterval(spawnHorse, TET_CONFIG.horseInterval)
    return () => {
      clearTimeout(fwInitial)
      clearInterval(fwInterval)
      clearTimeout(horseInitial)
      clearInterval(horseInterval)
    }
  }, [isActive, dismissed, spawnFireworks, spawnHorse])

  if (!mounted || !isActive || dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('tet-effect-dismissed', 'true')
  }

  return (
    <>
      {/* ===== Falling Petals & Lucky Items ===== */}
      <div
        className="fixed inset-0 pointer-events-none z-[60] overflow-hidden"
        aria-hidden="true"
      >
        {petals.map((petal) => (
          <div
            key={petal.id}
            className="tet-petal absolute"
            style={{
              left: `${petal.left}%`,
              top: '-40px',
              fontSize: `${petal.size}px`,
              animationDelay: `${petal.delay}s`,
              animationDuration: `${petal.duration}s`,
              opacity: petal.opacity,
              ['--wobble' as any]: `${petal.wobble}px`,
            }}
          >
            {petal.emoji}
          </div>
        ))}
      </div>

      {/* ===== Hanging Lanterns ===== */}
      <div
        className="fixed top-0 left-0 right-0 pointer-events-none z-[59] overflow-hidden"
        aria-hidden="true"
      >
        {lanterns.map((lantern) => (
          <div
            key={lantern.id}
            className="tet-lantern absolute"
            style={{
              left: `${lantern.left}%`,
              top: '-8px',
              fontSize: `${lantern.size}px`,
              animationDelay: `${lantern.delay}s`,
            }}
          >
            🏮
          </div>
        ))}
      </div>

      {/* ===== Fireworks ===== */}
      {fireworks.length > 0 && (
        <div
          className="fixed inset-0 pointer-events-none z-[61] overflow-hidden"
          aria-hidden="true"
        >
          {fireworks.map((fw) => (
            <div
              key={fw.id}
              className="tet-firework absolute"
              style={{
                left: `${fw.x}%`,
                top: `${fw.y}%`,
                fontSize: `${24 * fw.scale}px`,
              }}
            >
              {fw.emoji}
            </div>
          ))}
        </div>
      )}

      {/* ===== 🐴 Galloping Horses — "Instant Success" ===== */}
      {horses.map((horse) => (
        <div
          key={horse.id}
          className={`fixed pointer-events-none z-[60] tet-horse-gallop ${
            horse.direction === 'right' ? 'tet-horse-right' : 'tet-horse-left'
          }`}
          style={{
            top: `${horse.y}%`,
            animationDuration: `${horse.speed}s`,
          }}
          aria-hidden="true"
        >
          {/* Dust trail */}
          <div className="tet-horse-dust" />
          <div className="tet-horse-bounce">
            <HorseSVG flip={horse.direction === 'left'} size={horse.size} />
          </div>
          {/* Success text floating above horse */}
          <div
            className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold tet-horse-text"
            style={{ color: '#D4AF37' }}
          >
            ✨ Instant Success ✨
          </div>
        </div>
      ))}

      {/* ===== Banner — Year of the Horse ===== */}
      <div className="tet-banner fixed bottom-4 right-4 z-[62] pointer-events-auto">
        <div className="relative bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-yellow-100 px-4 py-2.5 rounded-full shadow-lg border border-yellow-400/30 flex items-center gap-2 text-sm">
          <span className="text-lg">🐴</span>
          <span className="font-bold tracking-wide">Happy Lunar New Year 2026!</span>
          <span className="text-xs opacity-80">Year of the Horse</span>
          <span className="text-lg">🧧</span>
          <button
            onClick={handleDismiss}
            className="ml-1 text-yellow-200/70 hover:text-white transition-colors text-xs"
            title="Dismiss effect"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ===== Golden Corner Decorations ===== */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[58]"
        aria-hidden="true"
      >
        <div className="tet-corner-decoration">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <path d="M0 0 C40 0 120 0 120 0 L120 10 C100 10 20 10 10 20 C10 40 10 100 10 120 L0 120 Z" fill="url(#goldGradTL)" opacity="0.6" />
            <path d="M0 0 L30 0 L30 5 L5 5 L5 30 L0 30 Z" fill="#D4AF37" opacity="0.9" />
            <circle cx="15" cy="15" r="4" fill="#FFD700" opacity="0.8" />
            <defs>
              <linearGradient id="goldGradTL" x1="0" y1="0" x2="120" y2="120">
                <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div
        className="fixed top-0 right-0 pointer-events-none z-[58]"
        aria-hidden="true"
      >
        <div className="tet-corner-decoration">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <path d="M120 0 C80 0 0 0 0 0 L0 10 C20 10 100 10 110 20 C110 40 110 100 110 120 L120 120 Z" fill="url(#goldGradTR)" opacity="0.6" />
            <path d="M120 0 L90 0 L90 5 L115 5 L115 30 L120 30 Z" fill="#D4AF37" opacity="0.9" />
            <circle cx="105" cy="15" r="4" fill="#FFD700" opacity="0.8" />
            <defs>
              <linearGradient id="goldGradTR" x1="120" y1="0" x2="0" y2="120">
                <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </>
  )
}
