import { NextResponse } from 'next/server'
import {
    getRealtimeActiveUsers,
    getRealtimeDevices,
    getHistoricalStats,
    getTopPages,
    getTrafficSources,
    getGeoStats,
    getEngagementMetrics,
    getBrowserStats
} from '@/lib/ga4-realtime'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')

    try {
        const [
            activeUsers,
            devices,
            historicalStats,
            topPages,
            sources,
            geo,
            engagement,
            browsers
        ] = await Promise.all([
            getRealtimeActiveUsers().catch(() => 0),
            getRealtimeDevices().catch(() => []),
            getHistoricalStats(days).catch(() => []),
            getTopPages(days).catch(() => []),
            getTrafficSources(days).catch(() => []),
            getGeoStats(days).catch(() => []),
            getEngagementMetrics(days).catch(() => null),
            getBrowserStats(days).catch(() => []),
        ])

        return NextResponse.json({
            activeUsers,
            devices,
            historicalStats,
            topPages,
            sources,
            geo,
            engagement,
            browsers,
        })
    } catch (error: any) {
        console.error('Error fetching analytics data:', error)
        return NextResponse.json(
            { error: 'Failed to fetch analytics data', message: error?.message },
            { status: 500 }
        )
    }
}

