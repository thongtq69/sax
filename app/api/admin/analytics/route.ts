import { NextResponse } from 'next/server'
import {
    getRealtimeActiveUsers,
    getRealtimeDevices,
    getHistoricalStats,
    getTopPages
} from '@/lib/ga4-realtime'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const [activeUsers, devices, historicalStats, topPages] = await Promise.all([
            getRealtimeActiveUsers().catch(() => 0),
            getRealtimeDevices().catch(() => []),
            getHistoricalStats().catch(() => []),
            getTopPages().catch(() => []),
        ])

        return NextResponse.json({
            activeUsers,
            devices,
            historicalStats,
            topPages,
        })
    } catch (error: any) {
        console.error('Error fetching analytics data:', error)
        return NextResponse.json(
            { error: 'Failed to fetch analytics data', message: error?.message },
            { status: 500 }
        )
    }
}
