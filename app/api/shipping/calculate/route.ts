import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface CartItem {
  productId: string
  quantity: number
  shippingCost?: number | null
}

// POST calculate shipping cost
export async function POST(request: NextRequest) {
  try {
    const { countryCode, items } = await request.json() as { 
      countryCode: string
      items: CartItem[]
    }
    
    if (!countryCode) {
      return NextResponse.json({ error: 'Country code is required' }, { status: 400 })
    }
    
    // Get shipping zone for the country
    let zone = await prisma.shippingZone.findFirst({
      where: {
        isActive: true,
        countries: { has: countryCode },
      },
    })
    
    // If no specific zone found, get default zone
    if (!zone) {
      zone = await prisma.shippingZone.findFirst({
        where: {
          isActive: true,
          isDefault: true,
        },
      })
    }
    
    // Default shipping cost if no zone configured
    const baseShippingCost = zone?.shippingCost ?? 200
    
    // Vietnam is free shipping
    if (countryCode === 'VN') {
      return NextResponse.json({
        shippingCost: 0,
        zoneName: 'Vietnam',
        breakdown: 'Free shipping within Vietnam',
      })
    }
    
    // Calculate shipping based on product-specific costs
    // Logic:
    // 1. Single product with specific shipping cost -> use that cost
    // 2. Multiple products with specific shipping costs -> use the highest one
    // 3. Products without specific shipping cost -> use zone's base cost
    // 4. Mix of products -> use the highest specific cost (covers all products)
    
    const productsWithShipping = items.filter(item => 
      item.shippingCost !== null && item.shippingCost !== undefined && item.shippingCost > 0
    )
    
    let finalShippingCost: number
    let breakdown: string
    
    if (productsWithShipping.length === 0) {
      // No products have specific shipping cost, use base zone cost
      finalShippingCost = baseShippingCost
      breakdown = `Standard shipping: $${baseShippingCost}`
    } else if (items.length === 1 && productsWithShipping.length === 1) {
      // Single product with specific shipping cost
      finalShippingCost = productsWithShipping[0].shippingCost!
      breakdown = `Product shipping: $${finalShippingCost}`
    } else {
      // Multiple products - find the highest shipping cost
      const maxProductShipping = Math.max(...productsWithShipping.map(p => p.shippingCost!))
      
      // If there are products without specific shipping, compare with base cost
      const productsWithoutShipping = items.filter(item => 
        !item.shippingCost || item.shippingCost === 0
      )
      
      if (productsWithoutShipping.length > 0) {
        // Some products don't have specific shipping - use the higher of max product shipping or base
        finalShippingCost = Math.max(maxProductShipping, baseShippingCost)
        breakdown = finalShippingCost === baseShippingCost 
          ? `Combined shipping (base rate): $${baseShippingCost}`
          : `Combined shipping (highest product rate): $${maxProductShipping}`
      } else {
        // All products have specific shipping - use the highest
        finalShippingCost = maxProductShipping
        breakdown = `Combined shipping (highest rate): $${maxProductShipping}`
      }
    }
    
    return NextResponse.json({
      shippingCost: finalShippingCost,
      zoneName: zone?.name || 'International',
      breakdown,
      baseZoneCost: baseShippingCost,
    })
  } catch (error) {
    console.error('Error calculating shipping:', error)
    return NextResponse.json({ error: 'Failed to calculate shipping' }, { status: 500 })
  }
}
