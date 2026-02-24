import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { extractSkuFromParam } from '@/lib/api'

// This page redirects old Serial-based URLs to new slug-based URLs
// Old: /item/serial/XXXXX-product-name
// New: /item/serial-slug

export default async function ProductBySerialPage({
  params,
}: {
  params: { serial: string }
}) {
  try {
    // Extract Serial from param
    const serial = extractSkuFromParam(params.serial)

    const product = await prisma.product.findUnique({
      where: { sku: serial },
      select: { slug: true, sku: true },
    })

    if (!product) {
      notFound()
    }

    // Redirect to new item URL
    redirect(`/item/${product.sku}-${product.slug}`)
  } catch (error) {
    console.error('Error fetching product:', error)
    notFound()
  }
}
