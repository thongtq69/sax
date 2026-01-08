import Link from 'next/link';
import Image from 'next/image';
import { BlogPost, formatBlogDate } from '@/data/blogPosts';
import { Clock, User, ArrowRight, Sparkles } from 'lucide-react';

interface BlogCardProps {
    post: BlogPost;
    featured?: boolean;
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
    const dateInfo = formatBlogDate(post.date);

    if (featured) {
        return (
            <article className="group relative overflow-hidden rounded-xl sm:rounded-2xl border-2 border-primary/20 bg-white shadow-lg transition-all duration-500 hover:shadow-2xl hover:border-primary/40 hover:-translate-y-1 animate-fade-in-up">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />

                <div className="flex flex-col md:grid md:grid-cols-2">
                    {/* Image */}
                    <div className="relative aspect-[16/10] md:aspect-auto overflow-hidden">
                        <Link href={`/blog/${post.slug}`}>
                            <Image
                                src={post.image}
                                alt={post.title}
                                fill
                                className="object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-105"
                            />
                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -translate-x-full group-hover:translate-x-full" style={{ transitionDuration: '1s' }} />
                        </Link>
                        {/* Date Badge - Vintage Style with animation */}
                        <div className="absolute left-3 sm:left-4 top-3 sm:top-4 flex flex-col items-center rounded-lg border-2 border-white/30 bg-secondary px-3 sm:px-4 py-2 sm:py-3 text-white shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-105 group-hover:rotate-2">
                            <span className="text-xl sm:text-2xl md:text-3xl font-bold leading-none font-display">{dateInfo.day}</span>
                            <span className="text-[10px] sm:text-xs uppercase tracking-widest mt-0.5 sm:mt-1">{dateInfo.month}</span>
                        </div>
                        {/* Featured badge */}
                        <div className="absolute right-3 sm:right-4 top-3 sm:top-4 flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-accent text-white text-[10px] sm:text-xs font-semibold shadow-lg animate-pulse-soft">
                            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            Featured
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col justify-center p-3 sm:p-5 md:p-8 relative">
                        {/* Categories */}
                        <div className="mb-2 sm:mb-3 flex flex-wrap gap-1.5 sm:gap-2">
                            {post.categories.map((category, i) => (
                                <Link
                                    key={category}
                                    href={`/blog?category=${category.toLowerCase().replace(/\s+/g, '-')}`}
                                    className="rounded-full border border-primary/30 bg-primary/5 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium uppercase tracking-wide text-primary hover:bg-primary hover:text-white transition-all duration-300 hover:scale-105 animate-fade-in-up"
                                    style={{ animationDelay: `${i * 0.05}s` }}
                                >
                                    {category}
                                </Link>
                            ))}
                        </div>

                        {/* Title */}
                        <Link href={`/blog/${post.slug}`}>
                            <h2 className="mb-2 sm:mb-3 text-base sm:text-lg md:text-2xl font-bold text-secondary transition-colors hover:text-primary font-display leading-tight group-hover:text-primary">
                                {post.title}
                            </h2>
                        </Link>

                        {/* Excerpt */}
                        <p className="mb-2 sm:mb-3 text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-2 md:line-clamp-3">
                            {post.excerpt}
                        </p>

                        {/* Meta */}
                        <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs md:text-sm text-muted-foreground mb-2 sm:mb-4">
                            <div className="flex items-center gap-1 sm:gap-1.5 group/meta">
                                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors group-hover/meta:text-primary" />
                                <span>{post.author}</span>
                            </div>
                            {post.readTime && (
                                <div className="flex items-center gap-1 sm:gap-1.5 group/meta">
                                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors group-hover/meta:text-primary" />
                                    <span>{post.readTime} min read</span>
                                </div>
                            )}
                        </div>

                        {/* Read More */}
                        <Link
                            href={`/blog/${post.slug}`}
                            className="inline-flex items-center gap-1.5 text-primary font-semibold hover:gap-2 transition-all group/link relative overflow-hidden text-xs sm:text-sm md:text-base"
                        >
                            <span className="relative z-10">Continue Reading</span>
                            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover/link:translate-x-1 relative z-10" />
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover/link:w-full" />
                        </Link>
                    </div>
                </div>
            </article>
        );
    }

    return (
        <article className="group relative overflow-hidden rounded-lg sm:rounded-xl border border-primary/20 bg-white shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-2 hover:border-primary/40 animate-fade-in-up">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />

            {/* Image Container */}
            <div className="relative aspect-[16/10] sm:aspect-[4/3] overflow-hidden">
                <Link href={`/blog/${post.slug}`}>
                    <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-105"
                    />
                </Link>

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -translate-x-full group-hover:translate-x-full" style={{ transitionDuration: '0.8s' }} />

                {/* Date Badge - Vintage Style */}
                <div className="absolute right-2 sm:right-4 top-2 sm:top-4 flex flex-col items-center rounded-md sm:rounded-lg border border-white/20 bg-secondary/90 px-2 sm:px-3 py-1.5 sm:py-2 text-white shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:-rotate-3">
                    <span className="text-lg sm:text-2xl font-bold leading-none font-display">{dateInfo.day}</span>
                    <span className="text-[8px] sm:text-[10px] uppercase tracking-widest mt-0.5">{dateInfo.month}</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4 md:p-5 relative z-20">
                {/* Categories */}
                <div className="mb-2 sm:mb-3 flex flex-wrap gap-1 sm:gap-1.5">
                    {post.categories.slice(0, 2).map((category, i) => (
                        <Link
                            key={category}
                            href={`/blog?category=${category.toLowerCase().replace(/\s+/g, '-')}`}
                            className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] sm:text-[10px] font-medium uppercase tracking-wider text-primary hover:bg-primary hover:text-white transition-all duration-300 hover:scale-105"
                            style={{ animationDelay: `${i * 0.05}s` }}
                        >
                            {category}
                        </Link>
                    ))}
                </div>

                {/* Title */}
                <Link href={`/blog/${post.slug}`}>
                    <h3 className="mb-1.5 sm:mb-2 text-sm sm:text-base md:text-lg font-bold text-secondary transition-colors hover:text-primary font-display leading-snug line-clamp-2 group-hover:text-primary">
                        {post.title}
                    </h3>
                </Link>

                {/* Excerpt */}
                <p className="mb-2 sm:mb-4 text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {post.excerpt}
                </p>

                {/* Decorative Divider */}
                <div className="flex items-center gap-2 mb-2 sm:mb-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent transition-all duration-500 group-hover:via-primary/50" />
                    <span className="text-primary/40 text-[10px] sm:text-xs transition-transform duration-300 group-hover:rotate-180 group-hover:text-primary">✦</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent transition-all duration-500 group-hover:via-primary/50" />
                </div>

                {/* Meta & Read More */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground">
                        <span className="font-medium truncate max-w-[80px] sm:max-w-none">{post.author}</span>
                        {post.readTime && (
                            <>
                                <span className="text-primary/30 hidden sm:inline">•</span>
                                <span className="hidden sm:flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {post.readTime} min
                                </span>
                            </>
                        )}
                    </div>
                    <Link
                        href={`/blog/${post.slug}`}
                        className="text-[10px] sm:text-xs font-semibold text-primary hover:text-accent transition-colors flex items-center gap-1 group/link"
                    >
                        Read
                        <ArrowRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                </div>
            </div>
        </article>
    );
}
