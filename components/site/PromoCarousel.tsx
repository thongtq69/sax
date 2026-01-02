'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PromoBanner {
    id: string;
    title: string;
    description: string;
    image: string;
    ctaText: string;
    ctaLink: string;
}

interface PromoCarouselProps {
    promos?: PromoBanner[];
}

export function PromoCarousel({ promos = [] }: PromoCarouselProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    // If no promos, show empty state
    if (promos.length === 0) {
        return null;
    }

    const nextSlide = useCallback(() => {
        if (isAnimating || promos.length === 0) return;
        setIsAnimating(true);
        setCurrentSlide((prev) => (prev + 1) % promos.length);
        setTimeout(() => setIsAnimating(false), 500);
    }, [isAnimating, promos.length]);

    const prevSlide = () => {
        if (isAnimating || promos.length === 0) return;
        setIsAnimating(true);
        setCurrentSlide((prev) => (prev - 1 + promos.length) % promos.length);
        setTimeout(() => setIsAnimating(false), 500);
    };

    useEffect(() => {
        if (isPaused || promos.length === 0) return;
        const interval = setInterval(nextSlide, 4000);
        return () => clearInterval(interval);
    }, [isPaused, nextSlide, promos.length]);

    const slide = promos[currentSlide];

    if (!slide) return null;

    return (
        <div
            className="bg-[#2f3f4f] text-white relative overflow-hidden border-b border-black/10"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Animated background shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            
            {/* Decorative dots pattern */}
            <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
            }} />

            <div className="container mx-auto px-4 relative">
                <div className="relative flex min-h-[48px] items-center justify-center py-2">
                    {/* Previous Button */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-0 p-2 hover:bg-white/10 rounded-full transition-all duration-300 hover:scale-110 group"
                        aria-label="Previous promotion"
                    >
                        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    </button>

                    {/* Slide Content with animation */}
                    <div 
                        key={currentSlide}
                        className="flex flex-wrap items-center justify-center gap-2 text-[11px] md:text-sm animate-fade-in-up text-center"
                        style={{ animationDuration: '0.4s' }}
                    >
                        <span className="font-semibold font-display uppercase tracking-[0.22em] text-[#D4AF37]">
                            {slide.title}
                        </span>
                        <span className="hidden md:inline text-white/50">-</span>
                        <span className="hidden md:inline text-white/85 font-body">
                            {slide.description}
                        </span>
                        <span className="md:hidden text-white/85 font-body">
                            {slide.description}
                        </span>
                        {slide.ctaLink && (
                            <Link
                                href={slide.ctaLink}
                                className="rounded-full border border-[#D4AF37] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#2c3e50] transition-colors duration-300"
                                prefetch={true}
                            >
                                {slide.ctaText}
                            </Link>
                        )}
                    </div>

                    {/* Next Button */}
                    <button
                        onClick={nextSlide}
                        className="absolute right-0 p-2 hover:bg-white/10 rounded-full transition-all duration-300 hover:scale-110 group"
                        aria-label="Next promotion"
                    >
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </button>

                    {/* Slide Indicators with animation */}
                    <div className="absolute bottom-1.5 flex space-x-1.5">
                        {promos.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => !isAnimating && setCurrentSlide(index)}
                                className={`h-1.5 rounded-full transition-all duration-500 ${
                                    index === currentSlide
                                        ? 'bg-[#D4AF37] w-6'
                                        : 'bg-white/30 w-3 hover:bg-white/50'
                                }`}
                                aria-label={`Go to promotion ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
