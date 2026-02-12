'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Zap, Clock, Star, Gift, ShoppingCart, Loader2 } from 'lucide-react'
import { Product } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { SmartImage } from '@/components/ui/smart-image'

interface FlashSaleCardProps {
    product: Product
    index: number
    urgencyText?: string
    buttonText?: string
}

function FlashSaleCard({ product, index, urgencyText, buttonText }: FlashSaleCardProps) {
    const hashId = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const percentSold = 30 + (hashId % 65)
    const isUrgent = percentSold > 80

    return (
        <div className="group relative bg-[#0a0a0a] border border-zinc-800/50 rounded-xl overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] hover:-translate-y-2">
            <div className="absolute top-3 left-3 z-20">
                <div className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg animate-pulse">
                    <Zap className="h-3 w-3 fill-current" />
                    FLASH
                </div>
            </div>

            <div className="relative aspect-square overflow-hidden bg-zinc-900">
                <SmartImage
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-60" />

                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-white/10">
                    <Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />
                    <span className="text-[10px] font-medium text-white">{product.rating || '4.9'}</span>
                </div>
            </div>

            <div className="p-4 space-y-3">
                <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold mb-1">
                        {product.brand}
                    </p>
                    <h3 className="text-sm font-bold text-zinc-100 line-clamp-2 leading-tight group-hover:text-[#D4AF37] transition-colors">
                        {product.name}
                    </h3>
                </div>

                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-[#D4AF37] to-white">
                        ${product.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-zinc-500 line-through">
                        ${(product.price * 1.25).toLocaleString()}
                    </span>
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                        <span className={isUrgent ? 'text-orange-500 font-bold' : 'text-zinc-400'}>
                            {urgencyText || (isUrgent ? '🏃 HURRY! LOW STOCK' : '🔥 Popular Choice')}
                        </span>
                        <span className="text-zinc-300 font-medium">{percentSold}% Sold</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${isUrgent ? 'bg-gradient-to-r from-orange-600 to-red-500' : 'bg-gradient-to-r from-amber-500 to-amber-200'}`}
                            style={{ width: `${percentSold}%` }}
                        />
                    </div>
                </div>

                <Button className="w-full h-9 bg-[#D4AF37] hover:bg-white text-black font-bold rounded-lg border-none transition-all duration-300 transform group-hover:scale-[1.02]">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {buttonText || 'GRAB NOW'}
                </Button>
            </div>
        </div>
    )
}

interface FlashSaleProps {
    products: Product[]
}

export function FlashSale({ products }: FlashSaleProps) {
    const [settings, setSettings] = useState<any>(null)
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/admin/homepage-content/flash-sale')
                if (response.ok) {
                    const data = await response.json()
                    setSettings(data)
                }
            } catch (error) {
                console.error('Error fetching flash sale settings:', error)
            } finally {
                setLoaded(true)
            }
        }
        fetchSettings()
    }, [])

    useEffect(() => {
        if (!settings?.metadata?.endDate) return

        const target = new Date(settings.metadata.endDate).getTime()

        const updateTimer = () => {
            const now = new Date().getTime()
            const diff = target - now

            if (diff > 0) {
                setTimeLeft({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((diff % (1000 * 60)) / 1000)
                })
            }
        }

        updateTimer()
        const interval = setInterval(updateTimer, 1000)
        return () => clearInterval(interval)
    }, [settings])

    if (!loaded || !settings?.isVisible || products.length === 0) return null

    return (
        <section className="relative py-16 overflow-hidden bg-[#050505]">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#D4AF37] rounded-full blur-[150px]" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-600 rounded-full blur-[150px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-orange-500 font-black tracking-tighter text-lg animate-bounce">
                            <Zap className="h-5 w-5 fill-current" />
                            <span>LIVE OFFERS</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter leading-none">
                            {settings.title || 'FLASH SALE'}
                        </h2>
                        {settings.subtitle && <p className="text-zinc-500 font-medium max-w-md">{settings.subtitle}</p>}
                        <div className="h-1.5 w-32 bg-gradient-to-r from-[#D4AF37] to-transparent rounded-full" />
                    </div>

                    {settings.metadata?.showTimer && (
                        <div className="flex items-center gap-4 bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
                            <div className="flex items-center gap-2 mr-2">
                                <Clock className="h-5 w-5 text-zinc-400" />
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">ENDS IN:</span>
                            </div>

                            <div className="flex items-center gap-3">
                                {[
                                    { label: 'D', value: timeLeft.days },
                                    { label: 'H', value: timeLeft.hours },
                                    { label: 'M', value: timeLeft.minutes },
                                    { label: 'S', value: timeLeft.seconds },
                                ].map((time, i) => (
                                    <div key={i} className="flex items-center">
                                        {(i > 0 || time.value > 0) && (
                                            <>
                                                <div className="relative">
                                                    <div className="bg-black border border-zinc-700/50 rounded-lg w-12 h-14 flex items-center justify-center">
                                                        <span className="text-2xl font-black text-white font-mono tracking-tighter">
                                                            {String(time.value).padStart(2, '0')}
                                                        </span>
                                                    </div>
                                                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-zinc-500">
                                                        {time.label}
                                                    </span>
                                                </div>
                                                {i < 3 && (
                                                    <span className="mx-2 text-2xl font-bold text-zinc-700 mt-[-10px]">:</span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                    {products.slice(0, 5).map((product, index) => (
                        <FlashSaleCard
                            key={product.id}
                            product={product}
                            index={index}
                            urgencyText={settings.metadata?.urgencyText}
                            buttonText={settings.metadata?.buttonText}
                        />
                    ))}
                </div>

                <div className="mt-12 bg-gradient-to-r from-zinc-900 via-[#1a1a1a] to-zinc-900 border border-white/5 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                    <div className="flex items-center gap-4">
                        <div className="bg-[#D4AF37] p-3 rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                            <Gift className="h-8 w-8 text-black" />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-white">Unlock VIP Access</h4>
                            <p className="text-sm text-zinc-400">Join our newsletter to get flash sale alerts 1 hour earlier.</p>
                        </div>
                    </div>

                    <Button size="lg" className="bg-white hover:bg-[#D4AF37] text-black font-black italic tracking-tight rounded-xl px-8 transition-all hover:scale-110">
                        JOIN THE CLUB
                        <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </div>
        </section>
    )
}
