import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { getProductUrl } from '@/lib/api'
import { getBaseUrl } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl()

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
      url: `${baseUrl}/used-professional-saxophones`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
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
      where: { stockStatus: { not: 'archived' } },
      select: { sku: true, slug: true, specs: true, updatedAt: true },
    })
    const productPages = products.map((product) => ({
      url: `${baseUrl}${getProductUrl(product.sku, product.slug || '', typeof product.specs === 'object' && product.specs ? (product.specs as any).SN : '')}`,
      lastModified: new Date(product.updatedAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Dynamic blog post pages (skip drafts & scheduled-but-not-yet-published)
    const blogPosts = await prisma.blogPost.findMany({
      where: { NOT: { status: { in: ['draft', 'scheduled'] } } },
      select: { slug: true, updatedAt: true },
    })
    const blogPages = blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

    // Model pages (unique brand + subBrand combinations)
    const modelsRaw = await prisma.product.findMany({
      where: {
        subBrand: { not: null },
        stockStatus: { not: 'archived' },
      },
      select: { brand: true, subBrand: true, updatedAt: true },
    })
    const modelSet = new Map<string, Date>()
    modelsRaw.forEach((p) => {
      if (!p.subBrand) return
      const key = `${p.brand.toLowerCase().replace(/\s+/g, '-')}/${p.subBrand.toLowerCase().replace(/\s+/g, '-')}`
      const existing = modelSet.get(key)
      if (!existing || p.updatedAt > existing) {
        modelSet.set(key, p.updatedAt)
      }
    })
    const modelPages = Array.from(modelSet.entries()).map(([key, updatedAt]) => {
      // key is "brand/subBrand"
      const [brand, model] = key.split('/')
      const modelSlug = `${brand}-${model}-saxophone`
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')

      return {
        url: `${baseUrl}/p/${modelSlug}`,
        lastModified: updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.75,
      }
    })

    // Brand pages
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    })
    const brandPages = brands.map((brand) => ({
      url: `${baseUrl}/b/${brand.slug}-saxophones`,
      lastModified: new Date(brand.updatedAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    return [...staticPages, ...productPages, ...blogPages, ...modelPages, ...brandPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}
