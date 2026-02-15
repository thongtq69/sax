import { prisma } from '@/lib/prisma'
import { transformProduct } from '@/lib/api'
import { StructuredData, organizationSchema, websiteSchema, localBusinessSchema } from '@/components/seo/StructuredData'
import { HomePageClient, type HomePageData } from '@/components/home/HomePageClient'
import type { Review } from '@/lib/reviews'

// Revalidate homepage every 60 seconds for fresh data
export const revalidate = 60

async function getHomepageData(): Promise<HomePageData> {
  // Fetch collections, products, hero content, and reviews in parallel
  const [collections, productsResult, heroContent, reviewsResult] = await Promise.all([
    prisma.featuredCollection.findMany().catch(() => []),
    prisma.product.findMany({
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

  for (const collection of collections) {
    if (collection.name) {
      collectionTitles[collection.slug] = collection.name.toUpperCase()
    }
    if (collection.backgroundImage) {
      collectionBackgrounds[collection.slug] = collection.backgroundImage
    }
    // Fetch products for this collection
    if (collection.productIds && collection.productIds.length > 0) {
      const products = await prisma.product.findMany({
        where: { id: { in: collection.productIds } },
        include: { category: true, subcategory: true },
      }).catch(() => [])
      collectionProducts[collection.slug] = products.map(transformProduct)
    }
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
  }
}

export default async function HomePage() {
  const data = await getHomepageData()

  return (
    <>
      {/* SEO Structured Data — rendered server-side for Google */}
      <StructuredData data={organizationSchema} />
      <StructuredData data={websiteSchema} />
      <StructuredData data={localBusinessSchema} />

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
        <h2>Our Saxophone Collection</h2>
        <ul>
          {data.allProducts.slice(0, 20).map((product) => (
            <li key={product.id}>
              <a href={`/product/${product.sku}${product.slug ? '-' + product.slug : ''}`}>
                {product.name} - {product.brand} - ${product.price.toLocaleString()}
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
        <h2>Customer Reviews</h2>
        {data.reviews.slice(0, 5).map((review) => (
          <blockquote key={review.id}>
            <p>{review.message}</p>
            <cite>— {review.buyerName}, Rating: {review.rating}/5</cite>
          </blockquote>
        ))}
        <h2>Shop by Category</h2>
        <nav>
          <a href="/shop?subcategory=alto">Alto Saxophones</a>
          <a href="/shop?subcategory=soprano">Soprano Saxophones</a>
          <a href="/shop?subcategory=tenor">Tenor Saxophones</a>
          <a href="/shop?subcategory=baritone">Baritone Saxophones</a>
          <a href="/shop">All Instruments</a>
          <a href="/about">About Us</a>
          <a href="/blog">Saxophone Blog</a>
          <a href="/contact">Contact Us</a>
        </nav>
      </section>
    </>
  )
}
