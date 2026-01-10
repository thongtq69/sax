import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const PAYPAL_API_URL = process.env.PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

async function getAccessToken() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.log('PayPal credentials not configured - clientId:', !!clientId, 'clientSecret:', !!clientSecret)
    return null
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  try {
    const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    if (!response.ok) {
      console.error('Failed to get PayPal access token:', await response.text())
      return null
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Error getting PayPal access token:', error)
    return null
  }
}

// Search for transaction by invoice ID (our order ID)
async function searchTransaction(accessToken: string, orderId: string) {
  // Search transactions from last 30 days
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)

  const params = new URLSearchParams({
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    invoice_id: orderId,
    fields: 'all',
  })

  try {
    const response = await fetch(
      `${PAYPAL_API_URL}/v1/reporting/transactions?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      console.error('PayPal search error:', await response.text())
      return null
    }

    return response.json()
  } catch (error) {
    console.error('Error searching PayPal transactions:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('orderId')

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
  }

  try {
    // First check if order already has shipping info
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const shippingAddress = order.shippingAddress as any
    const billingAddress = order.billingAddress as any

    // If we already have complete info from IPN, return it
    if (shippingAddress?.email && shippingAddress?.address1) {
      return NextResponse.json({
        success: true,
        hasInfo: true,
        shippingAddress,
        billingAddress,
        source: 'database',
      })
    }

    // Try to get info from PayPal API
    const accessToken = await getAccessToken()
    
    if (!accessToken) {
      // No PayPal API access, return what we have
      return NextResponse.json({
        success: true,
        hasInfo: !!(shippingAddress?.email || billingAddress?.payerEmail),
        shippingAddress,
        billingAddress,
        message: 'Waiting for PayPal IPN notification',
      })
    }

    const result = await searchTransaction(accessToken, orderId)

    if (result?.transaction_details?.length > 0) {
      const txn = result.transaction_details[0]
      const payerInfo = txn.payer_info || {}
      const shippingInfo = txn.shipping_info || {}
      const txnInfo = txn.transaction_info || {}

      // Build shipping address from PayPal data
      const paypalShipping = {
        email: payerInfo.email_address || '',
        name: shippingInfo.name || `${payerInfo.payer_name?.given_name || ''} ${payerInfo.payer_name?.surname || ''}`.trim(),
        firstName: payerInfo.payer_name?.given_name || '',
        lastName: payerInfo.payer_name?.surname || '',
        address1: shippingInfo.address?.line1 || '',
        address2: shippingInfo.address?.line2 || '',
        city: shippingInfo.address?.city || '',
        state: shippingInfo.address?.state || '',
        zip: shippingInfo.address?.postal_code || '',
        country: shippingInfo.address?.country_code || '',
        phone: payerInfo.phone_number?.national_number || '',
      }

      const paypalBilling = {
        payerId: payerInfo.payer_id || '',
        payerEmail: payerInfo.email_address || '',
        firstName: payerInfo.payer_name?.given_name || '',
        lastName: payerInfo.payer_name?.surname || '',
        txnId: txnInfo.transaction_id || '',
        paymentStatus: txnInfo.transaction_status || '',
      }

      // Update order with PayPal data
      if (paypalShipping.email || paypalShipping.address1) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            shippingAddress: {
              ...shippingAddress,
              ...paypalShipping,
            },
            billingAddress: {
              ...billingAddress,
              ...paypalBilling,
            },
          },
        })

        return NextResponse.json({
          success: true,
          hasInfo: true,
          shippingAddress: { ...shippingAddress, ...paypalShipping },
          billingAddress: { ...billingAddress, ...paypalBilling },
          source: 'paypal_api',
        })
      }
    }

    // No info found yet - return what we have from database
    return NextResponse.json({
      success: true,
      hasInfo: !!(shippingAddress?.email || billingAddress?.payerEmail),
      shippingAddress,
      billingAddress,
      message: 'Payment info not yet available. Waiting for PayPal to process.',
    })

  } catch (error: any) {
    console.error('Error getting transaction:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Failed to get transaction info' 
    }, { status: 500 })
  }
}
