'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PopupAdData {
    id: string
    title: string
    description: string | null
    image: string | null
    ctaText: string | null
    ctaLink: string | null
    isHtml: boolean
    htmlContent: string | null
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
            localStorage.setItem('has_seen_popup_ad', 'true')
        }
    }

    if (!ad || !isVisible) return null

    // Render custom HTML template
    const renderHtmlAd = () => {
        if (!ad.htmlContent) return null

        return (
            <div
                className="relative max-h-[90vh] max-w-full overflow-y-auto custom-scrollbar rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-300 bg-white"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-50 p-2.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all hover:rotate-90 hover:scale-105 duration-300 backdrop-blur-md border border-white/10"
                    aria-label="Close modal"
                >
                    <X className="h-4 w-4" />
                </button>

                <div 
                    className="w-full h-full text-left"
                    dangerouslySetInnerHTML={{ __html: ad.htmlContent }} 
                />
            </div>
        )
    }

    // Render redesigned premium Standard template
    const renderStandardAd = () => {
        return (
            <div
                className="relative flex flex-col md:flex-row w-full max-w-3xl bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100/80 animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-50 p-2.5 bg-black/45 hover:bg-black/65 text-white hover:text-white rounded-full transition-all hover:rotate-90 hover:scale-105 duration-300 backdrop-blur-md border border-white/10"
                    aria-label="Close modal"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Left Side: Image container */}
                {ad.image && (
                    <div className="relative w-full md:w-1/2 aspect-[16/10] md:aspect-auto md:min-h-[420px] bg-gray-50 flex-shrink-0">
                        <Image
                            src={ad.image}
                            alt={ad.title}
                            fill
                            className="object-cover"
                            priority
                        />
                        {/* Premium Floating Badge */}
                        <div className="absolute top-4 left-4 z-20 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 text-white text-[10px] font-extrabold uppercase tracking-widest rounded-full shadow-lg shadow-red-500/20 border border-white/10 animate-pulse">
                            Flash Sale
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent md:hidden" />
                    </div>
                )}

                {/* Right Side: Content info */}
                <div className={`w-full ${ad.image ? 'md:w-1/2' : 'max-w-md'} p-8 md:p-10 flex flex-col justify-between space-y-6 bg-gradient-to-br from-white to-gray-50/30`}>
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
                            Ưu Đãi Đặc Biệt
                        </div>
                        
                        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight tracking-tight">
                            {ad.title}
                        </h2>
                        
                        {ad.description && (
                            <div className="max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                                <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-line">
                                    {ad.description}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="pt-2">
                        <Link href={ad.ctaLink || '/'} onClick={handleClose}>
                            <Button className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary text-white font-bold py-6 rounded-xl text-base shadow-lg shadow-primary/15 transition-all hover:scale-[1.02] active:scale-[0.98] duration-300">
                                {ad.ctaText || 'Xem ngay'}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            {ad.isHtml ? renderHtmlAd() : renderStandardAd()}

            {/* Click outside to close */}
            <div className="absolute inset-0 -z-10" onClick={handleClose} />

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
                    background: #666;
                }
            `}</style>
        </div>
    )
}

