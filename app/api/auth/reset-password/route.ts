import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json(
        { success: false, message: "Token and password are required" },
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

    // Find the reset token
    const resetToken = await prisma.verificationToken.findUnique({
      where: { token }
    })

    if (!resetToken) {
      return NextResponse.json(
        { success: false, message: "Invalid reset link. Please request a new one." },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (resetToken.expires < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { token }
      })
      
      return NextResponse.json(
        { success: false, message: "This link has expired. Please request a new one." },
        { status: 400 }
      )
    }

    // Check if it's a password reset token
    if (resetToken.type !== "password-reset") {
      return NextResponse.json(
        { success: false, message: "Invalid token type" },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: resetToken.identifier }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    // Delete the used token (single use)
    await prisma.verificationToken.delete({
      where: { token }
    })

    return NextResponse.json({
      success: true,
      message: "Password reset successfully! You can now login with your new password."
    })

  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred during password reset" },
      { status: 500 }
    )
  }
}