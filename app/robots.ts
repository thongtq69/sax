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
          // Blanket `/*?*` was blocking valuable landing pages like
          // /shop?brand=yamaha and /blog?category=reviews. Rely on
          // canonical tags instead. Only block noisy query params that
          // create duplicate content (session, tracking, pagination noise).
          '/*?utm_*',
          '/*?fbclid=*',
          '/*?gclid=*',
          '/*?ref=*',
          '/*?sessionid=*',
          '/*?sid=*',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/'],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
