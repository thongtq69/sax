import { Suspense } from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { getBlogPosts, paginatePosts, blogCategories } from '@/data/blogPosts';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { BlogPagination } from '@/components/blog/BlogPagination';
import { ChevronRight, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
    title: "James Sax Corner Blog | Expert Insights on Wind Instruments",
    description: "Read expert articles about saxophones, clarinets, flutes, and more. Tips, reviews, and industry insights from our team of professional musicians.",
};

interface BlogPageProps {
    searchParams: { page?: string; category?: string };
}

export default function BlogPage({ searchParams }: BlogPageProps) {
    const currentPage = parseInt(searchParams.page || '1', 10);
    const categoryFilter = searchParams.category;

    const allPosts = getBlogPosts(categoryFilter);
    const { posts, totalPages, hasNextPage, hasPrevPage } = paginatePosts(allPosts, currentPage, 6);

    const categoryName = categoryFilter
        ? blogCategories.find(c => c.slug === categoryFilter)?.name || categoryFilter
        : null;

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section - Vintage Style */}
            <section className="relative bg-primary py-16 overflow-hidden">
                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M40 0l40 40-40 40L0 40 40 0zm0 10L10 40l30 30 30-30-30-30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                </div>

                {/* Art Deco Lines */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-secondary opacity-40" />
                <div className="absolute top-2 left-0 right-0 h-0.5 bg-secondary opacity-20" />

                <div className="container relative mx-auto px-4 text-center">
                    {/* Breadcrumbs */}
                    <nav className="mb-6 flex items-center justify-center gap-2 text-sm text-white/70">
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
                    <div className="mb-4 inline-flex items-center justify-center rounded-full border-2 border-white/30 bg-white/10 p-4">
                        <BookOpen className="h-8 w-8 text-white" />
                    </div>

                    {/* Title */}
                    <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl font-display">
                        {categoryName ? `${categoryName} Articles` : "The Music Blog"}
                    </h1>

                    {/* Decorative Divider */}
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="h-px w-16 bg-white/40" />
                        <span className="text-2xl text-white/60">♪</span>
                        <div className="h-px w-16 bg-white/40" />
                    </div>

                    <p className="mx-auto max-w-2xl text-lg text-white/80">
                        Expert insights, reviews, and tips from our team of professional musicians.
                        Discover the stories behind the instruments.
                    </p>
                </div>

                {/* Bottom Lines */}
                <div className="absolute bottom-2 left-0 right-0 h-0.5 bg-secondary opacity-20" />
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-secondary opacity-40" />
            </section>

            {/* Main Content */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid gap-12 lg:grid-cols-3">
                        {/* Blog Posts */}
                        <div className="lg:col-span-2">
                            {/* Featured Post (First Post) */}
                            {posts.length > 0 && currentPage === 1 && !categoryFilter && (
                                <div className="mb-12">
                                    <div className="mb-6 flex items-center gap-3">
                                        <h2 className="text-xl font-bold text-secondary font-display">Featured Article</h2>
                                        <div className="h-px flex-1 bg-primary/20" />
                                        <span className="text-primary">★</span>
                                    </div>
                                    <BlogCard post={posts[0]} featured />
                                </div>
                            )}

                            {/* Section Header */}
                            <div className="mb-8 flex items-center gap-3">
                                <h2 className="text-xl font-bold text-secondary font-display">
                                    {categoryFilter ? `${categoryName} Articles` : 'Latest Articles'}
                                </h2>
                                <div className="h-px flex-1 bg-primary/20" />
                                <span className="text-primary">♫</span>
                            </div>

                            {/* Posts Grid */}
                            <Suspense fallback={<BlogSkeleton />}>
                                {posts.length > 0 ? (
                                    <>
                                        <div className="grid gap-8 sm:grid-cols-2">
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
                                                    hasNextPage={hasNextPage}
                                                    hasPrevPage={hasPrevPage}
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

                        {/* Sidebar */}
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
