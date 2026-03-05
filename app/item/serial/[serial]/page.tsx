import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { extractSkuFromParam, getProductUrl } from '@/lib/api'

// This page redirects Serial-based URLs to canonical product URLs
// Canonical format: /item/product-name-Serial

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
      select: { slug: true, sku: true, specs: true },
    })

    if (!product) {
      notFound()
    }

    // Redirect to new item URL
    const sn = typeof product.specs === 'object' && product.specs && 'SN' in (product.specs as Record<string, unknown>)
      ? String((product.specs as Record<string, unknown>).SN || '')
      : ''
    redirect(getProductUrl(product.sku, product.slug, sn))
  } catch (error) {
    console.error('Error fetching product:', error)
    notFound()
  }
}
