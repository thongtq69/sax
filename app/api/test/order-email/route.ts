import { NextRequest, NextResponse } from "next/server"
import { sendOrderConfirmationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: "Valid email is required" },
        { status: 400 }
      )
    }

    // Sample order data for testing
    await sendOrderConfirmationEmail({
      orderNumber: "1301260915021",
      customerEmail: email,
      customerName: "John Smith",
      items: [
        {
          name: "Selmer Paris Series III Alto Saxophone",
          sku: "SEL-SIII-ALTO",
          quantity: 1,
          price: 4650,
        }
      ],
      subtotal: 4650,
      shipping: 200,
      tax: 0,
      total: 4850,
    })

    return NextResponse.json({
      success: true,
      message: `Order confirmation email sent to ${email}!`
    })

  } catch (error) {
    console.error("Test email error:", error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 }
    )
  }
}
