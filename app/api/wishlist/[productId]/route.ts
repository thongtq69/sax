import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// DELETE - Xóa sản phẩm khỏi wishlist
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId } = await params

    await prisma.wishlist.deleteMany({
      where: {
        userId: session.user.id,
        productId: productId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing from wishlist:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET - Kiểm tra sản phẩm có trong wishlist không
export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ inWishlist: false })
    }

    const { productId } = await params

    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId
        }
      }
    })

    return NextResponse.json({ inWishlist: !!wishlistItem })
  } catch (error) {
    console.error("Error checking wishlist:", error)
    return NextResponse.json({ inWishlist: false })
  }
}
