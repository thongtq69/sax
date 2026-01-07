import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PayPal IPN (Instant Payment Notification) Handler
// This endpoint receives notifications from PayPal when payment status changes

const PAYPAL_SANDBOX_URL = 'https://ipnpb.sandbox.paypal.com/cgi-bin/webscr'
const PAYPAL_LIVE_URL = 'https://ipnpb.paypal.com/cgi-bin/webscr'

export async function POST(request: NextRequest) {
  try {
    // Get the raw body as text
    const body = await request.text()
    console.log('IPN received:', body)

    // Verify the IPN with PayPal
    const verifyUrl = process.env.PAYPAL_MODE === 'live' ? PAYPAL_LIVE_URL : PAYPAL_SANDBOX_URL
    const verifyBody = `cmd=_notify-validate&${body}`

    const verifyResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: verifyBody,
    })

    const verifyResult = await verifyResponse.text()
    console.log('IPN verification result:', verifyResult)

    if (verifyResult !== 'VERIFIED') {
      console.error('IPN verification failed:', verifyResult)
      return NextResponse.json({ error: 'IPN verification failed' }, { status: 400 })
    }

    // Parse the IPN data
    const params = new URLSearchParams(body)
    const paymentStatus = params.get('payment_status')
    const txnId = params.get('txn_id')
    const receiverEmail = params.get('receiver_email')
    const payerEmail = params.get('payer_email')
    const mcGross = params.get('mc_gross')
    const mcCurrency = params.get('mc_currency')
    const custom = params.get('custom') // We'll use this for order ID
    const itemName = params.get('item_name')

    console.log('IPN Data:', {
      paymentStatus,
      txnId,
      receiverEmail,
      payerEmail,
      mcGross,
      mcCurrency,
      custom,
      itemName,
    })

    // Process based on payment status
    if (paymentStatus === 'Completed') {
      // Payment successful - update order status
      if (custom) {
        try {
          await prisma.order.update({
            where: { id: custom },
            data: {
              status: 'processing',
              // Store PayPal transaction info in metadata or a separate field
            },
          })
          console.log(`Order ${custom} updated to processing`)
        } catch (dbError) {
          console.error('Error updating order:', dbError)
        }
      }
    } else if (paymentStatus === 'Pending') {
      // Payment is pending (e.g., eCheck)
      if (custom) {
        try {
          await prisma.order.update({
            where: { id: custom },
            data: { status: 'pending' },
          })
        } catch (dbError) {
          console.error('Error updating order:', dbError)
        }
      }
    } else if (paymentStatus === 'Failed' || paymentStatus === 'Denied') {
      // Payment failed
      if (custom) {
        try {
          await prisma.order.update({
            where: { id: custom },
            data: { status: 'cancelled' },
          })
        } catch (dbError) {
          console.error('Error updating order:', dbError)
        }
      }
    } else if (paymentStatus === 'Refunded') {
      // Payment was refunded
      if (custom) {
        try {
          await prisma.order.update({
            where: { id: custom },
            data: { status: 'cancelled' },
          })
        } catch (dbError) {
          console.error('Error updating order:', dbError)
        }
      }
    }

    // PayPal expects a 200 response
    return new NextResponse('OK', { status: 200 })
  } catch (error: any) {
    console.error('IPN processing error:', error)
    // Still return 200 to prevent PayPal from retrying
    return new NextResponse('OK', { status: 200 })
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({ 
    message: 'PayPal IPN endpoint is active',
    mode: process.env.PAYPAL_MODE || 'sandbox'
  })
}
