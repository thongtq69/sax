'use client'

import { useState } from 'react'
import { Ticket, Copy, Check, Info, Calendar, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface PremiumCouponProps {
    code: string
    amount: string
    label: string
    expiryDate?: string
    description?: string
    minSpend?: number
}

export function PremiumCoupon({
    code,
    amount,
    label,
    expiryDate = "2026-03-31",
    description,
    minSpend
}: PremiumCouponProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="relative group w-full max-w-sm">
            {/* Glow Effect Background */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#D4AF37]/50 via-amber-200/50 to-[#D4AF37]/50 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />

            {/* Main Coupon Body */}
            <div className="relative flex flex-col bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">

                {/* Top Section - Decorative & Branding */}
                <div className="relative h-24 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-zinc-900 border-b border-dashed border-white/20 p-5 flex items-center justify-between overflow-hidden">
                    {/* Decorative semi-circles */}
                    <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 bg-[#0a0a0a] rounded-full border border-white/10" />
                    <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 bg-[#0a0a0a] rounded-full border border-white/10" />

                    <div className="z-10">
                        <div className="flex items-center gap-1.5 text-[#D4AF37] mb-1">
                            <Zap className="h-4 w-4 fill-current" />
                            <span className="text-[10px] font-black tracking-[0.3em] uppercase">Executive Reward</span>
                        </div>
                        <h3 className="text-3xl font-black text-white italic tracking-tighter">
                            {amount} <span className="text-sm not-italic font-bold text-zinc-500 uppercase">OFF</span>
                        </h3>
                    </div>

                    <div className="z-10 text-right">
                        <div className="bg-[#D4AF37] p-2 rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                            <Ticket className="h-6 w-6 text-black" />
                        </div>
                    </div>

                    {/* Golden Pattern Overlay */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                </div>

                {/* Bottom Section - Details & Code */}
                <div className="p-5 space-y-4">
                    <div>
                        <p className="text-sm font-bold text-zinc-100 mb-1">{label}</p>
                        {description && (
                            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                                {description}
                            </p>
                        )}
                        {minSpend && (
                            <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-zinc-400 bg-white/5 py-0.5 px-2 rounded-full border border-white/5">
                                <Info className="h-3 w-3" />
                                VALUED OVER ${minSpend.toLocaleString()}
                            </div>
                        )}
                    </div>

                    {/* Code Box */}
                    <div className="relative">
                        <div
                            className={`flex items-center justify-between bg-zinc-900/50 border-2 border-dashed rounded-xl p-3 transition-colors duration-500 ${copied ? 'border-green-500/50 bg-green-500/5' : 'border-[#D4AF37]/30'}`}
                        >
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Promotion Code</span>
                                <span className={`text-xl font-black font-mono tracking-[0.1em] transition-colors ${copied ? 'text-green-400' : 'text-white'}`}>
                                    {code}
                                </span>
                            </div>

                            <button
                                onClick={handleCopy}
                                className={`p-2.5 rounded-lg transition-all duration-300 ${copied ? 'bg-green-500 text-white' : 'bg-[#D4AF37] text-black hover:scale-110 active:scale-95'}`}
                            >
                                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Footer - Expiry */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <div className="flex items-center gap-2 text-zinc-500">
                            <Calendar className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Expires: {expiryDate}</span>
                        </div>
                        <Link href="/shop" className="text-[10px] font-black text-[#D4AF37] hover:text-white transition-colors tracking-widest uppercase">
                            REDEEM NOW
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
