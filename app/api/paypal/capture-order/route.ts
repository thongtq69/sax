import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateUniqueOrderNumber } from '@/lib/order-utils'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { deductOrderStock } from '@/lib/order-stock'
import { auth } from '@/lib/auth'
import { calculateServerOrderPricing } from '@/lib/order-pricing'
import { generateGuestAccessToken, getSecureOrderPath } from '@/lib/guest-order'
import { getBaseUrl } from '@/lib/seo'

const PAYPAL_API_URL = process.env.PAYPAL_MODE === 'sandbox' 
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com'

async function getAccessToken() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await response.json()
  return data.access_token
}

export async function POST(request: NextRequest) {
  try {
    const { orderID, items, shippingInfo } = await request.json()

    const accessToken = await getAccessToken()

    // Capture the PayPal order
    const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const captureData = await response.json()

    if (!response.ok) {
      console.error('PayPal capture error:', captureData)
      return NextResponse.json({ error: captureData.message || 'Failed to capture order' }, { status: 400 })
    }

    // Extract shipping address from PayPal response
    const paypalShipping = captureData.purchase_units?.[0]?.shipping
    const paypalAddress = paypalShipping?.address
    const paypalName = paypalShipping?.name?.full_name

    // Determine final shipping address - prefer user-provided, fallback to PayPal
    let finalShippingAddress = null
    
    if (shippingInfo && shippingInfo.firstName) {
      // Use user-provided shipping info
      finalShippingAddress = {
        email: shippingInfo.email,
        firstName: shippingInfo.firstName,
        lastName: shippingInfo.lastName,
        address1: shippingInfo.address1,
        address2: shippingInfo.address2 || '',
        city: shippingInfo.city,
        state: shippingInfo.state,
        zip: shippingInfo.zip,
        country: shippingInfo.country || 'United States',
        phone: shippingInfo.phone,
      }
    } else if (paypalAddress) {
      // Use PayPal shipping address
      const nameParts = paypalName?.split(' ') || ['', '']
      finalShippingAddress = {
        email: captureData.payer?.email_address || '',
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        address1: paypalAddress.address_line_1 || '',
        address2: paypalAddress.address_line_2 || '',
        city: paypalAddress.admin_area_2 || '',
        state: paypalAddress.admin_area_1 || '',
        zip: paypalAddress.postal_code || '',
        country: paypalAddress.country_code || 'US',
        phone: '',
        source: 'paypal', // Mark that this came from PayPal
      }
    }

    const pricing = await calculateServerOrderPricing(items, finalShippingAddress?.country || 'US')
    const subtotal = pricing.subtotal
    const shipping = pricing.shipping
    const tax = 0
    const total = pricing.total
    const capturedTotal = Number(captureData.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || 0)
    if (Math.abs(capturedTotal - total) > 0.01) {
      console.error('Captured PayPal amount does not match server price', { capturedTotal, total, orderID })
      return NextResponse.json({ error: 'Payment amount does not match the current order price. Please contact support.' }, { status: 409 })
    }
    const session = await auth()
    const authenticatedUserId = session?.user?.id || null
    const guestAccessToken = authenticatedUserId ? null : generateGuestAccessToken()

    // Generate unique order number (Vietnam timezone format)
    const orderNumber = generateUniqueOrderNumber()

    // Save order to database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: 'paid',
        total: total,
        // Link to user if logged in
        ...(authenticatedUserId && { userId: authenticatedUserId }),
        guestAccessToken,
        shippingAddress: finalShippingAddress,
        billingAddress: {
          paypalOrderId: captureData.id,
          paypalPayerId: captureData.payer?.payer_id,
          paypalEmail: captureData.payer?.email_address,
          paypalName: captureData.payer?.name?.given_name + ' ' + captureData.payer?.name?.surname,
          // Store original PayPal address for reference
          paypalAddress: paypalAddress ? {
            address_line_1: paypalAddress.address_line_1,
            address_line_2: paypalAddress.address_line_2,
            city: paypalAddress.admin_area_2,
            state: paypalAddress.admin_area_1,
            postal_code: paypalAddress.postal_code,
            country_code: paypalAddress.country_code,
          } : null,
        },
        items: {
          create: pricing.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          }))
        }
      },
      include: {
        items: true
      }
    })

    console.log('Order saved to database:', order.orderNumber)
    console.log('Shipping address source:', finalShippingAddress ? (shippingInfo?.firstName ? 'user-provided' : 'paypal') : 'none')

    try {
      const stockResult = await deductOrderStock(order.id, 'paypal-capture-order')
      if (!stockResult.success) {
        console.warn('Stock deduction completed with issues:', stockResult.failures)
      }
    } catch (stockError) {
      console.error('Failed to deduct stock after capture:', stockError)
    }

    // Send order confirmation email
    try {
      const customerEmail = finalShippingAddress?.email || captureData.payer?.email_address
      const customerName = finalShippingAddress 
        ? `${finalShippingAddress.firstName} ${finalShippingAddress.lastName}`
        : `${captureData.payer?.name?.given_name || ''} ${captureData.payer?.name?.surname || ''}`.trim()

      if (customerEmail) {
        // Fetch product details for email
        const productIds = pricing.items.map((item) => item.productId)
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true, sku: true, images: true }
        })

        const productMap = new Map(products.map(p => [p.id, p]))

        const emailItems = pricing.items.map((item) => {
          const product = productMap.get(item.productId)
          return {
            name: product?.name || item.name || 'Product',
            sku: product?.sku || item.sku || '',
            quantity: item.quantity,
            price: item.price,
            image: product?.images?.[0] || undefined
          }
        })

        await sendOrderConfirmationEmail({
          orderId: order.id,
          orderNumber: order.orderNumber!,
          customerEmail,
          customerName: customerName || 'Valued Customer',
          items: emailItems,
          subtotal,
          shipping,
          tax,
          total,
          shippingAddress: finalShippingAddress ? {
            firstName: finalShippingAddress.firstName,
            lastName: finalShippingAddress.lastName,
            address1: finalShippingAddress.address1,
            address2: finalShippingAddress.address2,
            city: finalShippingAddress.city,
            state: finalShippingAddress.state,
            zip: finalShippingAddress.zip,
            country: finalShippingAddress.country,
            phone: finalShippingAddress.phone,
          } : undefined,
          secureOrderUrl: guestAccessToken
            ? `${getBaseUrl()}${getSecureOrderPath(order.orderNumber!, guestAccessToken)}`
            : undefined,
        })

        console.log('Order confirmation email sent to:', customerEmail)
      }
    } catch (emailError) {
      // Don't fail the order if email fails
      console.error('Failed to send order confirmation email:', emailError)
    }

    return NextResponse.json({
      status: captureData.status,
      orderID: order.orderNumber, // Return orderNumber instead of id
      paypalOrderID: captureData.id,
      payer: captureData.payer,
      purchase_units: captureData.purchase_units,
      shippingAddress: finalShippingAddress,
    })
  } catch (error) {
    console.error('PayPal capture error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
