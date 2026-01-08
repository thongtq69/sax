import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
    const { name } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 }
      )
    }

    // Update user profile
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: name.trim() }
    })

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully"
    })

  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while updating profile" },
      { status: 500 }
    )
  }
}