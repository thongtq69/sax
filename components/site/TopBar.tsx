'use client'

import Link from 'next/link';
import { User, Facebook, Instagram, Youtube, Twitter } from 'lucide-react';

export function TopBar() {
    return (
        <div className="bg-[#2c3e50] text-white">
            <div className="container mx-auto px-4">
                <div className="flex h-9 items-center justify-between text-xs md:text-sm">
                    {/* Social Media Icons */}
                    <div className="flex items-center space-x-2">
                        {[
                            { href: 'https://facebook.com', icon: Facebook, label: 'Facebook' },
                            { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
                            { href: 'https://youtube.com', icon: Youtube, label: 'YouTube' },
                            { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
                        ].map((social) => (
                            <Link
                                key={social.href}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-full bg-white/10 p-1.5 hover:bg-white/20 transition-all duration-300 hover:scale-110"
                                aria-label={social.label}
                            >
                                <social.icon className="h-3 w-3 text-[#D4AF37]" />
                            </Link>
                        ))}
                    </div>

                    {/* Quick Links */}
                    <nav className="flex items-center space-x-4 md:space-x-6">
                        <Link
                            href="/account"
                            className="flex items-center space-x-1 hover:text-[#D4AF37] transition-colors"
                            prefetch={true}
                        >
                            <User className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">My Account</span>
                        </Link>
                        <Link
                            href="/about"
                            className="hover:text-[#D4AF37] transition-colors hidden sm:block"
                            prefetch={true}
                        >
                            About Us
                        </Link>
                        <Link
                            href="/contact"
                            className="hover:text-[#D4AF37] transition-colors"
                            prefetch={true}
                        >
                            Contact
                        </Link>
                        <Link
                            href="/blog"
                            className="hover:text-[#D4AF37] transition-colors"
                            prefetch={true}
                        >
                            Blog
                        </Link>
                    </nav>
                </div>
            </div>
        </div>
    );
}
