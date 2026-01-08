import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token is required" },
        { status: 400 }
      )
    }

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    })

    if (!verificationToken) {
      return NextResponse.json(
        { success: false, message: "Invalid verification link. Please request a new one." },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { token }
      })
      
      return NextResponse.json(
        { success: false, message: "This link has expired. Please request a new one." },
        { status: 400 }
      )
    }

    // Check if it's an email verification token
    if (verificationToken.type !== "email-verification") {
      return NextResponse.json(
        { success: false, message: "Invalid token type" },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    // Update user's emailVerified field
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() }
    })

    // Delete the used token
    await prisma.verificationToken.delete({
      where: { token }
    })

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! You can now login."
    })

  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred during verification" },
      { status: 500 }
    )
  }
}