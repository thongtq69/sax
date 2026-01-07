import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { extractSkuFromParam } from '@/lib/api'

// This page redirects old SKU-based URLs to new slug-based URLs
// Old: /product/sku/JSC-XXXXX-product-name
// New: /product/product-slug

export default async function ProductBySKUPage({
  params,
}: {
  params: { sku: string }
}) {
  try {
    // Extract SKU from param (handles both old /sku/JSC-XXX and new /sku/JSC-XXX-product-name format)
    const sku = extractSkuFromParam(params.sku)
    
    const product = await prisma.product.findUnique({
      where: { sku: sku },
      select: { slug: true },
    })

    if (!product) {
      notFound()
    }

    // Redirect to new slug-based URL
    redirect(`/product/${product.slug}`)
  } catch (error) {
    console.error('Error fetching product:', error)
    notFound()
  }
}
