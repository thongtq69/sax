import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Lấy danh sách wishlist của user
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" }
    })

    // Lấy thông tin sản phẩm
    const productIds = wishlistItems.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        price: true,
        retailPrice: true,
        images: true,
        brand: true,
        badge: true,
        inStock: true,
        productType: true,
        condition: true
      }
    })

    return NextResponse.json({ 
      wishlist: wishlistItems,
      products 
    })
  } catch (error) {
    console.error("Error fetching wishlist:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Thêm sản phẩm vào wishlist
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    // Kiểm tra sản phẩm tồn tại
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Thêm vào wishlist (upsert để tránh duplicate)
    const wishlistItem = await prisma.wishlist.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId
        }
      },
      update: {},
      create: {
        userId: session.user.id,
        productId: productId
      }
    })

    return NextResponse.json({ success: true, wishlistItem })
  } catch (error) {
    console.error("Error adding to wishlist:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
