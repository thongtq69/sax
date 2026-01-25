import { Metadata } from 'next'
import { getBlogPostBySlug, transformBlogPost } from '@/lib/api'

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
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jamessaxcorner.com'

        return {
            title: `${post.title} | James Sax Corner Blog`,
            description: post.excerpt || 'Expert saxophone advice and guides.',
            alternates: {
                canonical: `${baseUrl}/blog/${params.slug}`,
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
