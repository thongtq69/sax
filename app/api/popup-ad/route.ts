import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const popupAd = await prisma.popupAd.findFirst({
            where: { isActive: true },
            orderBy: { updatedAt: 'desc' },
        })

        return NextResponse.json(popupAd)
    } catch (error) {
        console.error('Error fetching active popup ad:', error)
        return NextResponse.json({ error: 'Failed to fetch popup ad' }, { status: 500 })
    }
}
