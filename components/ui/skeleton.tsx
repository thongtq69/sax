'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'rectangular' | 'text'
  width?: string | number
  height?: string | number
  lines?: number
  animated?: boolean
}

export function Skeleton({
  className,
  variant = 'default',
  width,
  height,
  lines = 1,
  animated = true,
  ...props
}: SkeletonProps) {
  const baseClasses = cn(
    'bg-muted rounded',
    animated && 'skeleton-enhanced'
  )

  const variantClasses = {
    default: 'rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    text: 'rounded h-4',
  }

  const style: React.CSSProperties = {
    width: width,
    height: height,
  }

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)} {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(baseClasses, variantClasses.text)}
            style={{
              ...style,
              width: i === lines - 1 ? '75%' : width || '100%',
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
      {...props}
    />
  )
}

// Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Image skeleton */}
      <Skeleton className="aspect-square w-full" variant="rectangular" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Brand */}
        <Skeleton width="30%" height={12} />
        
        {/* Title */}
        <Skeleton variant="text" lines={2} />
        
        {/* Rating */}
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="circular" width={14} height={14} />
          ))}
        </div>
        
        {/* Price */}
        <Skeleton width="40%" height={24} />
        
        {/* Button */}
        <Skeleton height={40} className="rounded-md" />
      </div>
    </div>
  )
}

// Blog Card Skeleton
export function BlogCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Skeleton className="aspect-video w-full" variant="rectangular" />
      <div className="p-4 space-y-3">
        <Skeleton width="20%" height={12} />
        <Skeleton variant="text" lines={2} />
        <Skeleton width="60%" height={14} />
      </div>
    </div>
  )
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton 
          key={i} 
          className="flex-1" 
          height={16}
          width={i === 0 ? '30%' : undefined}
        />
      ))}
    </div>
  )
}

// Avatar Skeleton
export function AvatarSkeleton({ size = 40 }: { size?: number }) {
  return <Skeleton variant="circular" width={size} height={size} />
}

// Page Header Skeleton
export function PageHeaderSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton width="40%" height={32} />
      <Skeleton variant="text" lines={2} width="60%" />
    </div>
  )
}
