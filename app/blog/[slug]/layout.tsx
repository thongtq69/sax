import { Metadata } from 'next'
import { getBlogPostBySlug, transformBlogPost } from '@/lib/api'
import { buildCanonicalUrl } from '@/lib/seo'

export async function generateMetadata({
    params,
}: {
    params: { slug: string }
}): Promise<Metadata> {
    try {
        const postData = await getBlogPostBySlug(params.slug)
        if (!postData) {
            return {
                title: 'Post Not Found',
            }
        }

        const post = transformBlogPost(postData)
        return {
            title: post.title,
            description: post.excerpt || 'Expert saxophone advice and guides.',
            alternates: {
                canonical: buildCanonicalUrl(`/blog/${params.slug}`),
            },
            openGraph: {
                title: post.title,
                description: post.excerpt,
                images: post.image ? [post.image] : [],
                type: 'article',
            },
        }
    } catch (error) {
        return {
            title: 'James Sax Corner Blog',
        }
    }
}

export default function BlogPostLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
