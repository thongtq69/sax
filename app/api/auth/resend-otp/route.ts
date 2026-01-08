import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { sendOTPEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { success: false, message: "Email is already verified" },
        { status: 400 }
      )
    }

    // Delete old OTP tokens for this email
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email.toLowerCase(),
        type: "otp-verification"
      }
    })

    // Generate new OTP
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
      await sendOTPEmail(email, otp, user.name || undefined)
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError)
      return NextResponse.json(
        { success: false, message: "Failed to send OTP email" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "New OTP code has been sent to your email"
    })

  } catch (error) {
    console.error("Resend OTP error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while resending OTP" },
      { status: 500 }
    )
  }
}
