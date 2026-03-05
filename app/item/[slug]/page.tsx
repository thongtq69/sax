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
  if (byExactSlug && (byExactSlug.isVisible !== false)) return byExactSlug

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
    if (byBaseSlug && (byBaseSlug.isVisible !== false)) return byBaseSlug

    // Try combined slug (new format name-SN)
    const combinedSlug = `${slugCandidate}-${snCandidate}`
    const byCombinedSlug = await prisma.product.findFirst({
      where: { slug: { equals: combinedSlug, mode: 'insensitive' } },
      include,
    })
    if (byCombinedSlug && (byCombinedSlug.isVisible !== false)) return byCombinedSlug
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
    if (bySku && (bySku.isVisible !== false)) return bySku
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
    const title = `${product.name} - ${product.brand} | James Sax Corner`
    const description = product.description
      ? product.description.substring(0, 160).replace(/\n/g, ' ').replace(/<[^>]*>/g, '') + '...'
      : `Buy ${product.name} by ${product.brand} at James Sax Corner. Premium ${product.category} with professional quality. Serial: ${product.sku}. Price: $${product.price.toLocaleString()}.`

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
  try {
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
              "item": `${process.env.NEXT_PUBLIC_BASE_URL || "https://jamessaxcorner.com"}/brand/${brandSlug}`
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
                  <Link href={`/brand/${brandSlug}`} className="text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">
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
  } catch (error) {
    console.error('Error fetching product:', error)
    notFound()
  }
}
