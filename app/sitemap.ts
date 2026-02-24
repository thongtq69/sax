import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jamessaxcorner.com'

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/inquiry`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ]

  try {
    // Dynamic product pages - fetch directly from DB for reliability
    const products = await prisma.product.findMany({
      select: { sku: true, slug: true, updatedAt: true },
    })
    const productPages = products.map((product) => ({
      url: `${baseUrl}/item/${product.sku}${product.slug ? '-' + product.slug : ''}`,
      lastModified: new Date(product.updatedAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Dynamic blog post pages
    const blogPosts = await prisma.blogPost.findMany({
      select: { slug: true, updatedAt: true },
    })
    const blogPages = blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

    // Category/Subcategory pages
    const categories = await prisma.category.findMany({
      include: { subcategories: true },
    })
    const categoryPages = categories.flatMap((category) => {
      const pages: MetadataRoute.Sitemap = []

      if (category.subcategories && category.subcategories.length > 0) {
        category.subcategories.forEach((sub) => {
          pages.push({
            url: `${baseUrl}/shop?subcategory=${sub.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
          })
        })
      }

      return pages
    })

    return [...staticPages, ...productPages, ...blogPages, ...categoryPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}