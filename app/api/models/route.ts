import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/models - Get products by model (subBrand)
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const brand = searchParams.get('brand')
        const model = searchParams.get('model')

        if (!brand || !model) {
            return NextResponse.json(
                { error: 'Brand and model are required' },
                { status: 400 }
            )
        }

        // Find all products matching this brand + model
        const products = await prisma.product.findMany({
            where: {
                brand: { equals: brand, mode: 'insensitive' },
                OR: [
                    { subBrand: { equals: model, mode: 'insensitive' } },
                    { subBrand: { contains: model, mode: 'insensitive' } },
                ],
                stockStatus: { not: 'archived' },
            },
            include: {
                category: {
                    select: { id: true, name: true, slug: true },
                },
                subcategory: {
                    select: { id: true, name: true, slug: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        })

        // Calculate price range
        const prices = products.map(p => p.price).filter(p => p > 0)
        const priceRange = {
            min: prices.length > 0 ? Math.min(...prices) : 0,
            max: prices.length > 0 ? Math.max(...prices) : 0,
        }

        // Aggregate stats
        const totalListings = products.length
        const inStockCount = products.filter(p => p.inStock && p.stockStatus !== 'sold-out').length
        const avgRating = products.length > 0
            ? products.reduce((sum, p) => sum + (p.rating || 0), 0) / products.length
            : 0
        const totalReviews = products.reduce((sum, p) => sum + (p.reviewCount || 0), 0)

        // Get unique categories
        const categories = [...new Set(products.map(p => p.category?.name).filter(Boolean))]

        return NextResponse.json({
            products,
            meta: {
                brand,
                model,
                totalListings,
                inStockCount,
                priceRange,
                avgRating: Math.round(avgRating * 10) / 10,
                totalReviews,
                categories,
            },
        })
    } catch (error: any) {
        console.error('Error fetching model products:', error)
        return NextResponse.json(
            { error: 'Failed to fetch model products', message: error?.message || 'Unknown error' },
            { status: 500 }
        )
    }
}

// GET /api/models/list - Get all unique models grouped by brand
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { brand } = body

        const where: any = {
            subBrand: { not: null },
            stockStatus: { not: 'archived' },
        }

        if (brand) {
            where.brand = { equals: brand, mode: 'insensitive' }
        }

        const products = await prisma.product.findMany({
            where,
            select: {
                brand: true,
                subBrand: true,
                images: true,
                price: true,
                category: { select: { name: true } },
            },
            orderBy: { brand: 'asc' },
        })

        // Group by brand + model
        const modelMap = new Map<string, {
            brand: string
            model: string
            count: number
            minPrice: number
            maxPrice: number
            image: string | null
            category: string | null
        }>()

        for (const p of products) {
            if (!p.subBrand) continue
            const key = `${p.brand}|${p.subBrand}`
            const existing = modelMap.get(key)
            if (existing) {
                existing.count++
                existing.minPrice = Math.min(existing.minPrice, p.price)
                existing.maxPrice = Math.max(existing.maxPrice, p.price)
                if (!existing.image && p.images.length > 0) {
                    existing.image = p.images[0]
                }
            } else {
                modelMap.set(key, {
                    brand: p.brand,
                    model: p.subBrand,
                    count: 1,
                    minPrice: p.price,
                    maxPrice: p.price,
                    image: p.images.length > 0 ? p.images[0] : null,
                    category: p.category?.name || null,
                })
            }
        }

        const models = Array.from(modelMap.values()).sort((a, b) => {
            if (a.brand !== b.brand) return a.brand.localeCompare(b.brand)
            return a.model.localeCompare(b.model)
        })

        return NextResponse.json({ models })
    } catch (error: any) {
        console.error('Error fetching models list:', error)
        return NextResponse.json(
            { error: 'Failed to fetch models', message: error?.message || 'Unknown error' },
            { status: 500 }
        )
    }
}
