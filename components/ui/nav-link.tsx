'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: (e: React.MouseEvent) => void
  showLoading?: boolean
}

export function NavLink({ 
  href, 
  children, 
  className,
  onClick,
  showLoading = true 
}: NavLinkProps) {
  const [isNavigating, setIsNavigating] = useState(false)
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + '/')

  const handleClick = (e: React.MouseEvent) => {
    if (showLoading && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
      setIsNavigating(true)
    }
    onClick?.(e)
  }

  // Reset loading when pathname changes
  useEffect(() => {
    if (pathname === href || pathname.startsWith(href + '/')) {
      setIsNavigating(false)
    }
  }, [pathname, href])

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        'relative inline-flex items-center gap-1.5',
        isNavigating && showLoading && 'opacity-70',
        className
      )}
      prefetch={true}
    >
      {isNavigating && showLoading ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span className="opacity-0 absolute">{children}</span>
          <span className="opacity-100">{children}</span>
        </>
      ) : (
        children
      )}
    </Link>
  )
}

