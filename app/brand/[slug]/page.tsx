import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { transformProduct } from '@/lib/api'
import { getBrandDescriptionTemplate } from '@/lib/brand-description'
import { StructuredData } from '@/components/seo/StructuredData'
import { BrandPageClient } from '@/components/brand/BrandPageClient'

export const revalidate = 120

async function getBrandData(slug: string) {
  const brand = await prisma.brand.findFirst({
    where: {
      slug,
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

  const { brand, apiProducts } = data
  const title = `${brand.name} | James Sax Corner`
  const description =
    brand.description ||
    getBrandDescriptionTemplate(brand.name) ||
    `Browse ${apiProducts.length} ${brand.name} listing${apiProducts.length !== 1 ? 's' : ''} at James Sax Corner.`

  return {
    title,
    description,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://jamessaxcorner.com'}/brand/${brand.slug}`,
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
        name: brand.name,
        item: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://jamessaxcorner.com'}/brand/${brand.slug}`,
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
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://jamessaxcorner.com'}/item/${product.sku}-${product.slug}`,
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
