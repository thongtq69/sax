import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET all subscribers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'active' | 'inactive' | 'all'

    const where = status === 'active' 
      ? { isActive: true }
      : status === 'inactive'
      ? { isActive: false }
      : {}

    const subscribers = await prisma.subscriber.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    const stats = {
      total: await prisma.subscriber.count(),
      active: await prisma.subscriber.count({ where: { isActive: true } }),
      inactive: await prisma.subscriber.count({ where: { isActive: false } }),
    }

    return NextResponse.json({ subscribers, stats })
  } catch (error) {
    console.error('Error fetching subscribers:', error)
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 })
  }
}

// DELETE subscriber
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await prisma.subscriber.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting subscriber:', error)
    return NextResponse.json({ error: 'Failed to delete subscriber' }, { status: 500 })
  }
}
