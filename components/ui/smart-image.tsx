'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface SmartImageProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  priority?: boolean
  sizes?: string
  onError?: () => void
}

/**
 * Smart Image component that uses regular img tag for proxy URLs
 * and Next.js Image for external URLs
 */
export function SmartImage({ 
  src, 
  alt, 
  fill, 
  width, 
  height, 
  className,
  priority,
  sizes,
  onError
}: SmartImageProps) {
  const [error, setError] = useState(false)
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null)
  
  // If it's a proxy URL or local URL, use regular img tag
  const isProxyUrl = src?.startsWith('/api/image-proxy') || src?.startsWith('/')
  
  // Extract original URL from proxy URL for fallback
  const getOriginalUrl = (proxyUrl: string): string | null => {
    try {
      const url = new URL(proxyUrl, window.location.origin)
      const originalUrl = url.searchParams.get('url')
      return originalUrl ? decodeURIComponent(originalUrl) : null
    } catch {
      return null
    }
  }
  
  if (error || !src) {
    if (fill) {
      return (
        <div className={cn("bg-gray-100 flex items-center justify-center", className)} style={{ width: '100%', height: '100%' }}>
          <span className="text-gray-400 text-sm">Image not available</span>
        </div>
      )
    }
    return (
      <div className={cn("bg-gray-100 flex items-center justify-center", className)} style={{ width, height }}>
        <span className="text-gray-400 text-sm">Image not available</span>
      </div>
    )
  }
  
  if (isProxyUrl) {
    // Use regular img for proxy URLs, with fallback to original URL on error
    const imageSrc = fallbackUrl || src
    
    const handleImageError = () => {
      // If proxy fails and we haven't tried fallback yet, try original URL
      if (!fallbackUrl && src.startsWith('/api/image-proxy')) {
        const original = getOriginalUrl(src)
        if (original) {
          setFallbackUrl(original)
          return // Don't set error yet, try original URL first
        }
      }
      // If fallback also failed or no original URL, show error
      setError(true)
      onError?.()
    }
    
    if (fill) {
      return (
        <img
          src={imageSrc}
          alt={alt}
          className={className}
          onError={handleImageError}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
      )
    }
    
    return (
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={handleImageError}
      />
    )
  }
  
  // Use Next.js Image for external URLs
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
        className={className}
        priority={priority}
        onError={() => {
          setError(true)
          onError?.()
        }}
      />
    )
  }
  
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      priority={priority}
      onError={() => {
        setError(true)
        onError?.()
      }}
    />
  )
}

