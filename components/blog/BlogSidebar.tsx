'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { BlogPost, BlogCategory } from '@/data/blogPosts';
import { Input } from '@/components/ui/input';

interface BlogSidebarProps {
    recentPosts: BlogPost[];
    categories: BlogCategory[];
    currentCategory?: string;
    onSearch?: (query: string) => void;
    showSearch?: boolean;
}

export function BlogSidebar({
    recentPosts,
    categories,
    currentCategory,
    onSearch,
    showSearch = true,
}: BlogSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSearch) {
            onSearch(searchQuery);
        }
    };

    return (
        <aside className="space-y-8">
            {/* Search */}
            {showSearch && (
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Search</h3>
                    <form onSubmit={handleSearchSubmit}>
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="Search posts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pr-10"
                            />
                            <button
                                type="submit"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                            >
                                <Search className="h-4 w-4" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Recent Posts */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Posts</h3>
                <ul className="space-y-4">
                    {recentPosts.map((post) => (
                        <li key={post.id}>
                            <Link
                                href={`/blog/${post.slug}`}
                                className="group block"
                            >
                                <h4 className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors line-clamp-2">
                                    {post.title}
                                </h4>
                                <time className="text-xs text-gray-500">
                                    {new Date(post.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </time>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Categories */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Blog Post Categories</h3>
                <ul className="space-y-2">
                    <li>
                        <Link
                            href="/blog"
                            className={`flex items-center justify-between py-1 text-sm transition-colors ${!currentCategory
                                    ? 'font-medium text-primary'
                                    : 'text-gray-600 hover:text-primary'
                                }`}
                        >
                            <span>All Categories</span>
                        </Link>
                    </li>
                    {categories.map((category) => (
                        <li key={category.slug}>
                            <Link
                                href={`/blog?category=${category.slug}`}
                                className={`flex items-center justify-between py-1 text-sm transition-colors ${currentCategory === category.slug
                                        ? 'font-medium text-primary'
                                        : 'text-gray-600 hover:text-primary'
                                    }`}
                            >
                                <span>{category.name}</span>
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                                    {category.count}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}
