import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token is required" },
        { status: 400 }
      )
    }

    // Find verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        type: "email-change",
        expires: { gt: new Date() }
      }
    })

    if (!verificationToken) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 400 }
      )
    }

    const userId = verificationToken.identifier
    const newEmail = verificationToken.otp // New email stored in otp field

    if (!newEmail) {
      return NextResponse.json(
        { success: false, message: "Invalid token data" },
        { status: 400 }
      )
    }

    // Update user email
    await prisma.user.update({
      where: { id: userId },
      data: {
        email: newEmail,
        emailVerified: new Date()
      }
    })

    // Delete the verification token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id }
    })

    return NextResponse.json({
      success: true,
      message: "Email updated successfully"
    })

  } catch (error) {
    console.error("Verify email change error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred" },
      { status: 500 }
    )
  }
}
