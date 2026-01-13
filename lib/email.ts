import nodemailer from "nodemailer"
import path from "path"

const isZoho = process.env.SMTP_HOST?.includes('zoho')

// Main transporter for general emails (info@jamessaxcorner.com)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: isZoho ? false : false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false,
  },
})

// Order transporter for order confirmation emails (order@jamessaxcorner.com)
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

const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
const fromEmail = process.env.EMAIL_FROM || "noreply@jamessaxcorner.com"
const orderFromEmail = "order@jamessaxcorner.com"

// Path to email banner image for CID attachment
const emailBannerPath = path.join(process.cwd(), 'public', 'email-banner.png')

// Email header with CID image - embedded as attachment for reliable display
const getEmailHeader = () => `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #1a365d 0%, #2d4a7c 100%); border-radius: 10px 10px 0 0;">
    <tr>
      <td align="center" style="padding: 30px;">
        <img src="cid:emailbanner" alt="James Sax Corner" style="max-width: 300px; height: auto; display: block; margin: 0 auto;" />
        <p style="color: #ffd700; margin: 10px 0 0 0; font-size: 14px;">Premium Saxophones</p>
      </td>
    </tr>
  </table>
`

// Common attachments for all emails
const getEmailAttachments = () => [
  {
    filename: 'email-banner.png',
    path: emailBannerPath,
    cid: 'emailbanner' // This CID is referenced in the HTML as src="cid:emailbanner"
  }
]

export async function sendVerificationEmail(email: string, token: string, name?: string) {
  const verifyUrl = `${baseUrl}/auth/verify-email?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      ${getEmailHeader()}
      
      <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #1a365d; margin-top: 0;">Welcome${name ? `, ${name}` : ''}!</h2>
        
        <p>Thank you for registering at James Sax Corner. Please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background: #1a365d; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
        <p style="background: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">
          ${verifyUrl}
        </p>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} James Sax Corner. All rights reserved.<br>
          Hanoi, Vietnam
        </p>
      </div>
    </body>
    </html>
  `

  await transporter.sendMail({
    from: `"James Sax Corner" <${fromEmail}>`,
    to: email,
    subject: "Verify Your Email - James Sax Corner",
    html,
    attachments: getEmailAttachments(),
  })
}


export async function sendOTPEmail(email: string, otp: string, name?: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification OTP</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      ${getEmailHeader()}
      
      <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #1a365d; margin-top: 0;">Welcome${name ? `, ${name}` : ''}!</h2>
        
        <p>Thank you for registering at James Sax Corner. Please use the following OTP code to verify your email address:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="background: #f5f5f5; border: 2px dashed #1a365d; padding: 20px; border-radius: 10px; display: inline-block;">
            <p style="margin: 0; color: #666; font-size: 14px; font-weight: bold;">YOUR OTP CODE</p>
            <p style="margin: 10px 0 0 0; font-size: 36px; font-weight: bold; color: #1a365d; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${otp}
            </p>
          </div>
        </div>
        
        <p style="color: #666; font-size: 14px; text-align: center;">
          Enter this code on the verification page to complete your registration.
        </p>
        
        <p style="color: #e53e3e; font-size: 14px; margin-top: 30px; text-align: center; font-weight: bold;">
          ⚠️ This code will expire in 15 minutes
        </p>
        
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          If you didn't create an account, you can safely ignore this email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} James Sax Corner. All rights reserved.<br>
          Hanoi, Vietnam
        </p>
      </div>
    </body>
    </html>
  `

  await transporter.sendMail({
    from: `"James Sax Corner" <${fromEmail}>`,
    to: email,
    subject: "Email Verification OTP - James Sax Corner",
    html,
    attachments: getEmailAttachments(),
  })
}


export async function sendPasswordResetEmail(email: string, token: string, name?: string) {
  const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      ${getEmailHeader()}
      
      <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #1a365d; margin-top: 0;">Password Reset Request</h2>
        
        <p>Hi${name ? ` ${name}` : ''},</p>
        
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #1a365d; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
        <p style="background: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">
          ${resetUrl}
        </p>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} James Sax Corner. All rights reserved.<br>
          Hanoi, Vietnam
        </p>
      </div>
    </body>
    </html>
  `

  await transporter.sendMail({
    from: `"James Sax Corner" <${fromEmail}>`,
    to: email,
    subject: "Reset Your Password - James Sax Corner",
    html,
    attachments: getEmailAttachments(),
  })
}


interface OrderItem {
  name: string
  sku: string
  quantity: number
  price: number
  image?: string
}

interface ShippingAddress {
  firstName: string
  lastName: string
  address1: string
  address2?: string
  city: string
  state: string
  zip: string
  country: string
  phone?: string
}

interface OrderEmailData {
  orderNumber: string
  customerEmail: string
  customerName: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  shippingAddress?: ShippingAddress
  paymentMethod?: string
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const {
    orderNumber,
    customerEmail,
    customerName,
    items,
    total,
  } = data

  const instrumentNames = items.map(item => item.name).join(', ')

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
            <strong>Total Amount:</strong> $${total.toLocaleString()}
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
    from: `"James Sax Corner" <${orderFromEmail}>`,
    to: customerEmail,
    subject: `Order Confirmation #${orderNumber} - James Sax Corner`,
    html,
    attachments: getEmailAttachments(),
  })
}


export async function sendNewsletterWelcomeEmail(email: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to James Sax Corner</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
      ${getEmailHeader()}
      
      <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <span style="font-size: 48px;">🎷</span>
        </div>
        
        <h2 style="color: #1a365d; margin-top: 0; text-align: center;">Welcome to Our Musical Community!</h2>
        
        <p style="text-align: center; font-size: 16px;">
          Thank you for subscribing to the James Sax Corner newsletter!
        </p>
        
        <p style="text-align: center; color: #666;">
          You're now part of an exclusive community of saxophone enthusiasts. Here's what you can expect:
        </p>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <ul style="margin: 0; padding-left: 20px; color: #555;">
            <li style="margin-bottom: 10px;">🎵 <strong>New Arrivals</strong> - Be the first to know about new instruments</li>
            <li style="margin-bottom: 10px;">💰 <strong>Exclusive Deals</strong> - Special discounts for subscribers only</li>
            <li style="margin-bottom: 10px;">📚 <strong>Expert Tips</strong> - Saxophone care and playing advice</li>
            <li style="margin-bottom: 10px;">🎶 <strong>Community Updates</strong> - News from the saxophone world</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${baseUrl}/shop" style="background: #1a365d; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Browse Our Collection
          </a>
        </div>
        
        <p style="text-align: center; color: #666; font-size: 14px;">
          Follow us on social media for daily updates!
        </p>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} James Sax Corner. All rights reserved.<br>
          Hanoi, Vietnam<br><br>
          <a href="${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #999;">Unsubscribe</a>
        </p>
      </div>
    </body>
    </html>
  `

  await transporter.sendMail({
    from: `"James Sax Corner" <${fromEmail}>`,
    to: email,
    subject: "🎷 Welcome to James Sax Corner!",
    html,
    attachments: getEmailAttachments(),
  })
}
