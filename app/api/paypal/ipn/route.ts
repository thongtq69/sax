import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// PayPal IPN (Instant Payment Notification) Handler
// This endpoint receives notifications from PayPal when payment status changes

const PAYPAL_SANDBOX_URL = 'https://ipnpb.sandbox.paypal.com/cgi-bin/webscr'
const PAYPAL_LIVE_URL = 'https://ipnpb.paypal.com/cgi-bin/webscr'

export async function POST(request: NextRequest) {
  try {
    // Get the raw body as text
    const body = await request.text()
    console.log('=== PayPal IPN Received ===')
    console.log('Raw body:', body)

    // Parse the IPN data first for logging
    const params = new URLSearchParams(body)
    const paymentStatus = params.get('payment_status')
    const txnId = params.get('txn_id')
    const receiverEmail = params.get('receiver_email')
    const mcGross = params.get('mc_gross')
    const mcCurrency = params.get('mc_currency')
    const mcShipping = params.get('mc_shipping')
    const mcFee = params.get('mc_fee')
    const tax = params.get('tax')
    const custom = params.get('custom') // Order ID
    const invoice = params.get('invoice') // Also Order ID
    
    // Payer Information from PayPal
    const payerEmail = params.get('payer_email')
    const payerFirstName = params.get('first_name')
    const payerLastName = params.get('last_name')
    const payerId = params.get('payer_id')
    const payerStatus = params.get('payer_status') // verified/unverified
    
    // Shipping Address from PayPal (what buyer entered/confirmed)
    const addressName = params.get('address_name')
    const addressStreet = params.get('address_street')
    const addressCity = params.get('address_city')
    const addressState = params.get('address_state')
    const addressZip = params.get('address_zip')
    const addressCountry = params.get('address_country')
    const addressCountryCode = params.get('address_country_code')
    const addressStatus = params.get('address_status') // confirmed/unconfirmed
    const contactPhone = params.get('contact_phone')

    console.log('Parsed IPN Data:', {
      paymentStatus,
      txnId,
      receiverEmail,
      mcGross,
      mcCurrency,
      mcShipping,
      mcFee,
      tax,
      custom,
      invoice,
    })
    
    console.log('Payer Info:', {
      payerEmail,
      payerName: `${payerFirstName} ${payerLastName}`,
      payerId,
      payerStatus,
    })
    
    console.log('Shipping Address:', {
      addressName,
      addressStreet,
      addressCity,
      addressState,
      addressZip,
      addressCountry,
      addressCountryCode,
      addressStatus,
      contactPhone,
    })

    // Verify the IPN with PayPal
    const isSandbox = process.env.PAYPAL_MODE !== 'live'
    const verifyUrl = isSandbox ? PAYPAL_SANDBOX_URL : PAYPAL_LIVE_URL
    const verifyBody = `cmd=_notify-validate&${body}`

    console.log('Verifying IPN with PayPal:', verifyUrl)

    const verifyResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Node-IPN-Verification',
      },
      body: verifyBody,
    })

    const verifyResult = await verifyResponse.text()
    console.log('IPN verification result:', verifyResult)

    // Get order ID from custom or invoice field
    const orderId = custom || invoice

    if (verifyResult !== 'VERIFIED') {
      console.error('IPN verification failed:', verifyResult)
      // Still log the attempt
      if (orderId) {
        console.log(`Unverified IPN for order ${orderId}`)
      }
      // Return 200 to prevent PayPal from retrying
      return new NextResponse('OK', { status: 200 })
    }

    console.log('IPN VERIFIED successfully')

    // Verify receiver email matches our business email
    const expectedEmail = process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL
    if (expectedEmail && receiverEmail !== expectedEmail) {
      console.error(`Receiver email mismatch: expected ${expectedEmail}, got ${receiverEmail}`)
      return new NextResponse('OK', { status: 200 })
    }

    // Process based on payment status
    if (!orderId) {
      console.error('No order ID found in IPN')
      return new NextResponse('OK', { status: 200 })
    }

    console.log(`Processing payment status "${paymentStatus}" for order ${orderId}`)

    try {
      // Check if order exists
      const existingOrder = await prisma.order.findUnique({
        where: { id: orderId },
      })

      if (!existingOrder) {
        console.error(`Order ${orderId} not found in database`)
        return new NextResponse('OK', { status: 200 })
      }

      let newStatus = existingOrder.status

      switch (paymentStatus) {
        case 'Completed':
          newStatus = 'processing'
          console.log(`Payment completed for order ${orderId}`)
          break
        case 'Pending':
          newStatus = 'pending'
          console.log(`Payment pending for order ${orderId}`)
          break
        case 'Failed':
        case 'Denied':
        case 'Expired':
          newStatus = 'cancelled'
          console.log(`Payment ${paymentStatus} for order ${orderId}`)
          break
        case 'Refunded':
        case 'Reversed':
          newStatus = 'cancelled'
          console.log(`Payment ${paymentStatus} for order ${orderId}`)
          break
        default:
          console.log(`Unknown payment status: ${paymentStatus}`)
      }

      // Build shipping address from PayPal data
      const paypalShippingAddress = {
        name: addressName || `${payerFirstName || ''} ${payerLastName || ''}`.trim(),
        firstName: payerFirstName || '',
        lastName: payerLastName || '',
        email: payerEmail || '',
        phone: contactPhone || '',
        address1: addressStreet || '',
        address2: '',
        city: addressCity || '',
        state: addressState || '',
        zip: addressZip || '',
        country: addressCountry || '',
        countryCode: addressCountryCode || '',
        addressStatus: addressStatus || '', // confirmed/unconfirmed
      }
      
      // Build billing/payer info
      const paypalPayerInfo = {
        payerId: payerId || '',
        payerEmail: payerEmail || '',
        payerStatus: payerStatus || '', // verified/unverified
        firstName: payerFirstName || '',
        lastName: payerLastName || '',
      }
      
      // Payment details
      const paymentDetails = {
        txnId: txnId || '',
        paymentStatus: paymentStatus || '',
        mcGross: mcGross || '',
        mcFee: mcFee || '',
        mcShipping: mcShipping || '',
        tax: tax || '',
        currency: mcCurrency || 'USD',
        paymentDate: new Date().toISOString(),
      }

      // Update order with PayPal customer info
      const updateData: any = {
        status: newStatus,
      }
      
      // Only update shipping address if we got data from PayPal
      if (addressStreet || addressCity || payerEmail) {
        updateData.shippingAddress = {
          ...paypalShippingAddress,
          // Merge with existing if any
          ...(existingOrder.shippingAddress as object || {}),
          // PayPal data takes priority for these fields
          email: payerEmail || (existingOrder.shippingAddress as any)?.email || '',
          name: addressName || `${payerFirstName || ''} ${payerLastName || ''}`.trim() || (existingOrder.shippingAddress as any)?.name || '',
          address1: addressStreet || (existingOrder.shippingAddress as any)?.address1 || '',
          city: addressCity || (existingOrder.shippingAddress as any)?.city || '',
          state: addressState || (existingOrder.shippingAddress as any)?.state || '',
          zip: addressZip || (existingOrder.shippingAddress as any)?.zip || '',
          country: addressCountry || (existingOrder.shippingAddress as any)?.country || '',
          phone: contactPhone || (existingOrder.shippingAddress as any)?.phone || '',
        }
      }
      
      // Store billing/payment info
      updateData.billingAddress = {
        ...paypalPayerInfo,
        ...paymentDetails,
      }

      await prisma.order.update({
        where: { id: orderId },
        data: updateData,
      })
      
      console.log(`Order ${orderId} updated:`, {
        status: newStatus,
        hasShippingAddress: !!updateData.shippingAddress,
        payerEmail,
        txnId,
      })

    } catch (dbError: any) {
      console.error('Database error:', dbError.message)
    }

    // PayPal expects a 200 response
    return new NextResponse('OK', { status: 200 })
  } catch (error: any) {
    console.error('IPN processing error:', error.message)
    // Still return 200 to prevent PayPal from retrying
    return new NextResponse('OK', { status: 200 })
  }
}

// Handle GET requests (for testing)
export async function GET() {
  const mode = process.env.PAYPAL_MODE || 'sandbox'
  const businessEmail = process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL || 'not configured'
  
  return NextResponse.json({ 
    message: 'PayPal IPN endpoint is active',
    mode,
    businessEmail: businessEmail.replace(/(.{3}).*(@.*)/, '$1***$2'), // Mask email
    timestamp: new Date().toISOString(),
  })
}
