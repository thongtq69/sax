import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

async function requireAdmin() {
  const session = await auth()
  return Boolean(session?.user && (session.user as any).role === 'admin')
}

// GET user detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const [user, addresses, wishlist, orders] = await Promise.all([
      prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          image: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.address.findMany({
        where: { userId: id },
        orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
      }),
      prisma.wishlist.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.findMany({
        where: { userId: id },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ])

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const productIds = Array.from(new Set([
      ...wishlist.map((item) => item.productId),
      ...orders.flatMap((order) => order.items.map((item) => item.productId)),
    ]))

    const products = productIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
            images: true,
            price: true,
            stockStatus: true,
            inStock: true,
            isVisible: true,
            status: true,
          },
        })
      : []

    const productMap = new Map(products.map((product) => [product.id, product]))

    return NextResponse.json({
      user,
      addresses,
      wishlist: wishlist.map((item) => ({
        ...item,
        product: productMap.get(item.productId) || null,
      })),
      orders: orders.map((order) => ({
        ...order,
        items: order.items.map((item) => ({
          ...item,
          product: productMap.get(item.productId) || null,
        })),
      })),
    })
  } catch (error: any) {
    console.error('Error fetching user detail:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user detail', message: error?.message },
      { status: 500 }
    )
  }
}

// DELETE user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 403 })
    }

    // Delete user (cascades to accounts, sessions, wishlist)
    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
