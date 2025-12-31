'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigationLoading } from '@/hooks/use-navigation-loading';

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
    const [clickedLink, setClickedLink] = useState<string | null>(null);
    const { handleNavigation } = useNavigationLoading();
    const router = useRouter();

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
            className="bg-gradient-to-r from-secondary via-secondary to-secondary text-secondary-foreground relative overflow-hidden"
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
                <div className="relative flex h-14 items-center justify-center">
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
                        className="flex items-center space-x-3 text-sm animate-fade-in-up"
                        style={{ animationDuration: '0.4s' }}
                    >
                        <span className="font-semibold font-display tracking-wide">{slide.title}</span>
                        <span className="hidden md:block text-secondary-foreground/80 font-body">
                            {slide.description}
                        </span>
                        {slide.ctaLink && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault()
                                    setClickedLink(slide.ctaLink)
                                    handleNavigation(slide.ctaLink)
                                }}
                                className="font-medium underline-animate relative after:bg-accent hover:text-accent transition-colors duration-300 flex items-center gap-1 disabled:opacity-50"
                                disabled={clickedLink === slide.ctaLink}
                            >
                                {clickedLink === slide.ctaLink ? (
                                    <>
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        {slide.ctaText} →
                                    </>
                                )}
                            </button>
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
                                        ? 'bg-accent w-6'
                                        : 'bg-secondary-foreground/30 w-3 hover:bg-secondary-foreground/50'
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
