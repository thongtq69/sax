import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { transformProduct } from '@/lib/api'
import { ProductCard } from '@/components/product/ProductCard'
import { StructuredData } from '@/components/seo/StructuredData'
import { buildCanonicalUrl, getBaseUrl } from '@/lib/seo'

export const revalidate = 300

const TARGET_BRANDS = ['Yamaha', 'Yanagisawa', 'Selmer']

export const metadata: Metadata = {
  title: 'Used Professional Saxophones for Sale | Yamaha, Yanagisawa, Selmer | James Sax Corner',
  description:
    'Explore carefully selected used professional saxophones including Yamaha, Yanagisawa and Selmer models. Each instrument is inspected and professionally prepared before shipment.',
  alternates: {
    canonical: buildCanonicalUrl('/used-professional-saxophones'),
  },
  openGraph: {
    title: 'Used Professional Saxophones for Sale | Yamaha, Yanagisawa, Selmer | James Sax Corner',
    description:
      'Explore carefully selected used professional saxophones including Yamaha, Yanagisawa and Selmer models.',
    type: 'website',
    siteName: 'James Sax Corner',
  },
}

async function getUsedProductsByBrand() {
  const results = await Promise.all(
    TARGET_BRANDS.map(async (brand) => {
      const products = await prisma.product.findMany({
        where: {
          brand: { equals: brand, mode: 'insensitive' },
          productType: 'used',
          stockStatus: { not: 'archived' },
        },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          subcategory: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      return { brand, products: products.map(transformProduct) }
    })
  )
  return results
}

export default async function UsedProfessionalSaxophonesPage() {
  const sections = await getUsedProductsByBrand()
  const totalCount = sections.reduce((sum, s) => sum + s.products.length, 0)

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: getBaseUrl() },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Used Professional Saxophones',
        item: buildCanonicalUrl('/used-professional-saxophones'),
      },
    ],
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <StructuredData data={breadcrumbSchema} />

      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-3 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-secondary font-medium">Used Professional Saxophones</span>
        </div>
      </div>

      <section className="relative overflow-hidden bg-gradient-to-br from-secondary to-[#1a2530] text-white py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight uppercase">
            Used Professional Saxophones
          </h1>
          <p className="mt-3 text-sm md:text-base text-white/80 uppercase tracking-[0.3em]">
            Yamaha · Yanagisawa · Selmer
          </p>
          <p className="mt-2 text-xs md:text-sm text-white/70">
            {totalCount} instrument{totalCount !== 1 ? 's' : ''} currently available
          </p>
        </div>
      </section>

      <article className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="prose prose-slate max-w-none space-y-4 text-slate-700 leading-relaxed">
          <p>
            Buying a used professional saxophone is one of the most practical ways to obtain a
            high-quality instrument at a reasonable price. Many professional saxophones are built
            to last for decades, and when properly maintained they can offer exceptional
            performance and reliability.
          </p>
          <p>
            At James Sax Corner, we specialize in carefully selected used professional saxophones
            from some of the most respected manufacturers in the saxophone world. Our inventory
            frequently includes instruments from Yamaha, Yanagisawa, and Selmer Paris.
          </p>
          <p>
            Popular models such as the Yamaha YTS-62, Yamaha Custom series, Yanagisawa WO series,
            and Selmer professional saxophones are widely trusted by musicians for their tone,
            build quality, and long-term durability.
          </p>
          <p>
            Every saxophone offered at James Sax Corner is carefully inspected and professionally
            prepared before shipment to ensure optimal playing condition. Our goal is to provide
            musicians with reliable professional instruments that are ready to perform.
          </p>
        </div>
      </article>

      <div className="container mx-auto px-4 pb-16 space-y-12">
        {sections.map(({ brand, products }) => (
          <section key={brand} id={brand.toLowerCase()}>
            <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
              <h2 className="text-2xl md:text-3xl font-bold text-secondary">
                {brand} Saxophones
              </h2>
              <Link
                href={`/b/${brand.toLowerCase()}-saxophones`}
                className="text-sm text-primary hover:text-secondary transition-colors"
              >
                View all {brand} →
              </Link>
            </div>
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6">
                No used {brand} saxophones are currently in stock. Please check back soon.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
