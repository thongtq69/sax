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
        <h1 style="color: #fff; margin: 0; font-size: 28px;">James Sax Corner</h1>
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
        <h1 style="color: #fff; margin: 0; font-size: 28px;">James Sax Corner</h1>
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
        <h1 style="color: #fff; margin: 0; font-size: 28px;">James Sax Corner</h1>
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
