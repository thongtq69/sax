import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single shipping zone
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const zone = await prisma.shippingZone.findUnique({
      where: { id },
    })
    
    if (!zone) {
      return NextResponse.json({ error: 'Shipping zone not found' }, { status: 404 })
    }
    
    return NextResponse.json(zone)
  } catch (error) {
    console.error('Error fetching shipping zone:', error)
    return NextResponse.json({ error: 'Failed to fetch shipping zone' }, { status: 500 })
  }
}

// PUT update shipping zone
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    // If this is set as default, unset other defaults
    if (data.isDefault) {
      await prisma.shippingZone.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false },
      })
    }
    
    const zone = await prisma.shippingZone.update({
      where: { id },
      data: {
        name: data.name,
        countries: data.countries,
        shippingCost: data.shippingCost,
        isDefault: data.isDefault,
        order: data.order,
        isActive: data.isActive,
      },
    })
    
    return NextResponse.json(zone)
  } catch (error: any) {
    console.error('Error updating shipping zone:', error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Shipping zone not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update shipping zone' }, { status: 500 })
  }
}

// DELETE shipping zone
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.shippingZone.delete({
      where: { id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting shipping zone:', error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Shipping zone not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete shipping zone' }, { status: 500 })
  }
}
