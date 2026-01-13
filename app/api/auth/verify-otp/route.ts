import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendWelcomeEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp } = body

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email and OTP are required" },
        { status: 400 }
      )
    }

    // Find verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email.toLowerCase(),
        otp: otp.toString(),
        type: "otp-verification",
        expires: {
          gt: new Date()
        }
      }
    })

    if (!verificationToken) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired OTP code" },
        { status: 400 }
      )
    }

    // Get user info for welcome email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { name: true }
    })

    // Update user email verification status
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { emailVerified: new Date() }
    })

    // Delete used verification token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id }
    })

    // Send welcome email to new user
    try {
      await sendWelcomeEmail(email, user?.name || undefined)
      console.log('Welcome email sent to:', email)
    } catch (emailError) {
      // Don't fail verification if email fails
      console.error('Failed to send welcome email:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! You can now login."
    })

  } catch (error) {
    console.error("OTP verification error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred during verification" },
      { status: 500 }
    )
  }
}
