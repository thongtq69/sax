import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmailChangeVerification } from "@/lib/email"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { newEmail, password } = body

    if (!newEmail || !newEmail.includes('@')) {
      return NextResponse.json(
        { success: false, message: "Valid email is required" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already in use" },
        { status: 400 }
      )
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true, email: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    // If user has password, verify it
    if (user.password) {
      if (!password) {
        return NextResponse.json(
          { success: false, message: "Password is required to change email" },
          { status: 400 }
        )
      }

      const bcrypt = await import("bcryptjs")
      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) {
        return NextResponse.json(
          { success: false, message: "Password is incorrect" },
          { status: 400 }
        )
      }
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Delete any existing email change tokens for this user
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: session.user.id,
        type: "email-change"
      }
    })

    // Create verification token with new email stored
    await prisma.verificationToken.create({
      data: {
        identifier: session.user.id,
        token,
        type: "email-change",
        otp: newEmail.toLowerCase(), // Store new email in otp field
        expires
      }
    })

    // Send verification email to new address
    await sendEmailChangeVerification(newEmail, token)

    return NextResponse.json({
      success: true,
      message: "Verification email sent to your new email address"
    })

  } catch (error) {
    console.error("Change email error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while changing email" },
      { status: 500 }
    )
  }
}
