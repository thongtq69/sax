import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProductBySlug, products } from '@/lib/data'
import { ProductDetailClient } from '@/components/product/ProductDetailClient'
import { ChevronRight } from 'lucide-react'

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }))
}

export default function ProductPage({
  params,
}: {
  params: { slug: string }
}) {
  const product = getProductBySlug(params.slug)

  if (!product) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center space-x-2 text-sm text-gray-600">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/shop" className="hover:text-primary">
          Shop
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <ProductDetailClient product={product} />
    </div>
  )
}

