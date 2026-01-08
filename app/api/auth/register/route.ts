import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { sendVerificationEmail } from "@/lib/email"

// Password validation: 8+ chars, uppercase, lowercase, number
function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters" }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter" }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" }
  }
  return { valid: true }
}

// Email validation
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, message: "Email, password, and name are required" },
        { status: 400 }
      )
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validate password
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, message: passwordValidation.message },
        { status: 400 }
      )
    }


    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "This email is already registered. Please login or use a different email." },
        { status: 400 }
      )
    }

    // Hash password with bcrypt (cost factor 12)
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
        role: "user",
      }
    })

    // Generate OTP code (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token,
        otp,
        type: "otp-verification",
        expires,
      }
    })

    // Send OTP email
    try {
      const { sendOTPEmail } = await import("@/lib/email")
      await sendOTPEmail(email, otp, name)
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError)
      // Don't fail registration if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Registration successful! Please check your email for the OTP code.",
      userId: user.id,
      email: email.toLowerCase()
    })

  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred during registration" },
      { status: 500 }
    )
  }
}
