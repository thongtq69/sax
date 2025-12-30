import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { transformProduct } from '@/lib/api'
import { ProductDetailClient } from '@/components/product/ProductDetailClient'
import { ChevronRight, Home } from 'lucide-react'

export default async function ProductPage({
  params,
}: {
  params: { slug: string }
}) {
  try {
    const apiProduct = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: {
        category: {
          include: {
            subcategories: true,
          },
        },
        subcategory: true,
      },
    })

    if (!apiProduct) {
      notFound()
    }

    const product = transformProduct(apiProduct)

    return (
      <div className="min-h-screen">
        {/* Breadcrumbs */}
        <div className="bg-muted/30 border-b">
          <div className="container mx-auto px-3 md:px-4 py-2 md:py-3 lg:py-4">
            <nav className="flex items-center space-x-1.5 md:space-x-2 text-xs md:text-sm overflow-x-auto pb-1">
              <Link href="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 whitespace-nowrap">
                <Home className="h-3 w-3 md:h-3.5 md:w-3.5" />
                Home
              </Link>
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground/50 flex-shrink-0" />
              <Link href="/shop" className="text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">
                Products
              </Link>
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground/50 flex-shrink-0" />
              <span className="text-secondary font-medium line-clamp-1 truncate max-w-[150px] md:max-w-none">{product.name}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-3 md:px-4 py-6 md:py-8 lg:py-10">
          <ProductDetailClient product={product} />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error fetching product:', error)
    notFound()
  }
}
