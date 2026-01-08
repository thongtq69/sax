import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Set /logo.png as background for NEW ARRIVALS and FEATURED INSTRUMENTS
  const updates = [
    { slug: 'new-arrivals', backgroundImage: '/logo.png' },
    { slug: 'featured-instruments', backgroundImage: '/logo.png' },
  ]

  for (const update of updates) {
    const result = await prisma.featuredCollection.update({
      where: { slug: update.slug },
      data: { backgroundImage: update.backgroundImage },
    })
    console.log(`Updated ${result.name}: backgroundImage = ${result.backgroundImage}`)
  }

  console.log('\nDone! Background images have been set.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
