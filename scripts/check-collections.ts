import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const collections = await prisma.featuredCollection.findMany()
  console.log('Featured Collections:')
  collections.forEach(c => {
    console.log(`- ${c.name} (${c.slug}):`)
    console.log(`  backgroundImage: ${c.backgroundImage || 'NOT SET'}`)
    console.log(`  productIds: ${c.productIds.length} products`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
