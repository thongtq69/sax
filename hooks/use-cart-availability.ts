'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CartItem } from '@/lib/store/cart'

export type CartAvailabilityItem = {
  cartItemId: string
  productId: string
  quantity: number
  available: boolean
  reason: string
  message: string
  product: {
    id: string
    name: string
    slug: string
    sku: string
    price: number
    stock: number | null
    stockStatus: string | null
    inStock: boolean | null
    isVisible: boolean | null
    status: string | null
  } | null
}

export function useCartAvailability(items: CartItem[], enabled = true) {
  const [results, setResults] = useState<CartAvailabilityItem[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const itemsKey = useMemo(
    () => items.map((item) => `${item.id}:${item.productId}:${item.quantity}`).join('|'),
    [items],
  )

  const validate = useCallback(async () => {
    if (!enabled || items.length === 0) {
      setResults([])
      setError(null)
      return
    }

    setIsValidating(true)
    setError(null)

    try {
      const response = await fetch('/api/cart/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            cartItemId: item.id,
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.message || data?.error || 'Could not validate cart.')
      }

      setResults(Array.isArray(data.items) ? data.items : [])
    } catch (err: any) {
      setError(err?.message || 'Could not validate cart.')
      setResults([])
    } finally {
      setIsValidating(false)
    }
  }, [enabled, itemsKey])

  useEffect(() => {
    validate()
  }, [validate])

  const resultByItemId = useMemo(() => {
    return new Map(results.map((item) => [item.cartItemId, item]))
  }, [results])

  const unavailableItems = useMemo(
    () => results.filter((item) => !item.available),
    [results],
  )

  return {
    results,
    resultByItemId,
    unavailableItems,
    hasUnavailable: unavailableItems.length > 0,
    isValidating,
    error,
    validate,
  }
}
