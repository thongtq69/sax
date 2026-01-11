import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
const fromEmail = process.env.EMAIL_FROM || "noreply@jamessaxcorner.com"

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
      <div style="background: linear-gradient(135deg, #1a365d 0%, #2d4a7c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <img src="${baseUrl}/email-logo.svg" alt="James Sax Corner" style="height: 80px; width: auto; margin: 0 auto;" />
        <p style="color: #ffd700; margin: 10px 0 0 0;">Premium Saxophones</p>
      </div>
      
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
      <div style="background: linear-gradient(135deg, #1a365d 0%, #2d4a7c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <img src="${baseUrl}/email-logo.svg" alt="James Sax Corner" style="height: 80px; width: auto; margin: 0 auto;" />
        <p style="color: #ffd700; margin: 10px 0 0 0;">Premium Saxophones</p>
      </div>
      
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
      <div style="background: linear-gradient(135deg, #1a365d 0%, #2d4a7c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <img src="${baseUrl}/email-logo.svg" alt="James Sax Corner" style="height: 80px; width: auto; margin: 0 auto;" />
        <p style="color: #ffd700; margin: 10px 0 0 0;">Premium Saxophones</p>
      </div>
      
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
    tax,
    total,
    shippingAddress,
  } = data

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 15px; border-bottom: 1px solid #e0e0e0;">
        <div style="display: flex; align-items: center;">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px; margin-right: 15px;" />` : ''}
          <div>
            <p style="margin: 0; font-weight: bold; color: #1a365d;">${item.name}</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">SKU: ${item.sku}</p>
          </div>
        </div>
      </td>
      <td style="padding: 15px; border-bottom: 1px solid #e0e0e0; text-align: center;">${item.quantity}</td>
      <td style="padding: 15px; border-bottom: 1px solid #e0e0e0; text-align: right;">$${item.price.toLocaleString()}</td>
      <td style="padding: 15px; border-bottom: 1px solid #e0e0e0; text-align: right; font-weight: bold;">$${(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `).join('')

  const shippingAddressHtml = shippingAddress ? `
    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 20px;">
      <h3 style="color: #1a365d; margin: 0 0 15px 0; font-size: 16px;">📦 Shipping Address</h3>
      <p style="margin: 0; line-height: 1.8;">
        <strong>${shippingAddress.firstName} ${shippingAddress.lastName}</strong><br>
        ${shippingAddress.address1}<br>
        ${shippingAddress.address2 ? `${shippingAddress.address2}<br>` : ''}
        ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}<br>
        ${shippingAddress.country}
        ${shippingAddress.phone ? `<br>Phone: ${shippingAddress.phone}` : ''}
      </p>
    </div>
  ` : ''

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
      <div style="background: linear-gradient(135deg, #1a365d 0%, #2d4a7c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <img src="${baseUrl}/email-logo.svg" alt="James Sax Corner" style="height: 80px; width: auto; margin: 0 auto;" />
        <p style="color: #ffd700; margin: 10px 0 0 0; font-size: 14px;">Premium Saxophones</p>
      </div>
      
      <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background: #d4edda; color: #155724; padding: 15px; border-radius: 8px; display: inline-block;">
            <span style="font-size: 24px;">✓</span>
            <p style="margin: 10px 0 0 0; font-weight: bold; font-size: 18px;">Payment Successful!</p>
          </div>
        </div>

        <h2 style="color: #1a365d; margin-top: 0; text-align: center;">Thank You for Your Order!</h2>
        
        <p style="text-align: center;">Hi <strong>${customerName}</strong>,</p>
        
        <p style="text-align: center;">We're excited to confirm your order. Here are the details:</p>
        
        <div style="background: #f0f7ff; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <p style="margin: 0; color: #666; font-size: 14px;">Order Number</p>
          <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #1a365d; letter-spacing: 2px;">#${orderNumber}</p>
        </div>

        <h3 style="color: #1a365d; border-bottom: 2px solid #1a365d; padding-bottom: 10px;">Order Summary</h3>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #1a365d;">Product</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #1a365d;">Qty</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #1a365d;">Price</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #1a365d;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
          <table style="width: 100%;">
            <tr>
              <td style="padding: 8px 0;">Subtotal:</td>
              <td style="padding: 8px 0; text-align: right;">$${subtotal.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">Shipping:</td>
              <td style="padding: 8px 0; text-align: right;">${shipping === 0 ? '<span style="color: #28a745;">FREE</span>' : `$${shipping.toLocaleString()}`}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">Tax:</td>
              <td style="padding: 8px 0; text-align: right;">$${tax.toFixed(2)}</td>
            </tr>
            <tr style="border-top: 2px solid #1a365d;">
              <td style="padding: 15px 0; font-size: 18px; font-weight: bold; color: #1a365d;">Total:</td>
              <td style="padding: 15px 0; text-align: right; font-size: 18px; font-weight: bold; color: #1a365d;">$${total.toLocaleString()}</td>
            </tr>
          </table>
        </div>

        ${shippingAddressHtml}

        <div style="background: #fff8e1; padding: 20px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #ffc107;">
          <h4 style="margin: 0 0 10px 0; color: #856404;">📋 What's Next?</h4>
          <ul style="margin: 0; padding-left: 20px; color: #856404;">
            <li>Your order will ship within 2-3 business days</li>
            <li>You'll receive a shipping confirmation email with tracking info</li>
            <li>Fast worldwide delivery with secure packaging</li>
            <li>30-day return policy for your peace of mind</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${baseUrl}/shop" style="background: #1a365d; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Continue Shopping
          </a>
        </div>

        <p style="text-align: center; margin-top: 30px; color: #666;">
          Have questions? Reply to this email or contact us at<br>
          <a href="mailto:${fromEmail}" style="color: #1a365d;">${fromEmail}</a>
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
    to: customerEmail,
    subject: `Order Confirmation #${orderNumber} - James Sax Corner`,
    html,
  })
}
