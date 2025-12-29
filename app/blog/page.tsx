import { Suspense } from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ChevronRight, Home } from 'lucide-react';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { BlogPagination } from '@/components/blog/BlogPagination';
import {
    getBlogPosts,
    getRecentPosts,
    getCategoriesWithCount,
    paginatePosts,
} from '@/data/blogPosts';

export const metadata: Metadata = {
    title: "Dave Kessler's Music Blog | Specialty Music Store",
    description:
        "Insights, tips, and news from the world of wind instruments. Product reviews, playing techniques, and industry updates.",
};

interface BlogPageProps {
    searchParams: { category?: string; page?: string };
}

function BlogContent({ searchParams }: BlogPageProps) {
    const categorySlug = searchParams.category;
    const currentPage = parseInt(searchParams.page || '1', 10);

    // Get all posts, optionally filtered by category
    const allPosts = getBlogPosts(
        categorySlug?.replace(/-/g, ' ')
    );

    // Paginate posts
    const { posts, totalPages, hasNextPage, hasPrevPage } = paginatePosts(
        allPosts,
        currentPage,
        9
    );

    // Get sidebar data
    const recentPosts = getRecentPosts(5);
    const categories = getCategoriesWithCount();

    // Find category name for display
    const categoryName = categorySlug
        ? categories.find((c) => c.slug === categorySlug)?.name
        : null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary/5 to-primary/10 py-12 md:py-16">
                <div className="container mx-auto px-4">
                    {/* Breadcrumb */}
                    <nav className="mb-6 flex items-center text-sm text-gray-600">
                        <Link
                            href="/"
                            className="flex items-center hover:text-primary transition-colors"
                        >
                            <Home className="h-4 w-4 mr-1" />
                            Home
                        </Link>
                        <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
                        <span className="text-gray-900 font-medium">Blog</span>
                        {categoryName && (
                            <>
                                <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
                                <span className="text-gray-900 font-medium">{categoryName}</span>
                            </>
                        )}
                    </nav>

                    {/* Hero Content */}
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Dave Kessler's Music Blog
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Just one guy's view on this crazy industry!
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Blog Grid */}
                    <div className="flex-1">
                        {categoryName && (
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Category: {categoryName}
                                </h2>
                                <Link
                                    href="/blog"
                                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                                >
                                    Clear filter ×
                                </Link>
                            </div>
                        )}

                        {posts.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                    {posts.map((post) => (
                                        <BlogCard key={post.id} post={post} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-8">
                                        <BlogPagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            searchParams={categorySlug ? { category: categorySlug } : {}}
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">
                                    No posts found in this category.
                                </p>
                                <Link
                                    href="/blog"
                                    className="mt-4 inline-block text-primary hover:text-primary/80 transition-colors"
                                >
                                    View all posts →
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="w-full lg:w-80 flex-shrink-0">
                        <BlogSidebar
                            recentPosts={recentPosts}
                            categories={categories}
                            currentCategory={categorySlug}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}

export default function BlogPage({ searchParams }: BlogPageProps) {
    return (
        <Suspense fallback={<BlogPageSkeleton />}>
            <BlogContent searchParams={searchParams} />
        </Suspense>
    );
}

function BlogPageSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50">
            <section className="bg-gradient-to-r from-primary/5 to-primary/10 py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center animate-pulse">
                        <div className="h-12 bg-gray-200 rounded w-96 mx-auto mb-4" />
                        <div className="h-6 bg-gray-200 rounded w-64 mx-auto" />
                    </div>
                </div>
            </section>
            <section className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse"
                        >
                            <div className="aspect-square bg-gray-200" />
                            <div className="p-5 space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-24" />
                                <div className="h-6 bg-gray-200 rounded" />
                                <div className="h-16 bg-gray-200 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
