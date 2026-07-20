import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateServerOrderPricing } from '@/lib/order-pricing'

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

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
    }

    const validItems = items.filter((item: any) => {
      const productId = item.productId || item.id
      return productId && /^[a-f\d]{24}$/i.test(productId)
    })

    if (validItems.length !== items.length) {
      return NextResponse.json({ error: 'Invalid cart items' }, { status: 400 })
    }

    const productIds = validItems.map((item: any) => item.productId || item.id)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, stock: true, stockStatus: true, inStock: true, isVisible: true, status: true },
    })

    const productMap = new Map(products.map((product) => [product.id, product]))
    const unavailable = validItems
      .map((item: any) => {
        const productId = item.productId || item.id
        const product = productMap.get(productId)
        if (!product) return { productId, reason: 'Product not found' }

        const requestedQty = Math.max(1, parseInt(item.quantity) || 1)
        const stock = product.stock ?? 0
        const hidden = product.status === 'draft' || product.isVisible === false || product.stockStatus === 'archived'
        const soldOut = product.stockStatus === 'sold-out' || product.inStock === false || (product.stockStatus !== 'pre-order' && stock < requestedQty)

        if (hidden || soldOut) {
          return {
            productId,
            name: product.name,
            reason: hidden ? 'Product is no longer available' : 'Sold out',
          }
        }

        return null
      })
      .filter(Boolean)

    if (unavailable.length > 0) {
      return NextResponse.json(
        { error: 'Some products are no longer available', unavailable },
        { status: 409 },
      )
    }

    const pricing = await calculateServerOrderPricing(items, shippingInfo?.country || 'US')
    const subtotal = pricing.subtotal
    const shipping = pricing.shipping
    const tax = 0
    const total = pricing.total

    const accessToken = await getAccessToken()

    // Check if user provided shipping info
    const hasShippingInfo = shippingInfo && 
      shippingInfo.firstName && 
      shippingInfo.lastName && 
      shippingInfo.address1 && 
      shippingInfo.city && 
      shippingInfo.state && 
      shippingInfo.zip

    const orderData: any = {
      intent: 'CAPTURE',
      application_context: {
        // If user filled form, use their address; otherwise let PayPal provide address
        shipping_preference: hasShippingInfo ? 'SET_PROVIDED_ADDRESS' : 'GET_FROM_FILE',
        user_action: 'PAY_NOW',
        brand_name: 'James Sax Corner',
        landing_page: 'NO_PREFERENCE',
      },
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
        items: pricing.items.map((item) => ({
          name: item.name.substring(0, 127),
          sku: item.sku || undefined,
          quantity: item.quantity.toString(),
          unit_amount: { currency_code: 'USD', value: item.price.toFixed(2) },
          category: 'PHYSICAL_GOODS',
        })),
      }],
    }

    // Only add shipping address if user provided it
    if (hasShippingInfo) {
      orderData.purchase_units[0].shipping = {
        name: { full_name: `${shippingInfo.firstName} ${shippingInfo.lastName}` },
        address: {
          address_line_1: shippingInfo.address1,
          address_line_2: shippingInfo.address2 || undefined,
          admin_area_2: shippingInfo.city,
          admin_area_1: shippingInfo.state,
          postal_code: shippingInfo.zip,
          country_code: 'US',
        }
      }
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
