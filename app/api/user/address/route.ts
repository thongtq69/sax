import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Get user addresses
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ success: true, addresses })

  } catch (error) {
    console.error("Get addresses error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to get addresses" },
      { status: 500 }
    )
  }
}

// POST - Create new address
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
    const { firstName, lastName, address1, address2, city, state, zip, country, phone, isDefault } = body

    // Validate required fields
    if (!firstName || !lastName || !address1 || !city || !state || !zip || !country || !phone) {
      return NextResponse.json(
        { success: false, message: "All required fields must be filled" },
        { status: 400 }
      )
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false }
      })
    }

    // Check if user has any addresses - if not, make this default
    const existingAddresses = await prisma.address.count({
      where: { userId: session.user.id }
    })

    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
        firstName,
        lastName,
        address1,
        address2: address2 || null,
        city,
        state,
        zip,
        country,
        phone,
        isDefault: isDefault || existingAddresses === 0
      }
    })

    return NextResponse.json({ success: true, address })

  } catch (error) {
    console.error("Create address error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create address" },
      { status: 500 }
    )
  }
}

// PUT - Update address
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, firstName, lastName, address1, address2, city, state, zip, country, phone, isDefault } = body

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Address ID is required" },
        { status: 400 }
      )
    }

    // Verify address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id, userId: session.user.id }
    })

    if (!existingAddress) {
      return NextResponse.json(
        { success: false, message: "Address not found" },
        { status: 404 }
      )
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id, id: { not: id } },
        data: { isDefault: false }
      })
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        firstName,
        lastName,
        address1,
        address2: address2 || null,
        city,
        state,
        zip,
        country,
        phone,
        isDefault
      }
    })

    return NextResponse.json({ success: true, address })

  } catch (error) {
    console.error("Update address error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update address" },
      { status: 500 }
    )
  }
}

// DELETE - Delete address
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Address ID is required" },
        { status: 400 }
      )
    }

    // Verify address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id, userId: session.user.id }
    })

    if (!existingAddress) {
      return NextResponse.json(
        { success: false, message: "Address not found" },
        { status: 404 }
      )
    }

    await prisma.address.delete({ where: { id } })

    // If deleted address was default, set another as default
    if (existingAddress.isDefault) {
      const firstAddress = await prisma.address.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
      })
      if (firstAddress) {
        await prisma.address.update({
          where: { id: firstAddress.id },
          data: { isDefault: true }
        })
      }
    }

    return NextResponse.json({ success: true, message: "Address deleted" })

  } catch (error) {
    console.error("Delete address error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete address" },
      { status: 500 }
    )
  }
}
