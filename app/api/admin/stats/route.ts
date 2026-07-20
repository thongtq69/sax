import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getRealtimeActiveUsers } from '@/lib/ga4-realtime'
import { requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

// GET /api/admin/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const sinceParam = request.nextUrl.searchParams.get('since')
    const parsedSince = sinceParam ? new Date(sinceParam) : new Date(Date.now() - 24 * 60 * 60 * 1000)
    const since = Number.isNaN(parsedSince.getTime()) ? new Date(Date.now() - 24 * 60 * 60 * 1000) : parsedSince

    const [
      bannersCount,
      faqsCount,
      productsCount,
      ordersCount,
      usersCount,
      blogPostsCount,
      reviewsCount,
      inquiriesCount,
      recentOrders,
      pendingOrdersCount,
      activeUsers,
      newProducts,
      newOrders,
      newBlogPosts,
      newInquiries,
      newBanners,
      newFaqs,
      newReviews,
      newUsers,
    ] = await Promise.all([
      prisma.banner.count(),
      prisma.fAQ.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.blogPost.count(),
      prisma.review.count(),
      prisma.inquiry.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          createdAt: true,
        },
      }),
      prisma.order.count({ where: { status: 'pending' } }),
      getRealtimeActiveUsers().catch(() => 0),
      prisma.product.count({ where: { createdAt: { gt: since } } }),
      prisma.order.count({ where: { createdAt: { gt: since } } }),
      prisma.blogPost.count({ where: { createdAt: { gt: since } } }),
      prisma.inquiry.count({ where: { createdAt: { gt: since } } }),
      prisma.banner.count({ where: { createdAt: { gt: since } } }),
      prisma.fAQ.count({ where: { createdAt: { gt: since } } }),
      prisma.review.count({ where: { createdAt: { gt: since } } }),
      prisma.user.count({ where: { createdAt: { gt: since } } }),
    ])

    // Calculate total revenue.
    // Per Apr 28 feedback: paid orders must count too (customer already paid),
    // not just shipped/delivered/processing.
    const totalRevenue = await prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ['paid', 'processing', 'shipped', 'delivered'] } },
    })

    return NextResponse.json({
      stats: {
        banners: bannersCount,
        faqs: faqsCount,
        testimonials: reviewsCount, // Reviews are used as testimonials
        products: productsCount,
        orders: ordersCount,
        users: usersCount,
        blogPosts: blogPostsCount,
        reviews: reviewsCount,
        inquiries: inquiriesCount,
        pendingOrders: pendingOrdersCount,
        totalRevenue: totalRevenue._sum.total || 0,
        activeUsers: activeUsers || 0,
        newCounts: {
          products: newProducts,
          orders: newOrders,
          blogPosts: newBlogPosts,
          inquiries: newInquiries,
          banners: newBanners,
          faqs: newFaqs,
          testimonials: newReviews,
          users: newUsers,
        },
      },
      recentOrders,
    })
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats', message: error?.message },
      { status: 500 }
    )
  }
}
