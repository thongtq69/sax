import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import path from "path"

// Order transporter using order@jamessaxcorner.com
const orderTransporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.ORDER_SMTP_USER || "order@jamessaxcorner.com",
    pass: process.env.ORDER_SMTP_PASSWORD || "",
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false,
  },
})

const emailBannerPath = path.join(process.cwd(), 'public', 'email-banner.png')

const getEmailHeader = () => `
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding: 30px;">
        <img src="cid:emailbanner" alt="James Sax Corner" style="max-width: 300px; height: auto; display: block; margin: 0 auto;" />
      </td>
    </tr>
  </table>
`

const getEmailAttachments = () => [
  {
    filename: 'email-banner.png',
    path: emailBannerPath,
    cid: 'emailbanner'
  }
]

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: "Valid email is required" },
        { status: 400 }
      )
    }

    // Sample order data
    const orderNumber = "1301260915021"
    const customerName = "John Smith"
    const instrumentNames = "Selmer Paris Series III Alto Saxophone"
    const total = "$4,850.00"

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: Georgia, 'Times New Roman', serif; line-height: 1.8; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background: #ffffff;">
        ${getEmailHeader()}
        
        <div style="padding: 30px 40px;">
          <p style="margin: 0 0 20px 0; font-size: 16px;">
            Dear ${customerName},
          </p>
          
          <p style="margin: 0 0 25px 0; font-size: 16px;">
            Thank you for your purchase at James Sax Corner. We are pleased to confirm that your order has been successfully placed.
          </p>
          
          <div style="margin: 25px 0; font-size: 16px;">
            <p style="margin: 0 0 10px 0;">
              <strong>Order Number:</strong> #${orderNumber}
            </p>
            <p style="margin: 0 0 10px 0;">
              <strong>Instrument:</strong> ${instrumentNames}
            </p>
            <p style="margin: 0 0 10px 0;">
              <strong>Total Amount:</strong> ${total}
            </p>
            <p style="margin: 0 0 10px 0;">
              <strong>Status:</strong> Payment Confirmed ✓
            </p>
          </div>
          
          <div style="margin: 30px 0;">
            <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: bold;">
              Important Information:
            </p>
            <ul style="margin: 0; padding-left: 20px; font-size: 15px;">
              <li style="margin-bottom: 8px;">For <strong>US customers</strong>, we will cover import duties on your behalf.</li>
              <li style="margin-bottom: 8px;">We will send you a <strong>detailed inspection video</strong> showing the condition and playability of the instrument before shipment. Please keep an eye on your inbox.</li>
            </ul>
          </div>
          
          <p style="margin: 20px 0; font-size: 15px;">
            Once the inspection is completed, we will proceed with express shipment via <strong>FedEx / DHL / UPS</strong>, with delivery typically taking <strong>3–4 business days</strong>.
          </p>
          
          <p style="margin: 20px 0; font-size: 15px;">
            If you have any questions, simply reply to this email — all updates for this order will be kept in one conversation for your convenience.
          </p>
          
          <div style="margin-top: 40px; font-size: 16px;">
            <p style="margin: 0 0 15px 0;">Kind regards,</p>
            <p style="margin: 0 0 5px 0; font-weight: bold;">James</p>
            <p style="margin: 0 0 5px 0;">Order Processing</p>
            <p style="margin: 0 0 10px 0;">James Sax Corner</p>
            <p style="margin: 0 0 5px 0;">
              <a href="mailto:order@jamessaxcorner.com" style="color: #1a365d; text-decoration: none;">order@jamessaxcorner.com</a>
            </p>
            <p style="margin: 0;">
              <a href="https://jamessaxcorner.com" style="color: #1a365d; text-decoration: none;">https://jamessaxcorner.com</a>
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 40px 0 20px 0;">
          
          <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
            © ${new Date().getFullYear()} James Sax Corner. All rights reserved.<br>
            Hanoi, Vietnam
          </p>
        </div>
      </body>
      </html>
    `

    await orderTransporter.sendMail({
      from: '"James Sax Corner" <order@jamessaxcorner.com>',
      to: email,
      subject: `Order Confirmation #${orderNumber} - James Sax Corner`,
      html,
      attachments: getEmailAttachments(),
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
