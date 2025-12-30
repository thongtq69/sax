import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProductBySlug, transformProduct } from '@/lib/api'
import { ProductDetailClient } from '@/components/product/ProductDetailClient'
import { ChevronRight, Home } from 'lucide-react'

export default async function ProductPage({
  params,
}: {
  params: { slug: string }
}) {
  const apiProduct = await getProductBySlug(params.slug)

  if (!apiProduct) {
    notFound()
  }

  const product = transformProduct(apiProduct)

  return (
    <div className="min-h-screen">
      {/* Breadcrumbs */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
              <Home className="h-3.5 w-3.5" />
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            <Link href="/shop" className="text-muted-foreground hover:text-primary transition-colors">
              Products
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            <span className="text-secondary font-medium line-clamp-1">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <ProductDetailClient product={product} />
      </div>
    </div>
  )
}
