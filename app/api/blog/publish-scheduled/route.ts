import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/blog/publish-scheduled
// Runs on a Vercel cron every 15 minutes (see vercel.json).
// Flips any BlogPost whose scheduledAt has passed from "scheduled" to "published".
export async function GET(request: NextRequest) {
  // Allow Vercel cron to hit without auth, but gate manual calls
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  const isVercelCron = request.headers.get('user-agent')?.includes('vercel-cron')

  if (cronSecret && !isVercelCron && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const due = await prisma.blogPost.findMany({
      where: {
        status: 'scheduled',
        scheduledAt: { lte: now },
      },
      select: { id: true },
    })

    if (due.length === 0) {
      return NextResponse.json({ publishedCount: 0 })
    }

    await prisma.blogPost.updateMany({
      where: { id: { in: due.map((p) => p.id) } },
      data: {
        status: 'published',
        publishedAt: now,
      },
    })

    return NextResponse.json({ publishedCount: due.length, ids: due.map((p) => p.id) })
  } catch (error: any) {
    console.error('Error publishing scheduled posts:', error)
    return NextResponse.json(
      { error: 'Failed to publish scheduled posts', message: error?.message },
      { status: 500 }
    )
  }
}
