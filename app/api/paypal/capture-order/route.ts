import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    const { orderID, items, shippingInfo, shippingCost } = await request.json()

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

    // Calculate totals - use provided shipping cost or default
    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    const shipping = shippingCost ?? (subtotal > 500 ? 0 : 25)
    const tax = subtotal * 0.08
    const total = subtotal + shipping + tax

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

    // Save order to database
    const order = await prisma.order.create({
      data: {
        status: 'paid',
        total: total,
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
          create: items.map((item: any) => ({
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

    console.log('Order saved to database:', order.id)
    console.log('Shipping address source:', finalShippingAddress ? (shippingInfo?.firstName ? 'user-provided' : 'paypal') : 'none')

    return NextResponse.json({
      status: captureData.status,
      orderID: order.id,
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
