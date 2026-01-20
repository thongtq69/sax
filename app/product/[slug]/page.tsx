import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { transformProduct, extractSkuFromParam } from '@/lib/api'
import { ProductDetailClient } from '@/components/product/ProductDetailClient'
import { StructuredData, generateProductSchema } from '@/components/seo/StructuredData'
import { ChevronRight, Home } from 'lucide-react'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  try {
    const sku = extractSkuFromParam(params.slug)

    let apiProduct = await prisma.product.findUnique({
      where: { sku },
      include: {
        category: true,
      },
    })

    if (!apiProduct) {
      apiProduct = await prisma.product.findUnique({
        where: { slug: params.slug },
        include: {
          category: true,
        },
      })
    }

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
      : `Buy ${product.name} by ${product.brand} at James Sax Corner. Premium ${product.category} with professional quality. SKU: ${product.sku}. Price: $${product.price.toLocaleString()}.`

    const keywords = [
      product.name,
      product.brand,
      product.category,
      'saxophone',
      'professional saxophone',
      'musical instrument',
      product.sku,
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
        canonical: `https://jamessaxcorner.com/product/${product.sku}/${product.slug}`,
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
    // New URL format: /product/SKU-slug (e.g., /product/JSC-C143LF-yamaha-yts-62-tenor-saxophone)
    // Extract SKU from the param and look up product by SKU
    const sku = extractSkuFromParam(params.slug)

    // First try to find by SKU (new format)
    let apiProduct = await prisma.product.findUnique({
      where: { sku },
      include: {
        category: {
          include: {
            subcategories: true,
          },
        },
        subcategory: true,
      },
    })

    // Fallback: try to find by slug (old format for backwards compatibility)
    if (!apiProduct) {
      apiProduct = await prisma.product.findUnique({
        where: { slug: params.slug },
        include: {
          category: {
            include: {
              subcategories: true,
            },
          },
          subcategory: true,
        },
      })
    }

    if (!apiProduct) {
      notFound()
    }

    const product = transformProduct(apiProduct)
    const brandName = product.brand || ''
    const productSchema = generateProductSchema(product)

    return (
      <div className="min-h-screen">
        {/* SEO Structured Data */}
        <StructuredData data={productSchema} />
        
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
                  <Link href={`/shop?brand=${encodeURIComponent(brandName)}`} className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">
                    {brandName}
                  </Link>
                </>
              )}
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground/50 flex-shrink-0" />
              <span className="inline-flex items-center text-secondary font-medium line-clamp-1 truncate max-w-[150px] md:max-w-none min-w-0">{product.name}</span>
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
