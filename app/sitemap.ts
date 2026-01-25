import { MetadataRoute } from 'next'
import { getProducts, getCategories } from '@/lib/api'

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
    // Dynamic product pages
    const productsResponse = await getProducts({ limit: 1000 })
    const productPages = productsResponse.products.map((product) => ({
      // Match the format used in getProductUrl: /product/SKU-slug
      url: `${baseUrl}/product/${product.sku}${product.slug ? '-' + product.slug : ''}`,
      lastModified: new Date(product.updatedAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Category/Subcategory pages
    const categories = await getCategories()
    const categoryPages = categories.flatMap((category: any) => {
      const pages: any[] = []

      // If shop handled parent categories, we could add them here
      // For now, we mainly want subcategories as they are the primary filter
      if (category.subcategories && category.subcategories.length > 0) {
        category.subcategories.forEach((sub: any) => {
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

    return [...staticPages, ...productPages, ...categoryPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}