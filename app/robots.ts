import { MetadataRoute } from 'next'
import { getBaseUrl } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          '/account/',
          '/checkout/',
          '/cart',
          '/_next/',
          '/private/',
          '/search',
          '/*?*', // Disallow all query parameters to prevent duplicate content indexing of filter pages
        ],
      },
      {
        userAgent: 'GPTBot', // Explicitly block AI scrapers if desired, or allow them
        disallow: ['/'],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
