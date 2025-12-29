import { Suspense } from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Clock, User, Calendar, ArrowLeft, ArrowRight } from 'lucide-react';
import { blogPosts, getBlogPostBySlug, getRecentPosts, formatBlogDate } from '@/data/blogPosts';
import { BlogSidebar } from '@/components/blog/BlogSidebar';

interface BlogPostPageProps {
    params: { slug: string };
}

export async function generateStaticParams() {
    return blogPosts.map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const post = getBlogPostBySlug(params.slug);
    if (!post) return { title: 'Post Not Found' };

    return {
        title: `${post.title} | James Sax Corner Blog`,
        description: post.excerpt,
    };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
    const post = getBlogPostBySlug(params.slug);

    if (!post) {
        notFound();
    }

    const dateInfo = formatBlogDate(post.date);

    // Get adjacent posts for navigation
    const currentIndex = blogPosts.findIndex(p => p.slug === params.slug);
    const prevPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null;
    const nextPost = currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null;

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative bg-secondary py-12 overflow-hidden">
                {/* Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                </div>

                <div className="container relative mx-auto px-4">
                    {/* Breadcrumbs */}
                    <nav className="mb-6 flex items-center gap-2 text-sm text-white/60">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <ChevronRight className="h-4 w-4" />
                        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-white/80 line-clamp-1">{post.title}</span>
                    </nav>

                    {/* Categories */}
                    <div className="mb-4 flex flex-wrap gap-2">
                        {post.categories.map((category) => (
                            <Link
                                key={category}
                                href={`/blog?category=${category.toLowerCase().replace(/\s+/g, '-')}`}
                                className="rounded border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white hover:bg-white hover:text-secondary transition-colors"
                            >
                                {category}
                            </Link>
                        ))}
                    </div>

                    {/* Title */}
                    <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl font-display leading-tight max-w-4xl">
                        {post.title}
                    </h1>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-6 text-white/70">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{dateInfo.full}</span>
                        </div>
                        {post.readTime && (
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{post.readTime} min read</span>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="grid gap-12 lg:grid-cols-3">
                        {/* Article Content */}
                        <article className="lg:col-span-2">
                            {/* Featured Image */}
                            <div className="relative mb-8 aspect-video overflow-hidden rounded-lg border-2 border-primary/20 shadow-lg">
                                <Image
                                    src={post.image}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>

                            {/* Excerpt */}
                            <div className="mb-8 rounded-lg border-l-4 border-primary bg-primary/5 p-6">
                                <p className="text-lg italic text-secondary leading-relaxed">
                                    {post.excerpt}
                                </p>
                            </div>

                            {/* Content */}
                            <div
                                className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-secondary prose-p:text-muted-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-secondary prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:not-italic"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />

                            {/* Decorative End */}
                            <div className="mt-12 flex items-center justify-center gap-4">
                                <div className="h-px w-16 bg-primary/40" />
                                <span className="text-2xl text-primary">♫</span>
                                <div className="h-px w-16 bg-primary/40" />
                            </div>

                            {/* Author Box */}
                            <div className="mt-12 rounded-lg border-2 border-primary/20 bg-white p-6 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white font-display">
                                        {post.author.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-secondary font-display">
                                            {post.author}
                                        </h3>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Wind instrument specialist with over 30 years of experience.
                                            Passionate about helping musicians find their perfect instrument.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Post Navigation */}
                            <div className="mt-12 grid gap-4 sm:grid-cols-2">
                                {prevPost && (
                                    <Link
                                        href={`/blog/${prevPost.slug}`}
                                        className="group flex items-center gap-3 rounded-lg border-2 border-primary/20 bg-white p-4 transition-all hover:border-primary/40 hover:shadow-md"
                                    >
                                        <ArrowLeft className="h-5 w-5 text-primary shrink-0 group-hover:-translate-x-1 transition-transform" />
                                        <div className="min-w-0">
                                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Previous</span>
                                            <p className="font-semibold text-secondary line-clamp-1 group-hover:text-primary transition-colors">
                                                {prevPost.title}
                                            </p>
                                        </div>
                                    </Link>
                                )}
                                {nextPost && (
                                    <Link
                                        href={`/blog/${nextPost.slug}`}
                                        className="group flex items-center justify-end gap-3 rounded-lg border-2 border-primary/20 bg-white p-4 transition-all hover:border-primary/40 hover:shadow-md sm:col-start-2"
                                    >
                                        <div className="min-w-0 text-right">
                                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Next</span>
                                            <p className="font-semibold text-secondary line-clamp-1 group-hover:text-primary transition-colors">
                                                {nextPost.title}
                                            </p>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-primary shrink-0 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                )}
                            </div>
                        </article>

                        {/* Sidebar */}
                        <aside className="lg:col-span-1">
                            <BlogSidebar showSearch />
                        </aside>
                    </div>
                </div>
            </section>
        </div>
    );
}
