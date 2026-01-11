import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { generateProductSlug } from '@/lib/api'

// Force dynamic rendering - sitemap needs database access
export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jamessaxcorner.com'

    // Static pages
    const staticRoutes = [
        '',
        '/shop',
        '/about',
        '/contact',
        '/blog',
        '/cart',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    // Dynamic products
    const products = await prisma.product.findMany({
        select: {
            sku: true,
            slug: true,
            updatedAt: true,
        },
    })

    // Format: /product/SKU-slug (matching logic in lib/api.ts:getProductUrl)
    // Note: We use the stored slug or generate one if missing (though they should be consistent)
    const productRoutes = products.map((product) => {
        // If we have a stored slug, use it. Ideally, slug in DB is already "clean".
        // If we need to combine SKU and slug as per new URL structure:
        const urlSlug = `${product.sku}-${product.slug}`

        return {
            url: `${baseUrl}/product/${urlSlug}`,
            lastModified: product.updatedAt,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }
    })

    // Dynamic categories
    const categories = await prisma.category.findMany({
        select: {
            slug: true,
            updatedAt: true,
        },
    })

    const categoryRoutes = categories.map((category) => ({
        url: `${baseUrl}/shop?category=${category.slug}`,
        lastModified: category.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }))

    return [...staticRoutes, ...productRoutes, ...categoryRoutes]
}
