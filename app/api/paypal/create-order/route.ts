import { NextRequest, NextResponse } from 'next/server'

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
    const { items, shippingInfo } = await request.json()

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    const shipping = subtotal > 500 ? 0 : 25
    const tax = subtotal * 0.08
    const total = subtotal + shipping + tax

    const accessToken = await getAccessToken()

    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: total.toFixed(2),
          breakdown: {
            item_total: { currency_code: 'USD', value: subtotal.toFixed(2) },
            shipping: { currency_code: 'USD', value: shipping.toFixed(2) },
            tax_total: { currency_code: 'USD', value: tax.toFixed(2) },
          }
        },
        items: items.map((item: any) => ({
          name: item.name.substring(0, 127),
          quantity: item.quantity.toString(),
          unit_amount: { currency_code: 'USD', value: item.price.toFixed(2) },
        })),
        shipping: shippingInfo ? {
          name: { full_name: `${shippingInfo.firstName} ${shippingInfo.lastName}` },
          address: {
            address_line_1: shippingInfo.address1,
            address_line_2: shippingInfo.address2 || undefined,
            admin_area_2: shippingInfo.city,
            admin_area_1: shippingInfo.state,
            postal_code: shippingInfo.zip,
            country_code: 'US',
          }
        } : undefined,
      }],
    }

    const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })

    const order = await response.json()

    if (!response.ok) {
      console.error('PayPal create order error:', order)
      return NextResponse.json({ error: order.message || 'Failed to create order' }, { status: 400 })
    }

    return NextResponse.json({ orderID: order.id })
  } catch (error) {
    console.error('PayPal create order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
