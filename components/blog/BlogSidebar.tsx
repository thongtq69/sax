'use client';

import Link from 'next/link';
import { Search, Clock, Tag, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getRecentPosts, blogCategories, getCategoryPostCounts, formatBlogDate } from '@/data/blogPosts';

interface BlogSidebarProps {
    showSearch?: boolean;
    currentCategory?: string;
}

export function BlogSidebar({ showSearch = false, currentCategory }: BlogSidebarProps) {
    const recentPosts = getRecentPosts(4);
    const categoryCounts = getCategoryPostCounts();

    return (
        <aside className="space-y-6 lg:space-y-8">
            {/* Search */}
            {showSearch && (
                <div className="rounded-lg border-2 border-primary/20 bg-white p-4 sm:p-5 lg:p-6 shadow-sm">
                    <h3 className="mb-3 sm:mb-4 font-display text-base sm:text-lg font-bold text-secondary flex items-center gap-2">
                        <Search className="h-4 w-4 text-primary" />
                        Search Articles
                    </h3>
                    <div className="relative">
                        <Input
                            type="search"
                            placeholder="Search..."
                            className="pr-10 border-primary/30 focus:border-primary text-sm"
                        />
                        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                </div>
            )}

            {/* Recent Posts */}
            <div className="rounded-lg border-2 border-primary/20 bg-white p-4 sm:p-5 lg:p-6 shadow-sm">
                <h3 className="mb-3 sm:mb-4 font-display text-base sm:text-lg font-bold text-secondary flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Recent Articles
                </h3>

                {/* Decorative Line */}
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <div className="h-0.5 w-8 bg-primary" />
                    <div className="h-0.5 flex-1 bg-primary/20" />
                </div>

                <ul className="space-y-3 sm:space-y-4">
                    {recentPosts.map((post, index) => {
                        const dateInfo = formatBlogDate(post.date);
                        return (
                            <li key={post.id} className="group">
                                <Link href={`/blog/${post.slug}`} className="block">
                                    <div className="flex gap-3">
                                        {/* Number Badge */}
                                        <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full border border-primary/30 text-xs sm:text-sm font-bold text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                            {index + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs sm:text-sm font-semibold text-secondary group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                                {post.title}
                                            </h4>
                                            <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">
                                                {dateInfo.full}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Categories */}
            <div className="rounded-lg border-2 border-primary/20 bg-white p-4 sm:p-5 lg:p-6 shadow-sm">
                <h3 className="mb-3 sm:mb-4 font-display text-base sm:text-lg font-bold text-secondary flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    Categories
                </h3>

                {/* Decorative Line */}
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <div className="h-0.5 w-8 bg-primary" />
                    <div className="h-0.5 flex-1 bg-primary/20" />
                </div>

                {/* Vertical list on all screens */}
                <ul className="space-y-1">
                    {blogCategories.map((category) => {
                        const count = categoryCounts[category.slug] || 0;
                        const isActive = currentCategory === category.slug;

                        return (
                            <li key={category.slug}>
                                <Link
                                    href={`/blog?category=${category.slug}`}
                                    className={`group flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${isActive
                                            ? 'bg-primary text-white'
                                            : 'hover:bg-primary/10 text-secondary'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <ChevronRight className={`h-3 w-3 transition-transform ${isActive ? '' : 'group-hover:translate-x-1'}`} />
                                        <span className="font-medium">{category.name}</span>
                                    </div>
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${isActive ? 'bg-white/20' : 'bg-primary/10 text-primary'
                                        }`}>
                                        {count}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Newsletter CTA */}
            <div className="rounded-lg bg-gradient-to-br from-primary to-primary/80 p-4 sm:p-5 lg:p-6 text-white shadow-lg">
                <h3 className="mb-2 font-display text-base sm:text-lg font-bold">
                    Stay Updated
                </h3>
                <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-white/80">
                    Subscribe to receive the latest articles and exclusive offers.
                </p>
                <Input
                    type="email"
                    placeholder="Your email address"
                    className="mb-3 border-white/30 bg-white/10 text-white placeholder:text-white/50 text-sm"
                />
                <button className="w-full rounded bg-white py-2 text-xs sm:text-sm font-semibold text-primary hover:bg-white/90 transition-colors">
                    Subscribe
                </button>
            </div>
        </aside>
    );
}
