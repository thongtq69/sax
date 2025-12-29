import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronRight, Home, Calendar, MessageCircle } from 'lucide-react';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import {
    getBlogPostBySlug,
    getRecentPosts,
    getCategoriesWithCount,
    formatBlogDate,
    blogPosts,
} from '@/data/blogPosts';

interface BlogPostPageProps {
    params: { slug: string };
}

export async function generateMetadata({
    params,
}: BlogPostPageProps): Promise<Metadata> {
    const post = getBlogPostBySlug(params.slug);

    if (!post) {
        return {
            title: 'Post Not Found | Specialty Music Store',
        };
    }

    return {
        title: `${post.title} | Specialty Music Store Blog`,
        description: post.excerpt,
    };
}

export async function generateStaticParams() {
    return blogPosts.map((post) => ({
        slug: post.slug,
    }));
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
    const post = getBlogPostBySlug(params.slug);

    if (!post) {
        notFound();
    }

    const dateInfo = formatBlogDate(post.date);
    const recentPosts = getRecentPosts(5).filter((p) => p.id !== post.id);
    const categories = getCategoriesWithCount();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary/5 to-primary/10 py-8 md:py-12">
                <div className="container mx-auto px-4">
                    {/* Breadcrumb */}
                    <nav className="mb-6 flex items-center flex-wrap text-sm text-gray-600">
                        <Link
                            href="/"
                            className="flex items-center hover:text-primary transition-colors"
                        >
                            <Home className="h-4 w-4 mr-1" />
                            Home
                        </Link>
                        <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
                        <Link href="/blog" className="hover:text-primary transition-colors">
                            Blog
                        </Link>
                        <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
                        <span className="text-gray-900 font-medium truncate max-w-xs">
                            {post.title}
                        </span>
                    </nav>
                </div>
            </section>

            {/* Main Content */}
            <section className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Article */}
                    <article className="flex-1">
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            {/* Featured Image */}
                            <div className="relative aspect-video">
                                <Image
                                    src={post.image.replace('600x400', '1200x600')}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>

                            {/* Content */}
                            <div className="p-6 md:p-8 lg:p-10">
                                {/* Meta */}
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        <time dateTime={post.date}>{dateInfo.full}</time>
                                    </div>
                                    {post.commentCount !== undefined && post.commentCount > 0 && (
                                        <div className="flex items-center">
                                            <MessageCircle className="h-4 w-4 mr-1" />
                                            {post.commentCount} comment
                                            {post.commentCount !== 1 ? 's' : ''}
                                        </div>
                                    )}
                                </div>

                                {/* Categories */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {post.categories.map((category) => (
                                        <Link
                                            key={category}
                                            href={`/blog?category=${category.toLowerCase().replace(/\s+/g, '-')}`}
                                            className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                                        >
                                            {category}
                                        </Link>
                                    ))}
                                </div>

                                {/* Title */}
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                    {post.title}
                                </h1>

                                {/* Excerpt */}
                                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                    {post.excerpt}
                                </p>

                                {/* Content */}
                                <div
                                    className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
                                    dangerouslySetInnerHTML={{ __html: post.content }}
                                />

                                {/* Tags/Categories Footer */}
                                <div className="mt-10 pt-6 border-t">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                        Posted in:
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {post.categories.map((category) => (
                                            <Link
                                                key={category}
                                                href={`/blog?category=${category.toLowerCase().replace(/\s+/g, '-')}`}
                                                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                                            >
                                                {category}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="mt-8 flex justify-center">
                            <Link
                                href="/blog"
                                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                            >
                                ← Back to Blog
                            </Link>
                        </div>
                    </article>

                    {/* Sidebar */}
                    <div className="w-full lg:w-80 flex-shrink-0">
                        <BlogSidebar
                            recentPosts={recentPosts.slice(0, 5)}
                            categories={categories}
                            showSearch={false}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}
