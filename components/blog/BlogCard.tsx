import Link from 'next/link';
import Image from 'next/image';
import { BlogPost, formatBlogDate } from '@/data/blogPosts';

interface BlogCardProps {
    post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
    const dateInfo = formatBlogDate(post.date);

    return (
        <article className="group overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden">
                <Link href={`/blog/${post.slug}`}>
                    <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </Link>

                {/* Date Badge */}
                <div className="absolute left-4 top-4 flex flex-col items-center rounded bg-gray-900 px-3 py-2 text-white shadow-md">
                    <span className="text-2xl font-bold leading-none">{dateInfo.day}</span>
                    <span className="text-xs uppercase tracking-wide">{dateInfo.month}</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                {/* Categories */}
                <div className="mb-3 flex flex-wrap gap-2">
                    {post.categories.map((category, index) => (
                        <span key={category} className="inline-flex items-center">
                            <Link
                                href={`/blog?category=${category.toLowerCase().replace(/\s+/g, '-')}`}
                                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                                {category}
                            </Link>
                            {index < post.categories.length - 1 && (
                                <span className="ml-2 text-gray-300">|</span>
                            )}
                        </span>
                    ))}
                </div>

                {/* Title */}
                <h2 className="mb-3">
                    <Link
                        href={`/blog/${post.slug}`}
                        className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors line-clamp-2"
                    >
                        {post.title}
                    </Link>
                </h2>

                {/* Excerpt */}
                <p className="mb-4 text-sm text-gray-600 line-clamp-3">
                    {post.excerpt}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <Link
                        href={`/blog/${post.slug}`}
                        className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                        Continue reading →
                    </Link>

                    {post.commentCount !== undefined && post.commentCount > 0 && (
                        <span className="text-xs text-gray-500">
                            {post.commentCount} comment{post.commentCount !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            </div>
        </article>
    );
}
