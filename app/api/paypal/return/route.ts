import { NextRequest, NextResponse } from 'next/server'

// Handle PayPal return - both GET and POST
// PayPal sometimes sends POST instead of GET when returning from payment

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
