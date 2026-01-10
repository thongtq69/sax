'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

interface WishlistContextType {
    wishlistedIds: Set<string>
    addToWishlist: (productId: string) => Promise<boolean>
    removeFromWishlist: (productId: string) => Promise<boolean>
    isInWishlist: (productId: string) => boolean
    isLoading: boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession()
    const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set())
    const [isLoading, setIsLoading] = useState(false)

    // Fetch all wishlist IDs once when user is authenticated
    useEffect(() => {
        if (status === 'authenticated') {
            fetchWishlistIds()
        } else {
            setWishlistedIds(new Set())
        }
    }, [status])

    const fetchWishlistIds = async () => {
        setIsLoading(true)
        try {
            // Create a lightweight endpoint just for IDs if possible, 
            // but for now we can use the existing list endpoint and map ids.
            // Optimization: Ideally backend should have /api/wishlist/ids
            const response = await fetch('/api/wishlist')
            if (response.ok) {
                const data = await response.json()
                const ids = new Set((data.products || []).map((p: any) => p.id))
                setWishlistedIds(ids as Set<string>)
            }
        } catch (error) {
            console.error('Error fetching wishlist IDs:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const addToWishlist = async (productId: string) => {
        try {
            // Optimistic update
            setWishlistedIds(prev => new Set(prev).add(productId))

            const res = await fetch('/api/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId })
            })

            if (!res.ok) {
                // Revert on failure
                setWishlistedIds(prev => {
                    const next = new Set(prev)
                    next.delete(productId)
                    return next
                })
                return false
            }
            return true
        } catch (error) {
            console.error('Error adding to wishlist:', error)
            return false
        }
    }

    const removeFromWishlist = async (productId: string) => {
        try {
            // Optimistic update
            setWishlistedIds(prev => {
                const next = new Set(prev)
                next.delete(productId)
                return next
            })

            const res = await fetch(`/api/wishlist/${productId}`, { method: 'DELETE' })

            if (!res.ok) {
                // Revert
                setWishlistedIds(prev => new Set(prev).add(productId))
                return false
            }
            return true
        } catch (error) {
            console.error('Error removing from wishlist:', error)
            return false
        }
    }

    const isInWishlist = (productId: string) => wishlistedIds.has(productId)

    return (
        <WishlistContext.Provider value={{ wishlistedIds, addToWishlist, removeFromWishlist, isInWishlist, isLoading }}>
            {children}
        </WishlistContext.Provider>
    )
}

export function useWishlist() {
    const context = useContext(WishlistContext)
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider')
    }
    return context
}
