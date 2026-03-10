import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { getProductUrl, transformProduct } from '@/lib/api'
import { getBrandDescriptionTemplate } from '@/lib/brand-description'
import { StructuredData } from '@/components/seo/StructuredData'
import { BrandPageClient } from '@/components/brand/BrandPageClient'
import { buildCanonicalUrl, getBaseUrl } from '@/lib/seo'

export const revalidate = 120

async function getBrandData(slug: string) {
  // Strip '-saxophones' suffix if it exists
  const cleanSlug = slug.endsWith('-saxophones')
    ? slug.substring(0, slug.length - 11)
    : slug;

  const brand = await prisma.brand.findFirst({
    where: {
      slug: cleanSlug,
      isActive: true,
    },
  })

  if (!brand) return null

  const apiProducts = await prisma.product.findMany({
    where: {
      brand: { equals: brand.name, mode: 'insensitive' },
      stockStatus: { not: 'archived' },
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      subcategory: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return { brand, apiProducts }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getBrandData(params.slug)

  if (!data) {
    return {
      title: 'Brand Not Found | James Sax Corner',
      description: 'The requested brand could not be found.',
    }
  }

  const { brand } = data
  const title = `Premium Saxophones | ${brand.name}`



  const description = `Professional ${brand.name} saxophones carefully inspected and prepared. Premium instruments with worldwide shipping from James Sax Corner.`



  return {
    title,
    description,
    alternates: {
      canonical: buildCanonicalUrl(`/b/${brand.slug}-saxophones`),
    },
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'James Sax Corner',
    },
  }
}

export default async function BrandPage({ params }: { params: { slug: string } }) {
  // Enforce the -saxophones suffix URL rule via redirect
  if (!params.slug.endsWith('-saxophones')) {
    redirect(`/b/${params.slug}-saxophones`)
  }

  const data = await getBrandData(params.slug)
  if (!data) {
    notFound()
  }

  const { brand, apiProducts } = data
  const brandDescription = brand.description || getBrandDescriptionTemplate(brand.name) || null
  const products = apiProducts.map(transformProduct)

  const modelCountMap = new Map<string, number>()
  apiProducts.forEach((product) => {
    const model = product.subBrand?.trim()
    if (!model) return
    modelCountMap.set(model, (modelCountMap.get(model) || 0) + 1)
  })

  const models = Array.from(modelCountMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: getBaseUrl(),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Brands',
        item: `${getBaseUrl()}/#brands`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${brand.name} Saxophones`,
        item: buildCanonicalUrl(`/b/${brand.slug}-saxophones`),
      },
    ],
  }

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${brand.name} listings`,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 20).map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${getBaseUrl()}${getProductUrl(product.sku, product.slug || '', (product as any).serialNumber)}`,
      name: product.name,
    })),
  }

  return (
    <div className="min-h-screen">
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={itemListSchema} />

      <BrandPageClient
        brandName={brand.name}
        brandSlug={brand.slug}
        brandLogo={brand.logo}
        brandDescription={brandDescription}
        products={products}
        models={models}
      />
    </div>
  )
}
