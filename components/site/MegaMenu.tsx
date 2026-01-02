'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react'
import { getCategories, transformCategory } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useNavigationLoading } from '@/hooks/use-navigation-loading'

interface MegaMenuProps {
  mobile?: boolean
}

export function MegaMenu({ mobile = false }: MegaMenuProps) {
  const [categories, setCategories] = useState<any[]>([])
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [clickedLink, setClickedLink] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const { isNavigating } = useNavigationLoading()

  // Fetch categories from API
  useEffect(() => {
    async function fetchCategories() {
      try {
        const categoriesData = await getCategories()
        const transformed = categoriesData.map(transformCategory)
        
        // Filter categories and subcategories that have products
        const filtered = transformed.map(cat => {
          const filteredSubs = cat.subcategories?.filter((sub: any) => {
            // We'll show all subcategories for now, filtering will be done by product count on server
            return true
          }) || []
          
          return {
            ...cat,
            subcategories: filteredSubs
          }
        }).filter(cat => {
          // Only show categories that have subcategories with products or are Accessories
          return cat.subcategories && cat.subcategories.length > 0 || cat.slug === 'accessories'
        })
        
        setCategories(filtered)
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

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
              <Link href={`/shop?category=${category.slug}`} className="flex-1" prefetch={true}>
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
                {category.subcategories?.map((sub: any) => (
                  <Link
                    key={sub.id}
                    href={`/shop?subcategory=${sub.slug}`}
                    className="block py-2 text-sm text-gray-600 hover:text-primary"
                    prefetch={true}
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
            href="/contact"
            className="block px-4 py-3 font-medium hover:bg-gray-50"
          >
            Contact
          </Link>
        </div>
      </nav>
    )
  }

  const woodwindsCategory = categories.find(cat => cat.slug === 'woodwinds')
  const accessoriesCategory = categories.find(cat => cat.slug === 'accessories')

  return (
    <nav className="relative flex items-center space-x-1">
      {/* Woodwinds - Main category with subcategories */}
      {woodwindsCategory && (
        <div
          className="relative"
          onMouseEnter={() => handleMouseEnter(woodwindsCategory.id)}
          onMouseLeave={handleMouseLeave}
        >
          <Link
            href="/shop?category=woodwinds"
            className="flex items-center space-x-1 px-4 py-2 font-medium text-gray-700 transition-colors hover:text-primary"
          >
            <span>Woodwinds</span>
            {woodwindsCategory.subcategories && woodwindsCategory.subcategories.length > 0 && (
              <ChevronDown className="h-4 w-4" />
            )}
          </Link>

          {/* Mega Menu Dropdown */}
          {woodwindsCategory.subcategories && woodwindsCategory.subcategories.length > 0 && hoveredCategory === woodwindsCategory.id && (
            <div className="absolute left-0 top-full z-50 mt-1 w-80 rounded-lg border bg-white shadow-lg">
              <div className="p-4">
                {/* Subcategories */}
                {woodwindsCategory.subcategories.map((sub: any) => (
                  <Link
                    key={sub.id}
                    href={`/shop?subcategory=${sub.slug}`}
                    className="block rounded-md px-4 py-3 transition-colors hover:bg-gray-50 group"
                  >
                    <div className="font-semibold text-gray-900 group-hover:text-primary">
                      {sub.name}
                    </div>
                  </Link>
                ))}
                
                {/* View All */}
                <div className="mt-2 pt-2 border-t">
                  <Link
                    href="/shop?category=woodwinds"
                    className="flex items-center rounded-md px-4 py-2 text-primary font-semibold hover:bg-primary/5"
                  >
                    View All Woodwinds
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Accessories - Direct link, no dropdown */}
      {accessoriesCategory && (
        <Link
          href="/shop?category=accessories"
          className="px-4 py-2 font-medium text-gray-700 transition-colors hover:text-primary"
        >
          Accessories
        </Link>
      )}

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
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Shop by Brand
              </div>
              <Link
                href="/shop?brand=Yamaha"
                className="block rounded-md px-4 py-2 hover:bg-gray-50"
              >
                Yamaha (15)
              </Link>
              <Link
                href="/shop?brand=Yanagisawa"
                className="block rounded-md px-4 py-2 hover:bg-gray-50"
              >
                Yanagisawa (10)
              </Link>
              <Link
                href="/shop?brand=Selmer"
                className="block rounded-md px-4 py-2 hover:bg-gray-50"
              >
                Selmer (3)
              </Link>
              <div className="my-1 border-t"></div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Information
              </div>
              <Link
                href="/financing"
                className="block rounded-md px-4 py-2 hover:bg-gray-50"
              >
                Financing
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

