import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { getProductUrl, transformProduct } from '@/lib/api'
import { getBrandDescriptionTemplate } from '@/lib/brand-description'
import { StructuredData } from '@/components/seo/StructuredData'
import { BrandPageClient } from '@/components/brand/BrandPageClient'

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
  const title = `${brand.name} Saxophones for Sale | Professional Models | James Sax Corner`

  // Get some popular models dynamically for the description if possible, or use defaults
  const modelsMap = new Map<string, number>()
  data.apiProducts.forEach(p => {
    const model = p.subBrand?.trim()
    if (model) modelsMap.set(model, (modelsMap.get(model) || 0) + 1)
  })

  // Get top 4 most common models
  const topModels = Array.from(modelsMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(entry => entry[0])

  const modelsString = topModels.length > 0
    ? ` including ${topModels.join(', ')}`
    : ''

  const description = `Professional ${brand.name} soprano, alto, tenor saxophones${modelsString}. Carefully inspected instruments with worldwide shipping from James Sax Corner.`



  return {
    title,
    description,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://jamessaxcorner.com'}/b/${brand.slug}-saxophones`,
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
        item: process.env.NEXT_PUBLIC_BASE_URL || 'https://jamessaxcorner.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Brands',
        item: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://jamessaxcorner.com'}/shop`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${brand.name} Saxophones`,
        item: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://jamessaxcorner.com'}/b/${brand.slug}-saxophones`,
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
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://jamessaxcorner.com'}${getProductUrl(product.sku, product.slug || '', (product as any).serialNumber)}`,
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
