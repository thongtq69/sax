import nodemailer from "nodemailer"
import { emailBannerBase64 } from "./email-banner-base64"

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

// Email header with CID image - embedded as attachment for reliable display
const getEmailHeader = () => `
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding: 30px;">
        <img src="cid:logo_banner_v4" alt="James Sax Corner" style="max-width: 300px; height: auto; display: block; margin: 0 auto;" />
      </td>
    </tr>
  </table>
`

// Common attachments for all emails
const getEmailAttachments = () => {
  const content = Buffer.from(emailBannerBase64.replace(/^data:image\/\w+;base64,/, ""), 'base64')
  return [
    {
      filename: 'email-banner.png',
      content,
      cid: 'logo_banner_v4'
    }
  ]
}


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
    <body style="font-family: Georgia, 'Times New Roman', serif; line-height: 1.8; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background: #ffffff;">
      ${getEmailHeader()}
      
      <div style="padding: 30px 40px;">
        <p style="margin: 0 0 20px 0; font-size: 16px;">
          Dear ${name || 'User'},
        </p>
        
        <p style="margin: 0 0 25px 0; font-size: 16px;">
          Thank you for registering at James Sax Corner.
        </p>
        
        <p style="margin: 20px 0; font-size: 15px;">
          Please verify your email address by clicking the button below:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background: #1a365d; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        
        <p style="margin: 20px 0; font-size: 15px;">
          Or copy and paste this link into your browser:
        </p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 25px 0;">
          <p style="margin: 0; font-size: 14px; word-break: break-all; color: #1a365d;">
            ${verifyUrl}
          </p>
        </div>
        
        <p style="margin: 20px 0; font-size: 15px;">
          This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
        </p>
        
        <div style="margin-top: 40px; font-size: 16px;">
          <p style="margin: 0 0 15px 0;">Kind regards,</p>
          <p style="margin: 0 0 5px 0; font-weight: bold;">James</p>
          <p style="margin: 0 0 5px 0;">James Sax Corner</p>
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
    <body style="font-family: Georgia, 'Times New Roman', serif; line-height: 1.8; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background: #ffffff;">
      ${getEmailHeader()}
      
      <div style="padding: 30px 40px;">
        <p style="margin: 0 0 20px 0; font-size: 16px;">
          Dear ${name || 'User'},
        </p>
        
        <p style="margin: 0 0 25px 0; font-size: 16px;">
          Thank you for registering at James Sax Corner.
        </p>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: bold; color: #1a365d;">
            Your Verification Code:
          </p>
          <p style="margin: 0; font-size: 32px; font-weight: bold; color: #1a365d; letter-spacing: 5px; text-align: center;">
            ${otp}
          </p>
        </div>
        
        <p style="margin: 20px 0; font-size: 15px;">
          Enter this code on the verification page to complete your registration.
        </p>

        <p style="margin: 20px 0; font-size: 15px;">
          This code will expire in 15 minutes.
        </p>
        
        <p style="margin: 20px 0; font-size: 15px;">
          If you didn't create an account, you can safely ignore this email.
        </p>
        
        <div style="margin-top: 40px; font-size: 16px;">
          <p style="margin: 0 0 15px 0;">Kind regards,</p>
          <p style="margin: 0 0 5px 0; font-weight: bold;">James</p>
          <p style="margin: 0 0 5px 0;">James Sax Corner</p>
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
    <body style="font-family: Georgia, 'Times New Roman', serif; line-height: 1.8; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background: #ffffff;">
      ${getEmailHeader()}
      
      <div style="padding: 30px 40px;">
        <p style="margin: 0 0 20px 0; font-size: 16px;">
          Dear ${name || 'User'},
        </p>
        
        <p style="margin: 0 0 25px 0; font-size: 16px;">
          We received a request to reset your password for your James Sax Corner account.
        </p>
        
        <p style="margin: 20px 0; font-size: 15px;">
          Click the button below to create a new password:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #1a365d; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p style="margin: 20px 0; font-size: 15px;">
          Or copy and paste this link into your browser:
        </p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 25px 0;">
          <p style="margin: 0; font-size: 14px; word-break: break-all; color: #1a365d;">
            ${resetUrl}
          </p>
        </div>
        
        <p style="margin: 20px 0; font-size: 15px;">
          This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
        </p>
        
        <div style="margin-top: 40px; font-size: 16px;">
          <p style="margin: 0 0 15px 0;">Kind regards,</p>
          <p style="margin: 0 0 5px 0; font-weight: bold;">James</p>
          <p style="margin: 0 0 5px 0;">James Sax Corner</p>
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
    subtotal,
    shipping,
    total,
  } = data

  // Get instrument name (first item or list all)
  const instrumentName = items.length === 1 
    ? items[0].name 
    : items.map(item => item.name).join(', ')
  
  // Calculate price (subtotal without shipping)
  const price = subtotal

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
          Thank you for your purchase from <strong>James Sax Corner</strong>.
        </p>
        
        <p style="margin: 0 0 25px 0; font-size: 16px;">
          We are pleased to confirm receipt of your order:
        </p>
        
        <div style="margin: 25px 0; font-size: 16px;">
          <p style="margin: 0 0 10px 0;">
            <strong>Order Number:</strong> #${orderNumber}
          </p>
          <p style="margin: 0 0 10px 0;">
            <strong>Instrument:</strong> ${instrumentName}
          </p>
          <p style="margin: 0 0 10px 0;">
            <strong>Price:</strong> $${price.toLocaleString()}
          </p>
          <p style="margin: 0 0 10px 0;">
            <strong>Shipping:</strong> $${shipping.toLocaleString()}
          </p>
          <p style="margin: 0 0 10px 0;">
            <strong>Total:</strong> $${total.toLocaleString()}
          </p>
          <p style="margin: 0 0 10px 0;">
            <strong>Status:</strong> Order confirmed and in preparation
          </p>
        </div>
        
        <div style="margin: 30px 0;">
          <p style="margin: 0 0 15px 0; font-size: 16px;">
            Please note the following important information:
          </p>
          <ul style="margin: 0; padding-left: 20px; font-size: 15px;">
            <li style="margin-bottom: 10px;">All instruments are professionally inspected, regulated, and prepared before shipment.</li>
            <li style="margin-bottom: 10px;">This is a <strong>non-returnable sale</strong>, as clearly stated in the listing, due to the nature of international logistics.</li>
            <li style="margin-bottom: 10px;">For <strong>US customers</strong>, we will cover import duties on your behalf.</li>
            <li style="margin-bottom: 10px;">We will send you a <strong>detailed inspection video</strong> showing the condition and playability of the instrument before shipment. Please keep an eye on your inbox.</li>
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
    subject: `Order #${orderNumber} – James Sax Corner Order Confirmation`,
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


interface InquiryEmailData {
  name: string
  email: string
  inquiryType: string
  message: string
  productName?: string
  productSku?: string
}

export async function sendInquiryConfirmationEmail(data: InquiryEmailData) {
  const { name, email, inquiryType, message, productName, productSku } = data

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Inquiry Received</title>
    </head>
    <body style="font-family: Georgia, 'Times New Roman', serif; line-height: 1.8; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background: #ffffff;">
      ${getEmailHeader()}
      
      <div style="padding: 30px 40px;">
        <p style="margin: 0 0 20px 0; font-size: 16px;">
          Dear ${name},
        </p>
        
        <p style="margin: 0 0 25px 0; font-size: 16px;">
          Thank you for contacting James Sax Corner.
        </p>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: bold; color: #1a365d;">
            Your Inquiry Details:
          </p>
          <p style="margin: 0 0 10px 0; font-size: 15px;">
            <strong>Type:</strong> ${inquiryType}
          </p>
          ${productName ? `
          <p style="margin: 0 0 10px 0; font-size: 15px;">
            <strong>Product:</strong> ${productName}${productSku ? ` (${productSku})` : ''}
          </p>
          ` : ''}
          <p style="margin: 0 0 10px 0; font-size: 15px;">
            <strong>Message:</strong>
          </p>
          <p style="margin: 0; font-size: 15px; color: #555; white-space: pre-wrap; background: #fff; padding: 15px; border-radius: 5px; border: 1px solid #e0e0e0;">
${message}
          </p>
        </div>
        
        <p style="margin: 20px 0; font-size: 15px;">
          We have received your message and will respond shortly.
        </p>

        <p style="margin: 20px 0; font-size: 15px;">
          Your inquiry is important to us, and we will review it carefully.
        </p>
        
        <p style="margin: 20px 0; font-size: 15px;">
          In the meantime, you may visit our website to view our current selection of professional saxophones:
        </p>

        <p style="margin: 20px 0; font-size: 15px;">
          <a href="https://jamessaxcorner.com" style="color: #1a365d; text-decoration: none;">https://jamessaxcorner.com</a>
        </p>
        
        <p style="margin: 20px 0; font-size: 15px;">
          We appreciate your interest and look forward to assisting you.
        </p>
        
        <div style="margin-top: 40px; font-size: 16px;">
          <p style="margin: 0 0 15px 0;">Kind regards,</p>
          <p style="margin: 0 0 5px 0; font-weight: bold;">James</p>
          <p style="margin: 0 0 5px 0;">James Sax Corner</p>
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

  await transporter.sendMail({
    from: `"James Sax Corner" <${fromEmail}>`,
    to: email,
    subject: `Inquiry Received - James Sax Corner`,
    html,
    attachments: getEmailAttachments(),
  })
}


export async function sendEmailChangeVerification(email: string, token: string, name?: string) {
  const verifyUrl = `${baseUrl}/auth/verify-email-change?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your New Email</title>
    </head>
    <body style="font-family: Georgia, 'Times New Roman', serif; line-height: 1.8; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background: #ffffff;">
      ${getEmailHeader()}
      
      <div style="padding: 30px 40px;">
        <p style="margin: 0 0 20px 0; font-size: 16px;">
          Dear ${name || 'User'},
        </p>
        
        <p style="margin: 0 0 25px 0; font-size: 16px;">
          You have requested to change your email address to this one.
        </p>
        
        <p style="margin: 20px 0; font-size: 15px;">
          Please verify by clicking the button below:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background: #1a365d; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Verify New Email
          </a>
        </div>
        
        <p style="margin: 20px 0; font-size: 15px;">
          Or copy and paste this link into your browser:
        </p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 25px 0;">
          <p style="margin: 0; font-size: 14px; word-break: break-all; color: #1a365d;">
            ${verifyUrl}
          </p>
        </div>
        
        <p style="margin: 20px 0; font-size: 15px;">
          This link will expire in 24 hours. If you didn't request this change, you can safely ignore this email.
        </p>
        
        <div style="margin-top: 40px; font-size: 16px;">
          <p style="margin: 0 0 15px 0;">Kind regards,</p>
          <p style="margin: 0 0 5px 0; font-weight: bold;">James</p>
          <p style="margin: 0 0 5px 0;">James Sax Corner</p>
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

  await transporter.sendMail({
    from: `"James Sax Corner" <${fromEmail}>`,
    to: email,
    subject: "Verify Your New Email - James Sax Corner",
    html,
    attachments: getEmailAttachments(),
  })
}


export async function sendWelcomeEmail(email: string, name?: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to James Sax Corner</title>
    </head>
    <body style="font-family: Georgia, 'Times New Roman', serif; line-height: 1.8; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background: #ffffff;">
      ${getEmailHeader()}
      
      <div style="padding: 30px 40px;">
        <p style="margin: 0 0 20px 0; font-size: 16px;">
          Dear ${name || 'Valued Customer'},
        </p>
        
        <p style="margin: 0 0 25px 0; font-size: 16px;">
          Welcome to <strong>James Sax Corner</strong>, and thank you for creating an account with us.
        </p>
        
        <p style="margin: 0 0 20px 0; font-size: 16px;">
          Your account has been successfully set up. You can now:
        </p>
        
        <ul style="margin: 0 0 25px 0; padding-left: 20px; font-size: 15px;">
          <li style="margin-bottom: 8px;">View and manage your account details</li>
          <li style="margin-bottom: 8px;">Track orders and shipment updates</li>
          <li style="margin-bottom: 8px;">Receive important notifications related to your purchases</li>
        </ul>
        
        <p style="margin: 0 0 20px 0; font-size: 16px;">
          We specialize exclusively in <strong>professional and premium saxophones</strong>, with each instrument carefully inspected and prepared before sale.
        </p>
        
        <p style="margin: 0 0 25px 0; font-size: 16px;">
          If you have any questions or need assistance, feel free to contact us at any time — we are always happy to help.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${baseUrl}/shop" style="background: #1a365d; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Browse Our Collection
          </a>
        </div>
        
        <p style="margin: 20px 0 0 0; font-size: 16px;">
          Thank you for your interest and trust.
        </p>
        
        <div style="margin-top: 30px; font-size: 16px;">
          <p style="margin: 0 0 10px 0;">Kind regards,</p>
          <p style="margin: 0 0 5px 0; font-weight: bold;">James</p>
          <p style="margin: 0;">James Sax Corner</p>
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

  await transporter.sendMail({
    from: `"James Sax Corner" <${fromEmail}>`,
    to: email,
    subject: "Welcome to James Sax Corner",
    html,
    attachments: getEmailAttachments(),
  })
}
