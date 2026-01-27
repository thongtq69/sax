'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PopupAdData {
    id: string
    title: string
    description: string
    image: string
    ctaText: string
    ctaLink: string
}

export default function PopupAd() {
    const [ad, setAd] = useState<PopupAdData | null>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Check if user has already seen the popup in this session/ever
        const hasSeenPopup = localStorage.getItem('has_seen_popup_ad')

        if (!hasSeenPopup) {
            fetchActiveAd()
        }
    }, [])

    const fetchActiveAd = async () => {
        try {
            const res = await fetch('/api/popup-ad')
            if (res.ok) {
                const data = await res.json()
                if (data && data.isActive) {
                    setAd(data)
                    // Show popup after a short delay
                    setTimeout(() => {
                        setIsVisible(true)
                    }, 1500)
                }
            }
        } catch (error) {
            console.error('Error fetching popup ad:', error)
        }
    }

    const handleClose = () => {
        setIsVisible(false)
        localStorage.setItem('has_seen_popup_ad', 'true')
    }

    if (!ad || !isVisible) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Ad Image */}
                <div className="relative aspect-[4/3] w-full">
                    <Image
                        src={ad.image}
                        alt={ad.title}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h2 className="text-2xl font-bold mb-2">{ad.title}</h2>
                        <p className="text-white/90 mb-6 line-clamp-2">{ad.description}</p>

                        <Link href={ad.ctaLink} onClick={handleClose}>
                            <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 rounded-xl text-lg shadow-lg shadow-primary/30">
                                {ad.ctaText || 'Xem ngay'}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Click outside to close */}
            <div className="absolute inset-0 -z-10" onClick={handleClose} />
        </div>
    )
}
