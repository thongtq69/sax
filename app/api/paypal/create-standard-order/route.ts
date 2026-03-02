import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateUniqueOrderNumber } from '@/lib/order-utils'

export const dynamic = 'force-dynamic'

// Create order in database before redirecting to PayPal Standard
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, shippingInfo, total, discount, couponCode, userId } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      )
    }

    // Validate and filter items with valid productId
    const validItems = items.filter((item: any) => {
      // Check if productId exists and is a valid MongoDB ObjectID (24 hex characters)
      const productId = item.productId || item.id
      return productId && /^[a-f\d]{24}$/i.test(productId)
    })

    // Generate unique order number (Vietnam timezone format)
    const orderNumber = generateUniqueOrderNumber()

    const productIds = validItems.map((item: any) => item.productId || item.id)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, stock: true, stockStatus: true, inStock: true },
    })

    const productMap = new Map(products.map((p) => [p.id, p]))
    const unavailable = validItems
      .map((item: any) => {
        const productId = item.productId || item.id
        const product = productMap.get(productId)
        if (!product) {
          return { productId, reason: 'Product not found' }
        }

        const requestedQty = Math.max(1, parseInt(item.quantity) || 1)
        const stock = product.stock ?? 0
        const soldOut = product.stockStatus === 'sold-out' || product.inStock === false || stock < requestedQty

        if (soldOut) {
          return {
            productId,
            name: product.name,
            reason: 'Sold out',
          }
        }

        return null
      })
      .filter(Boolean)

    if (unavailable.length > 0) {
      return NextResponse.json(
        {
          error: 'Some products are no longer available',
          unavailable,
        },
        { status: 409 }
      )
    }

    // Create order in database with pending status
    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: 'pending',
        total: total,
        discount: discount || 0,
        couponCode: couponCode || null,
        // Link to user if logged in
        ...(userId && { userId }),
        shippingAddress: shippingInfo ? {
          email: shippingInfo.email,
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          address1: shippingInfo.address1,
          address2: shippingInfo.address2,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zip: shippingInfo.zip,
          country: shippingInfo.country,
          phone: shippingInfo.phone,
        } : null,
        // Only create order items if we have valid product IDs
        ...(validItems.length > 0 && {
          items: {
            create: validItems.map((item: any) => ({
              productId: item.productId || item.id,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        }),
      },
    })

    return NextResponse.json({
      orderId: order.orderNumber, // Return orderNumber instead of id
      message: 'Order created successfully',
    })
  } catch (error: any) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order', message: error?.message },
      { status: 500 }
    )
  }
}
