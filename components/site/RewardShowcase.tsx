'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Star, Trophy, ArrowRight, Loader2 } from 'lucide-react'
import { PremiumCoupon } from './PremiumCoupon'
import Link from 'next/link'

export function RewardShowcase() {
    const [settings, setSettings] = useState<any>(null)
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/admin/homepage-content/rewards-vouchers')
                if (response.ok) {
                    const data = await response.json()
                    setSettings(data)
                }
            } catch (error) {
                console.error('Error fetching rewards settings:', error)
            } finally {
                setLoaded(true)
            }
        }
        fetchSettings()
    }, [])

    if (!loaded || !settings?.isVisible) return null

    const coupons = settings.metadata?.coupons || []

    return (
        <section className="py-20 bg-[#050505] relative overflow-hidden">
            {/* Background Decorative Gradient */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-30 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D4AF37]/10 rounded-full blur-[150px] animate-pulse" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col items-center text-center mb-16 space-y-4">
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full">
                        <Sparkles className="h-4 w-4 text-[#D4AF37]" />
                        <span className="text-[10px] font-black tracking-[0.3em] text-[#D4AF37] uppercase">JSC Platinum Rewards</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter max-w-4xl leading-none">
                        {settings.title ? settings.title.split('<br />').map((line: string, i: number) => (
                            <span key={i}>
                                {line}
                                {i < settings.title.split('<br />').length - 1 && <br />}
                            </span>
                        )) : (
                            <>
                                EXCLUSIVE PRIVILEGES FOR <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-amber-200 to-[#D4AF37]">
                                    PROFESSIONAL MUSICIANS
                                </span>
                            </>
                        )}
                    </h2>
                    {settings.subtitle && (
                        <p className="text-zinc-500 max-w-2xl font-medium">
                            {settings.subtitle}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                    {coupons.map((coupon: any) => (
                        <PremiumCoupon
                            key={coupon.id}
                            amount={coupon.amount}
                            code={coupon.code}
                            label={coupon.label}
                            description={coupon.description}
                            minSpend={coupon.minSpend}
                            expiryDate={coupon.expiryDate}
                        />
                    ))}
                </div>

                {/* Benefits Grid */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-10 border-t border-white/5 pt-16">
                    <div className="flex gap-5 group">
                        <div className="w-14 h-14 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:border-[#D4AF37]/50 transition-colors">
                            <Trophy className="h-6 w-6 text-[#D4AF37]" />
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-2">Lifetime Support</h4>
                            <p className="text-zinc-500 text-sm leading-relaxed">Every professional purchase comes with lifetime expert maintenance assistance.</p>
                        </div>
                    </div>
                    <div className="flex gap-5 group">
                        <div className="w-14 h-14 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:border-[#D4AF37]/50 transition-colors">
                            <Star className="h-6 w-6 text-[#D4AF37]" />
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-2">VIP Audition</h4>
                            <p className="text-zinc-500 text-sm leading-relaxed">Book a private virtual audition session with our specialists for any premium instrument.</p>
                        </div>
                    </div>
                    <div className="flex gap-5 group">
                        <div className="w-14 h-14 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:border-[#D4AF37]/50 transition-colors">
                            <ArrowRight className="h-6 w-6 text-[#D4AF37]" />
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-2">Priority Shipping</h4>
                            <p className="text-zinc-500 text-sm leading-relaxed">Insured express worldwide shipping priority for all Golden Ticket holders.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <Link href="/shop" className="inline-flex items-center gap-2 text-[#D4AF37] font-black italic tracking-tighter text-xl group">
                        EXPLORE PROFESSIONAL COLLECTION
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
