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
  onError
}: SmartImageProps) {
  const [error, setError] = useState(false)
  
  // If it's a proxy URL or local URL, use regular img tag
  const isProxyUrl = src?.startsWith('/api/image-proxy') || src?.startsWith('/')
  
  if (error || !src) {
    return (
      <div className={cn("bg-gray-100 flex items-center justify-center", className)}>
        <span className="text-gray-400 text-sm">Image not available</span>
      </div>
    )
  }
  
  if (isProxyUrl) {
    // Use regular img for proxy URLs
    if (fill) {
      return (
        <img
          src={src}
          alt={alt}
          className={className}
          onError={() => {
            setError(true)
            onError?.()
          }}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
      )
    }
    
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={() => {
          setError(true)
          onError?.()
        }}
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
      className={className}
      priority={priority}
      onError={() => {
        setError(true)
        onError?.()
      }}
    />
  )
}

