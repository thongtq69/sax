import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { sendPasswordResetEmail } from "@/lib/email"

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

    // Always return success to prevent email enumeration attacks
    // But only send email if user exists
    if (user) {
      // Delete any existing password reset tokens for this user
      await prisma.verificationToken.deleteMany({
        where: {
          identifier: email.toLowerCase(),
          type: "password-reset"
        }
      })

      // Generate reset token
      const token = crypto.randomBytes(32).toString("hex")
      const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await prisma.verificationToken.create({
        data: {
          identifier: email.toLowerCase(),
          token,
          type: "password-reset",
          expires,
        }
      })

      // Send password reset email
      try {
        await sendPasswordResetEmail(email, token, user.name || undefined)
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError)
        return NextResponse.json(
          { success: false, message: "Failed to send reset email" },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, we've sent a password reset link."
    })

  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while processing your request" },
      { status: 500 }
    )
  }
}