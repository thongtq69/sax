'use client'

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { getBlogPosts, transformBlogPost } from '@/lib/api';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { BlogPagination } from '@/components/blog/BlogPagination';
import { ChevronRight, BookOpen } from 'lucide-react';

interface BlogPageProps {
    searchParams: { page?: string; category?: string };
}

export default function BlogPage({ searchParams }: BlogPageProps) {
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const currentPage = parseInt(searchParams?.page || '1', 10);
    const categoryFilter = searchParams?.category;
    const itemsPerPage = 6;

    useEffect(() => {
        async function fetchPosts() {
            try {
                const response = await getBlogPosts({
                    category: categoryFilter,
                    page: currentPage,
                    limit: itemsPerPage,
                });
                setPosts(response.posts.map(transformBlogPost));
            } catch (error) {
                console.error('Error fetching blog posts:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchPosts();
    }, [currentPage, categoryFilter]);

    // Calculate pagination
    const totalPosts = posts.length; // This should come from API pagination
    const totalPages = Math.ceil(totalPosts / itemsPerPage);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    const categoryName = categoryFilter
        ? categoryFilter.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        : null;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section - Vintage Style */}
            <section className="relative bg-primary py-6 sm:py-8 md:py-10 overflow-hidden">
                {/* Music Notes Pattern using musicnote.svg */}
                <div className="absolute inset-0 opacity-[0.08]">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("/musicnote.svg")`,
                        backgroundSize: '80px 80px',
                        backgroundRepeat: 'repeat',
                    }} />
                </div>

                {/* Art Deco Lines */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-secondary opacity-40" />

                <div className="container relative mx-auto px-4 text-center">
                    {/* Breadcrumbs */}
                    <nav className="mb-4 flex items-center justify-center gap-2 text-sm text-white/70">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-white font-medium">Blog</span>
                        {categoryName && (
                            <>
                                <ChevronRight className="h-4 w-4" />
                                <span className="text-white font-medium">{categoryName}</span>
                            </>
                        )}
                    </nav>

                    {/* Icon */}
                    <div className="mb-2 sm:mb-3 inline-flex items-center justify-center rounded-full border-2 border-white/30 bg-white/10 p-2 sm:p-3">
                        <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>

                    {/* Title */}
                    <h1 className="mb-2 sm:mb-3 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white font-display">
                        {categoryName ? `${categoryName} Articles` : "James's Blog"}
                    </h1>

                    {/* Decorative Divider */}
                    <div className="flex items-center justify-center gap-3 mb-2 sm:mb-3">
                        <div className="h-px w-8 sm:w-12 bg-white/40" />
                        <span className="text-lg sm:text-xl text-white/60">♪</span>
                        <div className="h-px w-8 sm:w-12 bg-white/40" />
                    </div>

                    <p className="mx-auto max-w-xl text-xs sm:text-sm md:text-base text-white/80 px-2">
                        Expert insights, reviews, and tips from our team of professional musicians.
                    </p>
                </div>

                {/* Bottom Lines */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary opacity-40" />
            </section>

            {/* Main Content */}
            <section className="py-8 sm:py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 lg:gap-12">
                        {/* Blog Posts - Always first */}
                        <div className="lg:col-span-2">
                            {/* Featured Post (First Post) */}
                            {posts.length > 0 && currentPage === 1 && !categoryFilter && (
                                <div className="mb-8 sm:mb-12">
                                    <div className="mb-4 sm:mb-6 flex items-center gap-3">
                                        <h2 className="text-lg sm:text-xl font-bold text-secondary font-display">Featured Article</h2>
                                        <div className="h-px flex-1 bg-primary/20" />
                                        <span className="text-primary">★</span>
                                    </div>
                                    <BlogCard post={posts[0]} featured />
                                </div>
                            )}

                            {/* Section Header */}
                            <div className="mb-6 sm:mb-8 flex items-center gap-3">
                                <h2 className="text-lg sm:text-xl font-bold text-secondary font-display">
                                    {categoryFilter ? `${categoryName} Articles` : 'Latest Articles'}
                                </h2>
                                <div className="h-px flex-1 bg-primary/20" />
                                <span className="text-primary">♫</span>
                            </div>

                            {/* Posts Grid */}
                            <Suspense fallback={<BlogSkeleton />}>
                                {posts.length > 0 ? (
                                    <>
                                        <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 min-[480px]:grid-cols-2">
                                            {(currentPage === 1 && !categoryFilter ? posts.slice(1) : posts).map((post) => (
                                                <BlogCard key={post.id} post={post} />
                                            ))}
                                        </div>

                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className="mt-12">
                                                <BlogPagination
                                                    currentPage={currentPage}
                                                    totalPages={totalPages}
                                                />
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-12 text-center">
                                        <BookOpen className="mx-auto mb-4 h-12 w-12 text-primary/40" />
                                        <p className="text-lg font-medium text-secondary">No articles found</p>
                                        <p className="mt-2 text-muted-foreground">
                                            {categoryFilter
                                                ? 'No articles in this category yet.'
                                                : 'Check back soon for new content.'
                                            }
                                        </p>
                                        {categoryFilter && (
                                            <Link
                                                href="/blog"
                                                className="mt-4 inline-block rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
                                            >
                                                View All Articles
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </Suspense>
                        </div>

                        {/* Sidebar - Always after content */}
                        <div className="lg:col-span-1">
                            <BlogSidebar showSearch currentCategory={categoryFilter} />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function BlogSkeleton() {
    return (
        <div className="grid gap-8 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse rounded-lg border border-primary/20 bg-white p-4">
                    <div className="aspect-[4/3] rounded bg-gray-200 mb-4" />
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
            ))}
        </div>
    );
}
