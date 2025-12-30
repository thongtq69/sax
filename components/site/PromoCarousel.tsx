'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, CreditCard, Truck, Percent, Gift, Sparkles, Award } from 'lucide-react';

interface PromoSlide {
    id: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    link?: string;
    linkText?: string;
}

const promoSlides: PromoSlide[] = [
    {
        id: '1',
        icon: <Percent className="h-5 w-5" />,
        title: '0% APR Financing Available',
        description: 'On orders over $500 with approved credit. Apply today!',
        link: '/financing',
        linkText: 'Learn More',
    },
    {
        id: '2',
        icon: <Truck className="h-5 w-5" />,
        title: 'Free Shipping on Orders $500+',
        description: 'Fast, insured delivery on all qualifying orders.',
        link: '/shipping',
        linkText: 'Details',
    },
    {
        id: '3',
        icon: <CreditCard className="h-5 w-5" />,
        title: '12-Month Payment Plans',
        description: 'Split your purchase into easy monthly payments.',
        link: '/financing',
        linkText: 'Apply Now',
    },
    {
        id: '4',
        icon: <Gift className="h-5 w-5" />,
        title: 'Special Offer: Extra 5% Off',
        description: 'Use code WELCOME5 at checkout. Limited time!',
        link: '/shop',
        linkText: 'Shop Now',
    },
    {
        id: '5',
        icon: <Award className="h-5 w-5" />,
        title: 'Professional Setup Included',
        description: 'Every instrument tested and adjusted by our experts.',
        link: '/about',
        linkText: 'Learn More',
    },
    {
        id: '6',
        icon: <Sparkles className="h-5 w-5" />,
        title: '100% Quality Guarantee',
        description: 'Free returns and exchanges within 30 days.',
        link: '/returns',
        linkText: 'Policy',
    },
];

export function PromoCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const nextSlide = useCallback(() => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentSlide((prev) => (prev + 1) % promoSlides.length);
        setTimeout(() => setIsAnimating(false), 500);
    }, [isAnimating]);

    const prevSlide = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentSlide((prev) => (prev - 1 + promoSlides.length) % promoSlides.length);
        setTimeout(() => setIsAnimating(false), 500);
    };

    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(nextSlide, 4000);
        return () => clearInterval(interval);
    }, [isPaused, nextSlide]);

    const slide = promoSlides[currentSlide];

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
                        <span className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-white/10 animate-pulse">
                            {slide.icon}
                        </span>
                        <span className="font-semibold font-display tracking-wide">{slide.title}</span>
                        <span className="hidden md:block text-secondary-foreground/80 font-body">
                            {slide.description}
                        </span>
                        {slide.link && (
                            <Link
                                href={slide.link}
                                className="font-medium underline-animate relative after:bg-accent hover:text-accent transition-colors duration-300"
                            >
                                {slide.linkText} →
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
                        {promoSlides.map((_, index) => (
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
