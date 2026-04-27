import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { transformProduct } from '@/lib/api'
import { generateSlug } from '@/lib/slug-utils'
import { ModelPageClient } from '@/components/model/ModelPageClient'
import { StructuredData } from '@/components/seo/StructuredData'
import { buildCanonicalUrl, getBaseUrl } from '@/lib/seo'

export const revalidate = 300

// Words that should stay lowercase in titles (other than the first word)
const TITLE_LOWERCASE = new Set(['and', 'or', 'of', 'the', 'a', 'an', 'in', 'on', 'for', 'to'])

// Format a single token: uppercase model codes (e.g. "yts-62", "wo20", "vi"),
// otherwise capitalize the first letter.
function formatTitleToken(token: string, isFirst: boolean): string {
    if (!token) return token

    // Roman numerals (I, II, III, IV, V, VI, VII, VIII, IX, X)
    if (/^(i{1,3}|iv|vi{0,3}|ix|x)$/i.test(token)) return token.toUpperCase()

    // Hyphenated model code: letters-digits ("yts-62", "yas-875ex")
    if (/^[a-z]+-[a-z0-9]+$/i.test(token)) {
        return token.replace(/^([a-z]+)-([a-z0-9]+)$/i, (_, letters: string, rest: string) => {
            return `${letters.toUpperCase()}-${/^\d/.test(rest) ? rest.toUpperCase() : rest.toUpperCase()}`
        })
    }

    // Compact alphanumeric model code with both letters and digits ("wo20", "62m")
    if (/^[a-z0-9]+$/i.test(token) && /[a-z]/i.test(token) && /\d/.test(token)) {
        return token.toUpperCase()
    }

    // Pure digits stay as-is
    if (/^\d+$/.test(token)) return token

    // Common lowercase words (skip for first token)
    if (!isFirst && TITLE_LOWERCASE.has(token.toLowerCase())) return token.toLowerCase()

    // Default: title case (Yamaha, Tenor, Saxophone)
    return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase()
}

function formatModelDisplayName(input: string): string {
    const tokens = input.split(/\s+/).filter(Boolean)

    // Merge "letters" + "digits" pairs into hyphenated model codes
    // e.g. ["Yamaha", "yts", "62", "Tenor"] → ["Yamaha", "yts-62", "Tenor"]
    // Skip well-known non-code letter tokens (brand / category words).
    const NON_CODE_WORDS = new Set([
        'yamaha', 'selmer', 'yanagisawa', 'keilwerth', 'buffet', 'conn', 'king', 'martin',
        'buescher', 'mauriat', 'eastman', 'cannonball', 'jupiter', 'jean', 'paul',
        'tenor', 'alto', 'soprano', 'baritone', 'bass', 'sopranino', 'curved', 'straight',
        'saxophone', 'sax', 'mark', 'series', 'professional', 'student', 'intermediate',
    ])
    const merged: string[] = []
    for (let i = 0; i < tokens.length; i++) {
        const cur = tokens[i]
        const next = tokens[i + 1]
        const curIsLetters = /^[a-z]+$/i.test(cur)
        const nextIsDigits = next ? /^\d+[a-z]*$/i.test(next) : false
        if (curIsLetters && nextIsDigits && cur.length <= 4 && !NON_CODE_WORDS.has(cur.toLowerCase())) {
            merged.push(`${cur}-${next}`)
            i++
        } else {
            merged.push(cur)
        }
    }

    return merged.map((token, idx) => formatTitleToken(token, idx === 0)).join(' ')
}

// Helper: find products matching a model slug (formerly brand + model)
async function findModelProductsBySlug(slug: string) {
    const modelDecoded = decodeURIComponent(slug).toLowerCase()

    // Narrow the DB query: pull candidates whose brand/subBrand/name overlaps with the slug
    // tokens instead of loading the whole catalog into memory.
    const tokens = modelDecoded.split('-').filter((t) => t.length >= 2)
    const keywords = Array.from(new Set([modelDecoded, ...tokens]))
    const keywordConditions = keywords.flatMap((kw) => [
        { brand: { contains: kw, mode: 'insensitive' as const } },
        { subBrand: { contains: kw, mode: 'insensitive' as const } },
        { name: { contains: kw, mode: 'insensitive' as const } },
    ])

    const allProducts = await prisma.product.findMany({
        where: {
            stockStatus: { not: 'archived' },
            status: { not: 'draft' },
            ...(keywordConditions.length > 0 ? { OR: keywordConditions } : {}),
        },
        take: 200,
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
            status: { not: 'draft' },
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
    const cleanModelName = formatModelDisplayName(
        `${displayBrand} ${name} ${subcategory} Saxophone`.replace(/\s+/g, ' ').trim()
    )

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

    const title = `${cleanModelName} | ${modelLevel}`
    const description = `${cleanModelName}s carefully inspected and professionally prepared. Premium ${origin} instruments with worldwide shipping available at James Sax Corner.`
    const ogImage = sampleProduct?.images?.[0] || '/1000007654.svg'

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
            siteName: 'James Sax Corner',
            images: [ogImage],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImage],
        },
        alternates: {
            canonical: buildCanonicalUrl(`/p/${params.slug}`),
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

        return formatModelDisplayName(
            `${displayBrand} ${name} ${subcategoryName} Saxophone`.replace(/\s+/g, ' ').trim()
        )
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
                "item": getBaseUrl()
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": displayBrand,
                "item": buildCanonicalUrl(`/b/${brandSlug}-saxophones`)
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": modelData.model,
                "item": buildCanonicalUrl(`/p/${params.slug}`)
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
