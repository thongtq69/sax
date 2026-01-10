import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Handle PayPal return - both GET and POST
// PayPal sometimes sends POST instead of GET when returning from payment
// PayPal also sends customer info in the return data

export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  
  // Get form data if any
  try {
    const formData = await request.formData()
    
    // Extract any relevant parameters from form data
    const params = new URLSearchParams()
    formData.forEach((value, key) => {
      if (typeof value === 'string') {
        params.append(key, value)
      }
    })
    
    // Also preserve any query parameters
    url.searchParams.forEach((value, key) => {
      if (!params.has(key)) {
        params.append(key, value)
      }
    })
    
    // Get order ID
    const orderId = params.get('orderId') || params.get('custom') || params.get('invoice')
    
    // Extract PayPal customer info from return data
    const payerEmail = params.get('payer_email')
    const payerFirstName = params.get('first_name')
    const payerLastName = params.get('last_name')
    const addressName = params.get('address_name')
    const addressStreet = params.get('address_street')
    const addressCity = params.get('address_city')
    const addressState = params.get('address_state')
    const addressZip = params.get('address_zip')
    const addressCountry = params.get('address_country')
    const addressCountryCode = params.get('address_country_code')
    const contactPhone = params.get('contact_phone')
    const txnId = params.get('txn_id')
    const paymentStatus = params.get('payment_status')
    
    console.log('PayPal Return POST data:', {
      orderId,
      payerEmail,
      payerName: `${payerFirstName} ${payerLastName}`,
      addressStreet,
      addressCity,
      txnId,
      paymentStatus,
    })
    
    // Update order with PayPal customer info if we have it
    if (orderId && (payerEmail || addressStreet)) {
      try {
        const existingOrder = await prisma.order.findUnique({
          where: { id: orderId },
        })
        
        if (existingOrder) {
          const existingShipping = existingOrder.shippingAddress as any || {}
          const existingBilling = existingOrder.billingAddress as any || {}
          
          // Only update if we have new data from PayPal
          const updateData: any = {}
          
          // Update shipping address if PayPal provided it and we don't have it
          if (addressStreet || payerEmail) {
            updateData.shippingAddress = {
              ...existingShipping,
              // PayPal data fills in missing fields
              email: existingShipping.email || payerEmail || '',
              name: existingShipping.name || addressName || `${payerFirstName || ''} ${payerLastName || ''}`.trim() || '',
              firstName: existingShipping.firstName || payerFirstName || '',
              lastName: existingShipping.lastName || payerLastName || '',
              address1: existingShipping.address1 || addressStreet || '',
              city: existingShipping.city || addressCity || '',
              state: existingShipping.state || addressState || '',
              zip: existingShipping.zip || addressZip || '',
              country: existingShipping.country || addressCountry || '',
              countryCode: existingShipping.countryCode || addressCountryCode || '',
              phone: existingShipping.phone || contactPhone || '',
            }
          }
          
          // Update billing/payment info
          if (payerEmail || txnId) {
            updateData.billingAddress = {
              ...existingBilling,
              payerEmail: existingBilling.payerEmail || payerEmail || '',
              firstName: existingBilling.firstName || payerFirstName || '',
              lastName: existingBilling.lastName || payerLastName || '',
              txnId: existingBilling.txnId || txnId || '',
              paymentStatus: existingBilling.paymentStatus || paymentStatus || '',
            }
          }
          
          if (Object.keys(updateData).length > 0) {
            await prisma.order.update({
              where: { id: orderId },
              data: updateData,
            })
            console.log(`Order ${orderId} updated with PayPal return data`)
          }
        }
      } catch (dbError: any) {
        console.error('Error updating order from PayPal return:', dbError.message)
      }
    }
    
    // Redirect to success page with GET method
    const redirectUrl = new URL('/checkout/success', url.origin)
    redirectUrl.search = params.toString()
    
    return NextResponse.redirect(redirectUrl, { status: 303 }) // 303 forces GET
  } catch {
    // If no form data, just redirect with existing query params
    const redirectUrl = new URL('/checkout/success', url.origin)
    redirectUrl.search = url.search
    
    return NextResponse.redirect(redirectUrl, { status: 303 })
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  
  // Redirect to success page
  const redirectUrl = new URL('/checkout/success', url.origin)
  redirectUrl.search = url.search
  
  return NextResponse.redirect(redirectUrl, { status: 303 })
}
