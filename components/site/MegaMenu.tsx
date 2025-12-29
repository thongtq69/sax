'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { categories } from '@/lib/data'
import { cn } from '@/lib/utils'

interface MegaMenuProps {
  mobile?: boolean
}

export function MegaMenu({ mobile = false }: MegaMenuProps) {
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const handleMouseEnter = (categoryId: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setHoveredCategory(categoryId)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredCategory(null)
    }, 200) // Delay để tránh rụng menu
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  if (mobile) {
    return (
      <nav className="py-4">
        {categories.map((category) => (
          <div key={category.id} className="border-b">
            <button
              onClick={() =>
                setOpenCategory(openCategory === category.id ? null : category.id)
              }
              className="flex w-full items-center justify-between px-4 py-3 text-left font-medium hover:bg-gray-50"
            >
              <Link href={category.path} className="flex-1">
                {category.name}
              </Link>
              {category.subcategories && (
                <ChevronRight
                  className={cn(
                    'h-4 w-4 transition-transform',
                    openCategory === category.id && 'rotate-90'
                  )}
                />
              )}
            </button>
            {category.subcategories && openCategory === category.id && (
              <div className="bg-gray-50 pl-4">
                {category.subcategories.map((sub) => (
                  <Link
                    key={sub.id}
                    href={sub.path}
                    className="block py-2 text-sm text-gray-600 hover:text-primary"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
        {/* More Links */}
        <div className="border-b">
          <Link
            href="/financing"
            className="block px-4 py-3 font-medium hover:bg-gray-50"
          >
            Financing
          </Link>
          <Link
            href="/rentals"
            className="block px-4 py-3 font-medium hover:bg-gray-50"
          >
            Rentals
          </Link>
          <Link
            href="/locations"
            className="block px-4 py-3 font-medium hover:bg-gray-50"
          >
            Locations
          </Link>
          <Link
            href="/contact"
            className="block px-4 py-3 font-medium hover:bg-gray-50"
          >
            Contact
          </Link>
        </div>
      </nav>
    )
  }

  return (
    <nav className="relative flex items-center space-x-1">
      {categories.map((category) => (
        <div
          key={category.id}
          className="relative"
          onMouseEnter={() => handleMouseEnter(category.id)}
          onMouseLeave={handleMouseLeave}
        >
          <Link
            href={category.path}
            className="flex items-center space-x-1 px-4 py-2 font-medium text-gray-700 transition-colors hover:text-primary"
          >
            <span>{category.name}</span>
            {category.subcategories && (
              <ChevronDown className="h-4 w-4" />
            )}
          </Link>

          {/* Mega Menu Dropdown */}
          {category.subcategories && hoveredCategory === category.id && (
            <div className="absolute left-0 top-full z-50 mt-1 w-screen max-w-6xl rounded-lg border bg-white shadow-lg">
              <div className="grid grid-cols-4 gap-6 p-6">
                {category.subcategories.map((sub) => (
                  <Link
                    key={sub.id}
                    href={sub.path}
                    className="group rounded-md p-3 transition-colors hover:bg-gray-50"
                  >
                    <div className="font-semibold text-gray-900 group-hover:text-primary">
                      {sub.name}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* More Menu */}
      <div
        className="relative"
        onMouseEnter={() => handleMouseEnter('more')}
        onMouseLeave={handleMouseLeave}
      >
        <Link
          href="#"
          className="flex items-center space-x-1 px-4 py-2 font-medium text-gray-700 transition-colors hover:text-primary"
        >
          <span>More</span>
          <ChevronDown className="h-4 w-4" />
        </Link>
        {hoveredCategory === 'more' && (
          <div className="absolute right-0 top-full z-50 mt-1 w-64 rounded-lg border bg-white shadow-lg">
            <div className="p-2">
              <Link
                href="/financing"
                className="block rounded-md px-4 py-2 hover:bg-gray-50"
              >
                Financing
              </Link>
              <Link
                href="/rentals"
                className="block rounded-md px-4 py-2 hover:bg-gray-50"
              >
                Rentals
              </Link>
              <Link
                href="/locations"
                className="block rounded-md px-4 py-2 hover:bg-gray-50"
              >
                Locations
              </Link>
              <Link
                href="/contact"
                className="block rounded-md px-4 py-2 hover:bg-gray-50"
              >
                Contact
              </Link>
              <Link
                href="/about"
                className="block rounded-md px-4 py-2 hover:bg-gray-50"
              >
                About
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

