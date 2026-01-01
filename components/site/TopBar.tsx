'use client'

import Link from 'next/link';
import { Clock, User, MapPin, Phone, Mail, Facebook, Instagram, Youtube, Twitter } from 'lucide-react';

export function TopBar() {
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

                    {/* Center: Social Media Icons */}
                    <div className="hidden md:flex items-center justify-center space-x-2 absolute left-1/2 -translate-x-1/2">
                        <Link
                            href="https://facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-white/10 p-1.5 hover:bg-white/20 transition-all duration-300 hover:scale-110"
                            aria-label="Facebook"
                        >
                            <Facebook className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-white/10 p-1.5 hover:bg-white/20 transition-all duration-300 hover:scale-110"
                            aria-label="Instagram"
                        >
                            <Instagram className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                            href="https://youtube.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-white/10 p-1.5 hover:bg-white/20 transition-all duration-300 hover:scale-110"
                            aria-label="YouTube"
                        >
                            <Youtube className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-white/10 p-1.5 hover:bg-white/20 transition-all duration-300 hover:scale-110"
                            aria-label="Twitter"
                        >
                            <Twitter className="h-3.5 w-3.5" />
                        </Link>
                    </div>

                    {/* Right: Quick Links */}
                    <nav className="flex items-center space-x-4">
                        <Link
                            href="/account"
                            className="hidden items-center space-x-1 hover:underline sm:flex"
                            prefetch={true}
                        >
                            <User className="h-3.5 w-3.5" />
                            <span>My Account</span>
                        </Link>
                        <Link
                            href="/about"
                            className="hidden hover:underline lg:block"
                            prefetch={true}
                        >
                            About Us
                        </Link>
                        <Link
                            href="/contact"
                            className="hidden hover:underline lg:block"
                            prefetch={true}
                        >
                            Contact
                        </Link>
                        <Link
                            href="/blog"
                            className="hover:underline"
                            prefetch={true}
                        >
                            Blog
                        </Link>
                        <Link
                            href="/locations"
                            className="flex items-center space-x-1 hover:underline"
                            prefetch={true}
                        >
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Locations</span>
                        </Link>
                    </nav>
                </div>
            </div>
        </div>
    );
}
