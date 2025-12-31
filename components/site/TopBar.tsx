'use client'

import Link from 'next/link';
import { Clock, User, MapPin, Phone, Mail, Loader2 } from 'lucide-react';
import { useNavigationLoading } from '@/hooks/use-navigation-loading';
import { useState } from 'react';

export function TopBar() {
  const { handleNavigation } = useNavigationLoading();
  const [clickedLink, setClickedLink] = useState<string | null>(null);
    return (
        <div className="bg-secondary text-secondary-foreground">
            <div className="container mx-auto px-4">
                <div className="flex h-10 items-center justify-between text-sm">
                    {/* Left: Store Hours */}
                    <div className="hidden items-center space-x-4 md:flex">
                        <div className="flex items-center space-x-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Mon-Fri: 10AM-6PM PST</span>
                        </div>
                        <span className="text-secondary-foreground/50">|</span>
                        <div className="flex items-center space-x-1">
                            <Phone className="h-3.5 w-3.5" />
                            <Link href="tel:+17025551234" className="hover:underline">
                                (702) 555-1234
                            </Link>
                        </div>
                    </div>

                    {/* Mobile: Phone */}
                    <div className="flex items-center space-x-1 md:hidden">
                        <Phone className="h-3.5 w-3.5" />
                        <Link href="tel:+17025551234" className="hover:underline">
                            Call Us
                        </Link>
                    </div>

                    {/* Right: Quick Links */}
                    <nav className="flex items-center space-x-4">
                        <button
                            onClick={(e) => {
                                e.preventDefault()
                                setClickedLink('/account')
                                handleNavigation('/account')
                            }}
                            className="hidden items-center space-x-1 hover:underline sm:flex disabled:opacity-50"
                            disabled={clickedLink === '/account'}
                        >
                            {clickedLink === '/account' ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <User className="h-3.5 w-3.5" />
                            )}
                            <span>My Account</span>
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault()
                                setClickedLink('/about')
                                handleNavigation('/about')
                            }}
                            className="hidden hover:underline lg:block disabled:opacity-50"
                            disabled={clickedLink === '/about'}
                        >
                            {clickedLink === '/about' ? (
                                <span className="flex items-center gap-1">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Loading...
                                </span>
                            ) : (
                                'About Us'
                            )}
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault()
                                setClickedLink('/contact')
                                handleNavigation('/contact')
                            }}
                            className="hidden hover:underline lg:block disabled:opacity-50"
                            disabled={clickedLink === '/contact'}
                        >
                            {clickedLink === '/contact' ? (
                                <span className="flex items-center gap-1">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Loading...
                                </span>
                            ) : (
                                'Contact'
                            )}
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault()
                                setClickedLink('/blog')
                                handleNavigation('/blog')
                            }}
                            className="hover:underline disabled:opacity-50"
                            disabled={clickedLink === '/blog'}
                        >
                            {clickedLink === '/blog' ? (
                                <span className="flex items-center gap-1">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Loading...
                                </span>
                            ) : (
                                'Blog'
                            )}
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault()
                                setClickedLink('/locations')
                                handleNavigation('/locations')
                            }}
                            className="flex items-center space-x-1 hover:underline disabled:opacity-50"
                            disabled={clickedLink === '/locations'}
                        >
                            {clickedLink === '/locations' ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <MapPin className="h-3.5 w-3.5" />
                            )}
                            <span className="hidden sm:inline">
                                {clickedLink === '/locations' ? 'Loading...' : 'Locations'}
                            </span>
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
}
