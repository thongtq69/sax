import Link from 'next/link';
import Image from 'next/image';
import { BlogPost, formatBlogDate } from '@/data/blogPosts';
import { Clock, User, ArrowRight } from 'lucide-react';

interface BlogCardProps {
    post: BlogPost;
    featured?: boolean;
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
    const dateInfo = formatBlogDate(post.date);

    if (featured) {
        return (
            <article className="group relative overflow-hidden rounded-lg border-2 border-primary/20 bg-white shadow-lg transition-all duration-500 hover:shadow-2xl hover:border-primary/40">
                <div className="grid md:grid-cols-2">
                    {/* Image */}
                    <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
                        <Link href={`/blog/${post.slug}`}>
                            <Image
                                src={post.image}
                                alt={post.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        </Link>
                        {/* Date Badge - Vintage Style */}
                        <div className="absolute left-4 top-4 flex flex-col items-center rounded border-2 border-white/30 bg-secondary px-4 py-3 text-white shadow-lg backdrop-blur-sm">
                            <span className="text-3xl font-bold leading-none font-display">{dateInfo.day}</span>
                            <span className="text-xs uppercase tracking-widest mt-1">{dateInfo.month}</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col justify-center p-8">
                        {/* Categories */}
                        <div className="mb-3 flex flex-wrap gap-2">
                            {post.categories.map((category) => (
                                <Link
                                    key={category}
                                    href={`/blog?category=${category.toLowerCase().replace(/\s+/g, '-')}`}
                                    className="rounded border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary hover:bg-primary hover:text-white transition-colors"
                                >
                                    {category}
                                </Link>
                            ))}
                        </div>

                        {/* Title */}
                        <Link href={`/blog/${post.slug}`}>
                            <h2 className="mb-4 text-2xl font-bold text-secondary transition-colors hover:text-primary font-display leading-tight">
                                {post.title}
                            </h2>
                        </Link>

                        {/* Excerpt */}
                        <p className="mb-4 text-muted-foreground leading-relaxed line-clamp-3">
                            {post.excerpt}
                        </p>

                        {/* Meta */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>{post.author}</span>
                            </div>
                            {post.readTime && (
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{post.readTime} min read</span>
                                </div>
                            )}
                        </div>

                        {/* Read More */}
                        <Link
                            href={`/blog/${post.slug}`}
                            className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all group/link"
                        >
                            <span>Continue Reading</span>
                            <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </article>
        );
    }

    return (
        <article className="group relative overflow-hidden rounded-lg border border-primary/20 bg-white shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-2 hover:border-primary/40">
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden">
                <Link href={`/blog/${post.slug}`}>
                    <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                </Link>

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Date Badge - Vintage Style */}
                <div className="absolute right-4 top-4 flex flex-col items-center rounded border border-white/20 bg-secondary/90 px-3 py-2 text-white shadow-lg backdrop-blur-sm">
                    <span className="text-2xl font-bold leading-none font-display">{dateInfo.day}</span>
                    <span className="text-[10px] uppercase tracking-widest mt-0.5">{dateInfo.month}</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                {/* Categories */}
                <div className="mb-3 flex flex-wrap gap-1.5">
                    {post.categories.slice(0, 2).map((category) => (
                        <Link
                            key={category}
                            href={`/blog?category=${category.toLowerCase().replace(/\s+/g, '-')}`}
                            className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary hover:bg-primary hover:text-white transition-colors"
                        >
                            {category}
                        </Link>
                    ))}
                </div>

                {/* Title */}
                <Link href={`/blog/${post.slug}`}>
                    <h3 className="mb-2 text-lg font-bold text-secondary transition-colors hover:text-primary font-display leading-snug line-clamp-2">
                        {post.title}
                    </h3>
                </Link>

                {/* Excerpt */}
                <p className="mb-4 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {post.excerpt}
                </p>

                {/* Decorative Divider */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-px flex-1 bg-primary/20" />
                    <span className="text-primary/40 text-xs">✦</span>
                    <div className="h-px flex-1 bg-primary/20" />
                </div>

                {/* Meta & Read More */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="font-medium">{post.author}</span>
                        {post.readTime && (
                            <>
                                <span className="text-primary/30">•</span>
                                <span>{post.readTime} min</span>
                            </>
                        )}
                    </div>
                    <Link
                        href={`/blog/${post.slug}`}
                        className="text-xs font-semibold text-primary hover:underline"
                    >
                        Read →
                    </Link>
                </div>
            </div>
        </article>
    );
}
