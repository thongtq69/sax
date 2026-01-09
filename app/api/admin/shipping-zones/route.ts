import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET all shipping zones
export async function GET() {
  try {
    const zones = await prisma.shippingZone.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    })
    return NextResponse.json(zones)
  } catch (error) {
    console.error('Error fetching shipping zones:', error)
    return NextResponse.json({ error: 'Failed to fetch shipping zones' }, { status: 500 })
  }
}

// POST create new shipping zone
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // If this is set as default, unset other defaults
    if (data.isDefault) {
      await prisma.shippingZone.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      })
    }
    
    const zone = await prisma.shippingZone.create({
      data: {
        name: data.name,
        countries: data.countries || [],
        shippingCost: data.shippingCost || 0,
        isDefault: data.isDefault || false,
        order: data.order || 0,
        isActive: data.isActive !== false,
      },
    })
    
    return NextResponse.json(zone)
  } catch (error) {
    console.error('Error creating shipping zone:', error)
    return NextResponse.json({ error: 'Failed to create shipping zone' }, { status: 500 })
  }
}
