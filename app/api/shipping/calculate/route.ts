import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface CartItem {
  productId: string
  quantity: number
  shippingCost?: number | null
}

// Country code to name mapping for backward compatibility
const COUNTRY_CODE_TO_NAME: Record<string, string> = {
  'US': 'United States',
  'CA': 'Canada',
  'GB': 'United Kingdom',
  'DE': 'Germany',
  'FR': 'France',
  'IT': 'Italy',
  'ES': 'Spain',
  'NL': 'Netherlands',
  'BE': 'Belgium',
  'AU': 'Australia',
  'NZ': 'New Zealand',
  'JP': 'Japan',
  'KR': 'South Korea',
  'SG': 'Singapore',
  'MY': 'Malaysia',
  'TH': 'Thailand',
  'PH': 'Philippines',
  'ID': 'Indonesia',
  'IN': 'India',
  'CN': 'China',
  'HK': 'Hong Kong',
  'TW': 'Taiwan',
  'VN': 'Vietnam',
  'BR': 'Brazil',
  'MX': 'Mexico',
  'AR': 'Argentina',
  'CL': 'Chile',
  'ZA': 'South Africa',
  'AE': 'United Arab Emirates',
  'SA': 'Saudi Arabia',
  'IL': 'Israel',
  'RU': 'Russia',
  'PL': 'Poland',
  'SE': 'Sweden',
  'NO': 'Norway',
  'DK': 'Denmark',
  'FI': 'Finland',
  'AT': 'Austria',
  'CH': 'Switzerland',
  'PT': 'Portugal',
  'IE': 'Ireland',
  'GR': 'Greece',
  'CZ': 'Czech Republic',
  'HU': 'Hungary',
  'RO': 'Romania',
  'TR': 'Turkey',
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
    
    console.log('Calculating shipping for country code:', countryCode)
    
    // Get site settings for domestic shipping cost
    const siteSettings = await prisma.siteSettings.findFirst() as { domesticShippingCost?: number } | null
    const domesticShippingCost = siteSettings?.domesticShippingCost ?? 25
    
    // Get all active shipping zones
    const allZones = await prisma.shippingZone.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    })
    
    // Get country name from code for backward compatibility
    const countryName = COUNTRY_CODE_TO_NAME[countryCode] || countryCode
    
    console.log('Calculating shipping for:', { countryCode, countryName })
    console.log('All zones:', allZones.map(z => ({ name: z.name, countries: z.countries, cost: z.shippingCost })))
    
    // Find zone that contains this country
    // Support both country codes (TH) and country names (Thailand) for backward compatibility
    let zone = allZones.find(z => 
      z.countries.includes(countryCode) || 
      z.countries.includes(countryName)
    )
    
    console.log('Found zone:', zone?.name, 'with cost:', zone?.shippingCost)
    
    // If no specific zone found, get default zone
    if (!zone) {
      zone = allZones.find(z => z.isDefault)
      console.log('Using default zone:', zone?.name, 'with cost:', zone?.shippingCost)
    }
    
    // Default shipping cost if no zone configured
    const baseShippingCost = zone?.shippingCost ?? 200
    
    // Vietnam domestic shipping
    if (countryCode === 'VN') {
      return NextResponse.json({
        shippingCost: domesticShippingCost,
        zoneName: 'Vietnam',
        breakdown: `Domestic shipping within Vietnam: $${domesticShippingCost}`,
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
