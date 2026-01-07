import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/admin/stats - Get dashboard statistics
export async function GET() {
  try {
    const [
      bannersCount,
      faqsCount,
      productsCount,
      ordersCount,
      usersCount,
      blogPostsCount,
      reviewsCount,
      recentOrders,
      pendingOrdersCount,
    ] = await Promise.all([
      prisma.banner.count(),
      prisma.fAQ.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.blogPost.count(),
      prisma.review.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          total: true,
          createdAt: true,
        },
      }),
      prisma.order.count({ where: { status: 'pending' } }),
    ])

    // Calculate total revenue
    const totalRevenue = await prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ['delivered', 'shipped', 'processing'] } },
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
        pendingOrders: pendingOrdersCount,
        totalRevenue: totalRevenue._sum.total || 0,
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
