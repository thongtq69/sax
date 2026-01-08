import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { sendVerificationEmail } from "@/lib/email"

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

    // Find user by email
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

    // Delete any existing verification tokens for this user
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email.toLowerCase(),
        type: "email-verification"
      }
    })

    // Generate new verification token
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token,
        type: "email-verification",
        expires,
      }
    })

    // Send verification email
    await sendVerificationEmail(email, token, user.name || undefined)

    return NextResponse.json({
      success: true,
      message: "Verification email sent! Please check your inbox."
    })

  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while sending verification email" },
      { status: 500 }
    )
  }
}