import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { transformProduct, extractSkuCandidatesFromParam, getProductUrl } from '@/lib/api'
import { generateSlug, getModelSlug } from '@/lib/slug-utils'
import { ProductDetailClient } from '@/components/product/ProductDetailClient'
import { StructuredData } from '@/components/seo/StructuredData'
import { ChevronRight, Home } from 'lucide-react'

// Server-side product schema generator
function generateProductSchema(product: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.images,
    "brand": {
      "@type": "Brand",
      "name": product.brand
    },
    "sku": product.sku,
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "USD",
      "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "James Sax Corner"
      }
    },
    "aggregateRating": product.rating > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.reviewCount
    } : undefined
  }
}

async function findProductByItemParam(param: string, includeCategoryOnly = false) {
  const decodedParam = decodeURIComponent((param || '').trim())
  const skuCandidates = extractSkuCandidatesFromParam(param)
  const include = includeCategoryOnly
    ? { category: true }
    : {
      category: {
        include: {
          subcategories: true,
        },
      },
      subcategory: true,
    }

  // 1. Try exact slug as given (case-insensitive) 
  const byExactSlug = await prisma.product.findFirst({
    where: {
      slug: { equals: decodedParam, mode: 'insensitive' }
    },
    include,
  })
  if (byExactSlug && ((byExactSlug as any).isVisible !== false)) return byExactSlug

  // 2. Handle legacy -SN- format
  const snMatch = decodedParam.match(/^(.*)-SN-(.+)$/i)
  if (snMatch?.[1]) {
    const slugCandidate = snMatch[1]
    const snCandidate = snMatch[2]

    // Try base slug
    const byBaseSlug = await prisma.product.findFirst({
      where: { slug: { equals: slugCandidate, mode: 'insensitive' } },
      include,
    })
    if (byBaseSlug && ((byBaseSlug as any).isVisible !== false)) return byBaseSlug

    // Try combined slug (new format name-SN)
    const combinedSlug = `${slugCandidate}-${snCandidate}`
    const byCombinedSlug = await prisma.product.findFirst({
      where: { slug: { equals: combinedSlug, mode: 'insensitive' } },
      include,
    })
    if (byCombinedSlug && ((byCombinedSlug as any).isVisible !== false)) return byCombinedSlug
  }

  // 3. Try candidates from URL (SKU/SN)
  for (const sku of skuCandidates) {
    if (!sku) continue

    const bySku = await prisma.product.findFirst({
      where: {
        OR: [
          { sku: { equals: sku, mode: 'insensitive' } },
          { slug: { contains: sku, mode: 'insensitive' } }
        ]
      },
      include,
    })
    if (bySku && ((bySku as any).isVisible !== false)) return bySku
  }

  // 4. Try a partial slug match by extracted name parts
  if (decodedParam.length > 20) {
    const parts = decodedParam.split('-').filter(p => p.length > 3)
    if (parts.length > 2) {
      const searchString = parts.slice(0, 3).join(' ')
      const byPartialName = await prisma.product.findFirst({
        where: {
          name: { contains: searchString, mode: 'insensitive' }
        },
        include
      })
      if (byPartialName && ((byPartialName as any).isVisible !== false)) return byPartialName
    }
  }

  return null
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  try {
    const apiProduct = await findProductByItemParam(params.slug, true)

    if (!apiProduct) {
      return {
        title: 'Product Not Found',
        description: 'The requested product could not be found.',
      }
    }

    const product = transformProduct(apiProduct)

    // Smart identify Origin
    const lowerBrand = (product.brand || '').toLowerCase()
    let origin = 'Premium'
    if (lowerBrand.includes('yamaha') || lowerBrand.includes('yanagisawa')) origin = 'Japanese'
    else if (lowerBrand.includes('selmer') || lowerBrand.includes('buffet')) origin = 'French'
    else if (lowerBrand.includes('keilwerth') || lowerBrand.includes('b&s')) origin = 'German'
    else if (lowerBrand.includes('conn') || lowerBrand.includes('king') || lowerBrand.includes('martin') || lowerBrand.includes('buescher')) origin = 'American'
    else if (lowerBrand.includes('mauriat') || lowerBrand.includes('eastman') || lowerBrand.includes('cannonball')) origin = 'Taiwanese'

    // Smart identify Level
    let modelLevel = 'Professional Model'
    if (product.category === 'student-instruments') {
      modelLevel = 'Student Model'
    }

    const title = `${product.name} | ${modelLevel} | James Sax Corner`
    // Convert e.g., "Yamaha YTS-62 Tenor Saxophone SN 12345" to use the template
    const baseName = product.name.replace(/\s+SN\s+.*$/i, '')
    const description = `${baseName} carefully inspected and professionally prepared. Premium ${origin} instrument with worldwide shipping available at James Sax Corner.`

    const keywords = [
      product.name,
      product.brand,
      product.category,
      'saxophone',
      'professional saxophone',
      'musical instrument',
      product.sku, // Keep internal property name as sku if database hasn't changed, but label as Serial in UI
      ...(product.specs ? Object.values(product.specs).filter(Boolean) : [])
    ].filter(Boolean).join(', ')

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        images: product.images.length > 0 ? [{
          url: product.images[0],
          width: 800,
          height: 600,
          alt: product.name
        }] : [],
        type: 'website',
        siteName: 'James Sax Corner',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: product.images.length > 0 ? [product.images[0]] : [],
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://jamessaxcorner.com'}${getProductUrl(product.sku, product.slug, product.serialNumber)}`,
      },
    }
  } catch (error) {
    return {
      title: 'James Sax Corner',
      description: 'Premium Saxophones and Instruments',
    }
  }
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string }
}) {
  const apiProduct = await findProductByItemParam(params.slug)

  if (!apiProduct) {
    notFound()
  }

  const product = transformProduct(apiProduct)
  const canonicalPath = getProductUrl(product.sku, product.slug, product.serialNumber)
  const canonicalParam = decodeURIComponent(canonicalPath.replace('/item/', ''))
  const currentParam = decodeURIComponent(params.slug)

  if (currentParam !== canonicalParam) {
    redirect(canonicalPath)
  }

  const brandName = product.brand || ''
  const brandSlug = brandName ? generateSlug(brandName) : ''
  const productSchema = generateProductSchema(product)

  return (
    <div className="min-h-screen">
      {/* SEO Structured Data */}
      <StructuredData data={productSchema} />
      <StructuredData data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": process.env.NEXT_PUBLIC_BASE_URL || "https://jamessaxcorner.com"
          },
          ...(brandName ? [{
            "@type": "ListItem",
            "position": 2,
            "name": brandName,
            "item": `${process.env.NEXT_PUBLIC_BASE_URL || "https://jamessaxcorner.com"}/b/${brandSlug}-saxophones`
          }] : []),
          ...(product.subBrand ? [{
            "@type": "ListItem",
            "position": 3,
            "name": `${product.brand} ${product.subBrand} ${product.subcategoryName || ''} saxophone`.replace(/\s+/g, ' ').trim(),
            "item": `${process.env.NEXT_PUBLIC_BASE_URL || "https://jamessaxcorner.com"}/p/${getModelSlug(product.brand, product.subBrand, product.subcategoryName)}`
          }] : [])
        ]
      }} />

      {/* Breadcrumbs */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-2 md:py-3 lg:py-4">
          <nav className="flex items-center gap-1.5 md:gap-2 text-[11px] sm:text-xs md:text-sm overflow-x-auto pb-1 leading-none">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 whitespace-nowrap">
              <Home className="h-3 w-3 md:h-3.5 md:w-3.5" />
              Home
            </Link>
            {brandName && (
              <>
                <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground/50 flex-shrink-0" />
                <Link href={`/b/${brandSlug}-saxophones`} className="text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">
                  {brandName}
                </Link>
              </>
            )}
            {product.subBrand && (
              <>
                <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground/50 flex-shrink-0" />
                <Link href={`/p/${getModelSlug(product.brand, product.subBrand, product.subcategoryName)}`} className="text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">
                  {product.brand} {product.subBrand} {product.subcategoryName || ''} saxophone
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-2 md:py-6 lg:py-8">
        <ProductDetailClient product={product} />
      </div>
    </div>
  )
}
