import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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

    // Update user email verification status
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { emailVerified: new Date() }
    })

    // Delete used verification token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id }
    })

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
