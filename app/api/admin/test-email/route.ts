import { NextResponse } from "next/server"
import { sendOrderConfirmationEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Sample order data for testing
    const testOrderData = {
      orderNumber: "TEST-" + Date.now().toString().slice(-6),
      customerEmail: email,
      customerName: "Test Customer",
      items: [
        {
          name: "Selmer Paris Mark VI Alto Saxophone - 1965 Original Lacquer",
          sku: "SAX-MK6-1965",
          quantity: 1,
          price: 12500,
        }
      ],
      subtotal: 12500,
      shipping: 150,
      tax: 0,
      total: 12650,
      shippingAddress: {
        firstName: "Test",
        lastName: "Customer",
        address1: "123 Test Street",
        city: "New York",
        state: "NY",
        zip: "10001",
        country: "United States",
        phone: "+1 234 567 8900"
      },
      paymentMethod: "PayPal"
    }

    await sendOrderConfirmationEmail(testOrderData)

    return NextResponse.json({
      success: true,
      message: `Test order confirmation email sent to ${email}`,
      orderNumber: testOrderData.orderNumber
    })
  } catch (error) {
    console.error("Error sending test email:", error)
    return NextResponse.json(
      { error: "Failed to send test email", details: String(error) },
      { status: 500 }
    )
  }
}
