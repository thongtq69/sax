import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ProductForm from '@/components/admin/ProductForm'

export const dynamic = 'force-dynamic'

async function getFormData(productId: string) {
  const [product, categories, brands, specKeys, accessories, descTemplates] = await Promise.all([
    prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        subcategory: true,
      },
    }),
    prisma.category.findMany({
      include: {
        subcategories: { orderBy: { name: 'asc' } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.brand.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    }),
    prisma.specKey.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    }),
    prisma.accessory.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    }),
    prisma.descriptionTemplate.findMany({
      where: { isActive: true },
      orderBy: [{ type: 'asc' }, { order: 'asc' }, { name: 'asc' }],
    }),
  ])

  if (!product) return null

  return {
    product,
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      path: c.path,
      subcategories: c.subcategories.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        path: s.path,
      })),
    })),
    brands: brands.map((b) => ({
      id: b.id,
      name: b.name,
      models: b.models,
      isActive: b.isActive,
    })),
    specKeys: specKeys.map((s) => ({ id: s.id, name: s.name, isActive: s.isActive })),
    accessories: accessories.map((a) => ({ id: a.id, name: a.name, isActive: a.isActive })),
    descTemplates: descTemplates.map((t) => ({
      id: t.id,
      name: t.name,
      content: t.content,
      type: t.type,
    })),
  }
}

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const data = await getFormData(params.id)
  if (!data) notFound()

  // Serialize the product (Prisma may include Date objects, JSON values, etc.)
  const initialData = JSON.parse(JSON.stringify(data.product))

  return (
    <ProductForm
      productId={params.id}
      initialData={initialData}
      categories={data.categories}
      brands={data.brands}
      specKeys={data.specKeys}
      accessories={data.accessories}
      descTemplates={data.descTemplates}
    />
  )
}
