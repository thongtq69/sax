import { prisma } from '@/lib/prisma'
import { getProductUrl, transformProduct } from '@/lib/api'
import { StructuredData, organizationSchema, websiteSchema, localBusinessSchema } from '@/components/seo/StructuredData'
import { HomePageClient, type HomePageData } from '@/components/home/HomePageClient'
import type { Review } from '@/lib/reviews'
import { getBaseUrl } from '@/lib/seo'

// Revalidate homepage every 60 seconds for fresh data
export const revalidate = 60

async function getHomepageData(): Promise<HomePageData> {
  // Fetch collections, products, hero content, reviews, and brands in parallel
  const [collections, productsResult, heroContent, reviewsResult, brands] = await Promise.all([
    prisma.featuredCollection.findMany().catch(() => []),
    prisma.product.findMany({
      where: { status: { not: 'draft' } },
      take: 28,
      orderBy: { createdAt: 'desc' },
      include: { category: true, subcategory: true },
    }).catch(() => []),
    prisma.homepageContent.findFirst({
      where: { sectionKey: 'hero' },
    }).catch(() => null),
    prisma.review.findMany({
      take: 100,
      orderBy: { date: 'desc' },
      include: { product: { select: { name: true } } },
    }).catch(() => []),
    prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    }).catch(() => []),
  ])

  // Process hero content
  const hero = {
    image: (heroContent?.image) || '/homepage3.png',
    logoImage: (heroContent?.metadata as any)?.logoImage || '/LOGO JAMES (1).svg',
    buttonText: (heroContent?.metadata as any)?.buttonText || 'Shop now!',
    buttonLink: (heroContent?.metadata as any)?.buttonLink || '/shop',
  }

  // Process collections
  const collectionTitles: Record<string, string> = {
    'new-arrivals': 'NEW ARRIVALS',
    'featured-instruments': 'FEATURED INSTRUMENTS',
    'on-sale': 'ON SALE',
    'professional-flutes': 'PROFESSIONAL FLUTES',
    'saxophones': 'SAXOPHONES',
    'student-instruments': 'STUDENT INSTRUMENTS',
  }
  const collectionBackgrounds: Record<string, string> = {}
  const collectionProducts: Record<string, any[]> = {}

  // Fetch all collection products in parallel instead of sequential awaits
  const collectionResults = await Promise.all(
    collections.map(async (collection) => {
      if (!collection.productIds || collection.productIds.length === 0) {
        return { slug: collection.slug, products: [] as any[] }
      }
      const products = await prisma.product.findMany({
        where: {
          id: { in: collection.productIds },
          status: { not: 'draft' },
        },
        include: { category: true, subcategory: true },
      }).catch(() => [])
      return { slug: collection.slug, products: products.map(transformProduct) }
    })
  )

  for (const collection of collections) {
    if (collection.name) {
      collectionTitles[collection.slug] = collection.name.toUpperCase()
    }
    if (collection.backgroundImage) {
      collectionBackgrounds[collection.slug] = collection.backgroundImage
    }
  }
  for (const result of collectionResults) {
    collectionProducts[result.slug] = result.products
  }

  // Transform all products
  const allProducts = productsResult.map(transformProduct)

  // Transform reviews
  const reviews: Review[] = reviewsResult.map((r: any) => ({
    id: r.id,
    productName: r.product?.name || r.customProductName || 'General Review',
    buyerName: r.buyerName,
    rating: r.rating,
    message: r.message || '',
    date: r.date ? new Date(r.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    sourceUrl: r.sourceUrl,
  }))

  return {
    featuredProducts: collectionProducts['featured-instruments'] || [],
    saleProducts: collectionProducts['new-arrivals'] || [],
    onSaleProducts: collectionProducts['on-sale'] || [],
    professionalFlutesProducts: collectionProducts['professional-flutes'] || [],
    saxophonesProducts: collectionProducts['saxophones'] || [],
    studentInstrumentsProducts: collectionProducts['student-instruments'] || [],
    collectionTitles,
    collectionBackgrounds,
    heroContent: hero,
    allProducts,
    reviews,
    brands,
  }
}

export default async function HomePage() {
  const data = await getHomepageData()
  const baseUrl = getBaseUrl()

  // Custom schemas for brands and reviews
  const brandListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Shop Professional Saxophones by Brand",
    "description": "Premium saxophones from world-leading manufacturers.",
    "url": `${baseUrl}/#brands`,
    "itemListElement": data.brands.map((brand, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${baseUrl}/b/${brand.slug}-saxophones`,
      "name": `${brand.name} Saxophones`
    }))
  }

  const aggregateRatingSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "James Sax Corner",
    "image": `${baseUrl}/logo.png`,
    "url": baseUrl,
    "priceRange": "$$$",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Worldwide Shipping",
      "addressCountry": "US"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "500",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": data.reviews.slice(0, 5).map(r => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": r.rating.toString()
      },
      "author": {
        "@type": "Person",
        "name": r.buyerName
      },
      "reviewBody": r.message
    }))
  }

  return (
    <>
      {/* SEO Structured Data — rendered server-side for Google */}
      <StructuredData data={organizationSchema} />
      <StructuredData data={websiteSchema} />
      <StructuredData data={brandListSchema} />
      <StructuredData data={aggregateRatingSchema} />

      {/* Main content with static HTML for SEO + client interactivity */}
      <HomePageClient data={data} />

      {/* Hidden SEO content — visible to crawlers in server HTML */}
      <section className="sr-only" aria-hidden="false">
        <h1>James Sax Corner - Premium Saxophones & Professional Wind Instruments</h1>
        <p>
          James Sax Corner specializes in premium, professional-grade saxophones.
          We offer alto saxophones, tenor saxophones, soprano saxophones, and baritone saxophones
          from top brands including Selmer, Yamaha, Yanagisawa, and more.
          Each instrument is individually inspected, professionally maintained, and prepared
          for peak performance before shipping worldwide.
        </p>

        <div id="brands-indexing">
          <h2>Shop Professional Saxophones by Brand</h2>
          <p>Explore our curated selection of instruments from the world's most trusted brands.</p>
          <ul>
            {data.brands.map((brand) => (
              <li key={brand.id}>
                <a href={`/b/${brand.slug}-saxophones`}>
                  {brand.name} Saxophones for Sale
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div id="testimonials-indexing">
          <h2>Customer Testimonials & Reviews</h2>
          <p>Read what musicians and students say about their experience with James Sax Corner.</p>
          {data.reviews.slice(0, 10).map((review) => (
            <blockquote key={review.id}>
              <p>{review.message}</p>
              <cite>— {review.buyerName}, Verified Buyer. Rated {review.rating} out of 5 stars.</cite>
            </blockquote>
          ))}
        </div>

        <h2>Our Current Saxophones & Wind Instruments</h2>
        <ul>
          {data.allProducts.slice(0, 25).map((product) => (
            <li key={product.id}>
              <a href={getProductUrl(product.sku, product.slug || '', (product as any).serialNumber || (product as any).specs?.SN)}>
                {product.name} - Professional {product.brand} {product.subcategoryName || ''} - ${product.price.toLocaleString()}
              </a>
            </li>
          ))}
        </ul>

        <h2>Why Choose James Sax Corner</h2>
        <ul>
          <li>Saxophone Specialists — We focus exclusively on professional saxophones</li>
          <li>Individually Prepared — Each instrument is inspected and adjusted before sale</li>
          <li>Honest and Clear Listings — Accurate descriptions with real photos</li>
          <li>Secure Purchasing — PayPal buyer protection on every purchase</li>
          <li>Trusted Worldwide — Serving musicians from countries around the world</li>
          <li>Expert Maintenance — Professional pad replacement and adjustment</li>
        </ul>

        <h2>Shop by Instrument Category</h2>
        <nav>
          <span>Alto Saxophones</span>
          <span>Soprano Saxophones</span>
          <span>Tenor Saxophones</span>
          <span>Baritone Saxophones</span>
          <a href="/shop">All Instruments</a>
          <a href="/about">About Us</a>
          <a href="/blog">Saxophone Blog</a>
          <a href="/contact">Contact Us</a>
        </nav>
      </section>
    </>
  )
}
