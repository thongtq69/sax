import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { transformProduct } from '@/lib/api'
import { generateSlug } from '@/lib/slug-utils'
import { ModelPageClient } from '@/components/model/ModelPageClient'
import { StructuredData } from '@/components/seo/StructuredData'

// Helper: find products matching a model slug (formerly brand + model)
async function findModelProductsBySlug(slug: string) {
    const modelDecoded = decodeURIComponent(slug).toLowerCase()

    // 1. Try strategy for new format: brand-model-subcategory-saxophone
    // Fetch relevant products to filter in memory
    const allProducts = await prisma.product.findMany({
        where: {
            stockStatus: { not: 'archived' },
        },
        include: {
            category: { select: { id: true, name: true, slug: true } },
            subcategory: { select: { id: true, name: true, slug: true } },
            reviews: { select: { rating: true } },
        },
    })

    const matches = allProducts.filter(p => {
        const normalizedBrand = p.brand.toLowerCase().replace(/\s+/g, '-')
        const normalizedModel = (p.subBrand || '').toLowerCase().replace(/\s+/g, '-')

        const brandMatch = modelDecoded.includes(normalizedBrand)
        const modelMatch = normalizedModel && modelDecoded.includes(normalizedModel)

        // Strategy 1: Exact match with the full generated slug
        const pSlug = generateSlug(`${p.brand} ${p.subBrand} ${p.subcategory?.name || ''} saxophone`)
        if (pSlug === modelDecoded) return true

        // Strategy 2: Direct model match
        if (normalizedModel === modelDecoded) return true

        // Strategy 3: URL contains both brand and model (handles missing subcategory or variants)
        if (brandMatch && modelMatch) return true

        // Strategy 4: Fallback for when subBrand is null - check if name contains the model part
        // If we slugify the name, does it contain the requested model slug?
        const nameSlug = generateSlug(p.name)
        if (nameSlug.includes(modelDecoded)) return true

        return false
    })

    if (matches.length > 0) return matches

    // 2. Legacy fallback: Direct match subBrand
    const legacyMatches = await prisma.product.findMany({
        where: {
            subBrand: { mode: 'insensitive', equals: modelDecoded },
            stockStatus: { not: 'archived' },
        },
        include: {
            category: { select: { id: true, name: true, slug: true } },
            subcategory: { select: { id: true, name: true, slug: true } },
            reviews: { select: { rating: true } },
        },
    })

    return legacyMatches
}

export async function generateMetadata({
    params,
}: {
    params: { slug: string }
}): Promise<Metadata> {
    const sampleProducts = await findModelProductsBySlug(params.slug)
    const sampleProduct = sampleProducts.length > 0 ? sampleProducts[0] : null

    const modelName = decodeURIComponent(params.slug).replace(/-/g, ' ')
    const displayBrand = sampleProduct?.brand || ''
    const displayModel = sampleProduct?.subBrand || modelName
    const subcategory = sampleProduct?.subcategory?.name || ''

    // Clean up model name
    let name = displayModel
    if (name.toLowerCase().startsWith(displayBrand.toLowerCase())) {
        name = name.substring(displayBrand.length).trim()
    }
    if (name.toLowerCase().endsWith('saxophone')) {
        name = name.substring(0, name.length - 9).trim()
    }
    if (subcategory && name.toLowerCase().endsWith(subcategory.toLowerCase())) {
        name = name.substring(0, name.length - subcategory.length).trim()
    }
    const cleanModelName = `${displayBrand} ${name} ${subcategory} Saxophone`.replace(/\s+/g, ' ').trim()

    // Smart identify Origin
    const lowerBrand = displayBrand.toLowerCase()
    let origin = 'Premium'
    if (lowerBrand.includes('yamaha') || lowerBrand.includes('yanagisawa')) origin = 'Japanese'
    else if (lowerBrand.includes('selmer') || lowerBrand.includes('buffet')) origin = 'French'
    else if (lowerBrand.includes('keilwerth') || lowerBrand.includes('b&s')) origin = 'German'
    else if (lowerBrand.includes('conn') || lowerBrand.includes('king') || lowerBrand.includes('martin') || lowerBrand.includes('buescher')) origin = 'American'
    else if (lowerBrand.includes('mauriat') || lowerBrand.includes('eastman') || lowerBrand.includes('cannonball')) origin = 'Taiwanese'

    // Smart identify Level
    let modelLevel = 'Professional Model'
    if (sampleProduct?.category?.slug === 'student-instruments') {
        modelLevel = 'Student Model'
    }

    const title = `${cleanModelName} | ${modelLevel} | James Sax Corner`
    const description = `${cleanModelName}s carefully inspected and professionally prepared. Premium ${origin} instruments with worldwide shipping available at James Sax Corner.`

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
    const apiProducts = await findModelProductsBySlug(params.slug)

    if (apiProducts.length === 0) {
        notFound()
    }

    const products = apiProducts.map(transformProduct)
    const displayBrand = apiProducts[0].brand
    const brandSlug = generateSlug(displayBrand)
    const modelName = decodeURIComponent(params.slug).replace(/-/g, ' ')
    const displayModel = apiProducts[0].subBrand || modelName
    const subcategoryName = apiProducts[0]?.subcategory?.name || ''

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

    const representativeImage = products.find(p => p.images?.length > 0)?.images[0] || null
    const subcategories = [...new Set(apiProducts.map(p => p.subcategory?.name).filter((n): n is string => !!n))]

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

    const modelSpecs: Record<string, string> = {}
    Object.entries(allSpecs).forEach(([key, values]) => {
        modelSpecs[key] = values.size === 1 ? Array.from(values)[0] : Array.from(values).join(', ')
    })

    const getFullModelName = () => {
        let name = displayModel

        // Remove brand from the start if it exists
        if (name.toLowerCase().startsWith(displayBrand.toLowerCase())) {
            name = name.substring(displayBrand.length).trim()
        }

        // Remove "saxophone" from the end if it's already there
        if (name.toLowerCase().endsWith('saxophone')) {
            name = name.substring(0, name.length - 9).trim()
        }

        // Remove subcategory if it's already at the end of the name
        if (subcategoryName && name.toLowerCase().endsWith(subcategoryName.toLowerCase())) {
            name = name.substring(0, name.length - subcategoryName.length).trim()
        }

        return `${displayBrand} ${name} ${subcategoryName} Saxophone`.replace(/\s+/g, ' ').trim()
    }

    const fullModelName = getFullModelName()

    const modelData = {
        brand: displayBrand,
        model: fullModelName,
        products,
        priceRange,
        inStockCount,
        totalListings: products.length,
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews,
        representativeImage,
        categories: subcategories,
        modelSpecs,
    }

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
                "item": `${process.env.NEXT_PUBLIC_BASE_URL || "https://jamessaxcorner.com"}/b/${brandSlug}-saxophones`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": modelData.model,
                "item": `${process.env.NEXT_PUBLIC_BASE_URL || "https://jamessaxcorner.com"}/p/${params.slug}`
            }
        ]
    }

    const productGroupSchema = {
        "@context": "https://schema.org",
        "@type": "ProductGroup",
        "name": modelData.model,
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
