import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateUniqueOrderNumber } from '@/lib/order-utils'
import { auth } from '@/lib/auth'
import { calculateServerOrderPricing } from '@/lib/order-pricing'
import { generateGuestAccessToken, getSecureOrderPath } from '@/lib/guest-order'

export const dynamic = 'force-dynamic'

// Create order in database before redirecting to PayPal Standard
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, shippingInfo, billingInfo, couponCode } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      )
    }

    const address = shippingInfo || billingInfo
    if (!address?.email || !address?.zip || !address?.phone || !address?.country) {
      return NextResponse.json({ error: 'Complete billing and shipping information is required' }, { status: 400 })
    }

    const orderNumber = generateUniqueOrderNumber()
    const pricing = await calculateServerOrderPricing(items, address.country, couponCode)
    const session = await auth()
    const authenticatedUserId = session?.user?.id || null
    const guestAccessToken = authenticatedUserId ? null : generateGuestAccessToken()

    // Create order in database with pending status
    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: 'pending',
        total: pricing.total,
        discount: pricing.discount,
        couponCode: pricing.couponCode,
        ...(authenticatedUserId && { userId: authenticatedUserId }),
        guestAccessToken,
        billingAddress: billingInfo || address,
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
        ...(pricing.items.length > 0 && {
          items: {
            create: pricing.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        }),
      },
    })

    return NextResponse.json({
      orderId: order.orderNumber, // Return orderNumber instead of id
      secureOrderPath: guestAccessToken ? getSecureOrderPath(order.orderNumber || order.id, guestAccessToken) : null,
      payment: pricing,
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
