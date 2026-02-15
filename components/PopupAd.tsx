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
        fetchActiveAd()
    }, [])

    const fetchActiveAd = async () => {
        try {
            const res = await fetch('/api/popup-ad')
            if (res.ok) {
                const data = await res.json()
                if (data && data.isActive) {
                    // Check if user has already seen THIS specific popup
                    const seenPopupId = localStorage.getItem('seen_popup_ad_id')

                    if (seenPopupId !== data.id) {
                        setAd(data)
                        // Show popup after a short delay
                        setTimeout(() => {
                            setIsVisible(true)
                        }, 1500)
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching popup ad:', error)
        }
    }

    const handleClose = () => {
        setIsVisible(false)
        if (ad) {
            localStorage.setItem('seen_popup_ad_id', ad.id)
            // Also keep the old key for compatibility/cleanup if needed, 
            // but we primary use the ID now
            localStorage.setItem('has_seen_popup_ad', 'true')
        }
    }

    if (!ad || !isVisible) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-sm"
                >
                    <X className="h-6 w-6" />
                </button>

                {/* Ad Content */}
                <div className="flex flex-col">
                    {/* Image Header */}
                    <div className="relative aspect-[16/9] w-full">
                        <Image
                            src={ad.image}
                            alt={ad.title}
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-6 left-6 right-6">
                            <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-md">{ad.title}</h2>
                        </div>
                    </div>

                    {/* Content Detail */}
                    <div className="p-8 md:p-10 space-y-6">
                        <div className="max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                            <p className="text-gray-600 text-lg md:text-xl leading-relaxed whitespace-pre-line">
                                {ad.description}
                            </p>
                        </div>

                        <div className="pt-4">
                            <Link href={ad.ctaLink} onClick={handleClose}>
                                <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-8 rounded-2xl text-xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                    {ad.ctaText || 'Xem ngay'}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <style jsx global>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: #f1f1f1;
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #ccc;
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #primary;
                    }
                `}</style>
            </div>

            {/* Click outside to close */}
            <div className="absolute inset-0 -z-10" onClick={handleClose} />
        </div>
    )
}
