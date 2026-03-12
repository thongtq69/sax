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
        const ogImage = post.image || '/1000007654.svg'

        return {
            title: post.title,
            description: post.excerpt || 'Expert saxophone advice and guides.',
            alternates: {
                canonical: buildCanonicalUrl(`/blog/${params.slug}`),
            },
            openGraph: {
                title: post.title,
                description: post.excerpt,
                images: [ogImage],
                type: 'article',
            },
            twitter: {
                card: 'summary_large_image',
                title: post.title,
                description: post.excerpt,
                images: [ogImage],
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
