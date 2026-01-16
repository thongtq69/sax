'use client'

import { useState, useEffect } from 'react'
import { ConditionRating, getConditionDisplay, getConditionDescription } from '@/lib/product-conditions'
import { Info } from 'lucide-react'

interface ConditionTooltipProps {
  condition: ConditionRating
  className?: string
}

export function ConditionTooltip({ condition, className = '' }: ConditionTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile on mount - must use useEffect to avoid SSR window error
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile('ontouchstart' in window)
    }
  }, [])

  const conditionColors: Record<ConditionRating, string> = {
    'mint': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'excellent': 'bg-green-100 text-green-800 border-green-200',
    'very-good': 'bg-blue-100 text-blue-800 border-blue-200',
    'good': 'bg-amber-100 text-amber-800 border-amber-200',
    'fair': 'bg-orange-100 text-orange-800 border-orange-200'
  }

  const handleInteraction = () => {
    if (isMobile) {
      setIsOpen(!isOpen)
    }
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border-2 cursor-help transition-all ${conditionColors[condition]} ${
          isOpen ? 'scale-105 shadow-md' : ''
        }`}
        onMouseEnter={() => !isMobile && setIsOpen(true)}
        onMouseLeave={() => !isMobile && setIsOpen(false)}
        onClick={handleInteraction}
        onTouchStart={handleInteraction}
      >
        <span>Used - {getConditionDisplay(condition)}</span>
        <Info className="h-3.5 w-3.5" />
      </div>

      {/* Tooltip */}
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          {isMobile && (
            <div
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsOpen(false)}
            />
          )}
          
          <div
            className={`absolute z-50 w-72 p-4 bg-white rounded-lg shadow-xl border-2 border-gray-200 text-sm text-gray-700 leading-relaxed ${
              isMobile
                ? 'left-0 top-full mt-2'
                : 'left-0 bottom-full mb-2'
            } animate-fade-in`}
            style={{ minWidth: '280px' }}
          >
            {/* Arrow */}
            <div
              className={`absolute left-6 w-3 h-3 bg-white border-gray-200 rotate-45 ${
                isMobile ? '-top-1.5 border-t-2 border-l-2' : '-bottom-1.5 border-b-2 border-r-2'
              }`}
            />
            
            <div className="relative">
              <div className="font-semibold text-gray-900 mb-2">
                {getConditionDisplay(condition)} Condition
              </div>
              <div className="text-gray-600">{getConditionDescription(condition)}</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
