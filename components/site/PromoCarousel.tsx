'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, CreditCard, Truck, Percent, Gift } from 'lucide-react';

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
        title: 'Holiday Special: Extra 5% Off',
        description: 'Use code HOLIDAY2024 at checkout. Limited time!',
        link: '/shop',
        linkText: 'Shop Now',
    },
];

export function PromoCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % promoSlides.length);
    }, []);

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + promoSlides.length) % promoSlides.length);
    };

    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [isPaused, nextSlide]);

    const slide = promoSlides[currentSlide];

    return (
        <div
            className="bg-secondary text-secondary-foreground"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="container mx-auto px-4">
                <div className="relative flex h-12 items-center justify-center">
                    {/* Previous Button */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-0 p-2 hover:bg-secondary-foreground/10 rounded-full transition-colors"
                        aria-label="Previous promotion"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    {/* Slide Content */}
                    <div className="flex items-center space-x-3 text-sm">
                        <span className="hidden sm:block">{slide.icon}</span>
                        <span className="font-semibold">{slide.title}</span>
                        <span className="hidden md:block text-secondary-foreground/80">
                            {slide.description}
                        </span>
                        {slide.link && (
                            <Link
                                href={slide.link}
                                className="font-medium underline underline-offset-2 hover:no-underline"
                            >
                                {slide.linkText}
                            </Link>
                        )}
                    </div>

                    {/* Next Button */}
                    <button
                        onClick={nextSlide}
                        className="absolute right-0 p-2 hover:bg-secondary-foreground/10 rounded-full transition-colors"
                        aria-label="Next promotion"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>

                    {/* Slide Indicators */}
                    <div className="absolute bottom-1 flex space-x-1">
                        {promoSlides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`h-1 w-4 rounded-full transition-colors ${index === currentSlide
                                        ? 'bg-secondary-foreground'
                                        : 'bg-secondary-foreground/30'
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
