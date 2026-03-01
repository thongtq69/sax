import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { transformProduct } from '@/lib/api'
import { generateSlug } from '@/lib/slug-utils'
import { ModelPageClient } from '@/components/model/ModelPageClient'
import { StructuredData } from '@/components/seo/StructuredData'

// Helper: find products matching a model slug (formerly brand + model)
// Tries multiple matching strategies since hyphens can be part of actual model names (e.g., YAS-62)
async function findModelProductsBySlug(slug: string) {
    const modelDecoded = decodeURIComponent(slug)

    // Strategy 1: Try with raw decoded slug (hyphens preserved) - handles "YAS-62"
    let products = await prisma.product.findMany({
        where: {
            subBrand: { mode: 'insensitive', equals: modelDecoded },
            stockStatus: { not: 'archived' },
        },
        include: {
            category: { select: { id: true, name: true, slug: true } },
            subcategory: { select: { id: true, name: true, slug: true } },
            reviews: { select: { rating: true } },
        },
        orderBy: { createdAt: 'desc' },
    })

    if (products.length > 0) return products

    // Strategy 2: Replace hyphens with spaces - handles "reference 54" -> "Reference 54"
    const modelWithSpaces = modelDecoded.replace(/-/g, ' ')
    products = await prisma.product.findMany({
        where: {
            subBrand: { mode: 'insensitive', equals: modelWithSpaces },
            stockStatus: { not: 'archived' },
        },
        include: {
            category: { select: { id: true, name: true, slug: true } },
            subcategory: { select: { id: true, name: true, slug: true } },
            reviews: { select: { rating: true } },
        },
        orderBy: { createdAt: 'desc' },
    })

    if (products.length > 0) return products

    // Strategy 3: Contains match with raw slug - partial match
    products = await prisma.product.findMany({
        where: {
            subBrand: { mode: 'insensitive', contains: modelDecoded },
            stockStatus: { not: 'archived' },
        },
        include: {
            category: { select: { id: true, name: true, slug: true } },
            subcategory: { select: { id: true, name: true, slug: true } },
            reviews: { select: { rating: true } },
        },
        orderBy: { createdAt: 'desc' },
    })

    return products
}

export async function generateMetadata({
    params,
}: {
    params: { slug: string }
}): Promise<Metadata> {
    // Find one product matching to get real brand/model names
    const sampleProducts = await findModelProductsBySlug(params.slug)
    const sampleProduct = sampleProducts.length > 0 ? sampleProducts[0] : null

    const modelName = decodeURIComponent(params.slug).replace(/-/g, ' ')

    const displayBrand = sampleProduct?.brand || ''
    const displayModel = sampleProduct?.subBrand || modelName
    const category = sampleProduct?.category?.name || 'Instrument'
    const title = displayBrand ? `${displayBrand} ${displayModel}` : displayModel
    const description = `Browse all ${title} listings at James Sax Corner. Find the best deals on new and used ${title} ${category.toLowerCase()}s.`

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
            siteName: 'James Sax Corner',
        },
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://jamessaxcorner.com'}/p/${params.slug}`,
        },
    }
}

export default async function ModelPage({
    params,
}: {
    params: { slug: string }
}) {
    // Find all products for this model slug
    const apiProducts = await findModelProductsBySlug(params.slug)

    if (apiProducts.length === 0) {
        notFound()
    }

    const products = apiProducts.map(transformProduct)
    const displayBrand = apiProducts[0].brand
    const brandSlug = generateSlug(displayBrand)
    const modelName = decodeURIComponent(params.slug).replace(/-/g, ' ')
    const displayModel = apiProducts[0].subBrand || modelName

    // Calculate stats
    const prices = products.map(p => p.price).filter(p => p > 0)
    const priceRange = {
        min: prices.length > 0 ? Math.min(...prices) : 0,
        max: prices.length > 0 ? Math.max(...prices) : 0,
    }

    const inStockCount = products.filter(p => p.inStock && (p as any).stockStatus !== 'sold-out').length
    const allReviews = apiProducts.flatMap(p => (p as any).reviews || [])
    const avgRating = allReviews.length > 0
        ? allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length
        : 0
    const totalReviews = allReviews.length

    // Get a representative image (first product with an image)
    const representativeImage = products.find(p => p.images?.length > 0)?.images[0] || null

    // Get categories
    const categories = [...new Set(apiProducts.map(p => p.category?.name).filter(Boolean))]

    // Collect common specs across products
    const allSpecs: Record<string, Set<string>> = {}
    products.forEach(p => {
        if (p.specs && typeof p.specs === 'object') {
            Object.entries(p.specs as Record<string, string>).forEach(([key, value]) => {
                if (key !== 'Serial' && key !== 'SN' && key !== 'SKU' && key !== 'Condition' && value) {
                    if (!allSpecs[key]) allSpecs[key] = new Set()
                    allSpecs[key].add(value)
                }
            })
        }
    })

    // Create a merged specs object (only specs that are common across all products or have a single value)
    const modelSpecs: Record<string, string> = {}
    Object.entries(allSpecs).forEach(([key, values]) => {
        if (values.size === 1) {
            modelSpecs[key] = Array.from(values)[0]
        } else {
            modelSpecs[key] = Array.from(values).join(', ')
        }
    })

    const modelData = {
        brand: displayBrand,
        model: displayModel,
        products,
        priceRange,
        inStockCount,
        totalListings: products.length,
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews,
        representativeImage,
        categories,
        modelSpecs,
    }

    // Structured data
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": process.env.NEXT_PUBLIC_BASE_URL || "https://jamessaxcorner.com"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": displayBrand,
                "item": `${process.env.NEXT_PUBLIC_BASE_URL || "https://jamessaxcorner.com"}/brand/${brandSlug}`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": displayModel,
                "item": `${process.env.NEXT_PUBLIC_BASE_URL || "https://jamessaxcorner.com"}/p/${params.slug}`
            }
        ]
    }

    const productGroupSchema = {
        "@context": "https://schema.org",
        "@type": "ProductGroup",
        "name": `${displayBrand} ${displayModel}`,
        "brand": {
            "@type": "Brand",
            "name": displayBrand
        },
        "variesBy": "https://schema.org/serialNumber",
        "hasVariant": products.slice(0, 10).map(p => ({
            "@type": "Product",
            "name": p.name,
            "sku": p.sku,
            "offers": {
                "@type": "Offer",
                "price": p.price,
                "priceCurrency": "USD",
                "availability": p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
            }
        }))
    }

    return (
        <div className="min-h-screen">
            <StructuredData data={breadcrumbSchema} />
            <StructuredData data={productGroupSchema} />
            <ModelPageClient data={modelData} brandSlug={brandSlug} modelSlug={params.slug} />
        </div>
    )
}
