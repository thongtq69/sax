// Update 5-6 products to "coming-soon" badge
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateToComingSoon() {
  console.log('🔄 Updating products to "Coming Soon"...\n');
  
  // Get products that don't have a badge or have 'new' badge
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { badge: null },
        { badge: 'new' }
      ]
    },
    select: {
      id: true,
      name: true,
      slug: true,
      badge: true
    },
    orderBy: { createdAt: 'desc' },
    take: 6
  });
  
  console.log(`Found ${products.length} products to update\n`);
  
  let updated = 0;
  
  for (const product of products) {
    await prisma.product.update({
      where: { id: product.id },
      data: { badge: 'coming-soon' }
    });
    
    updated++;
    console.log(`  ✓ Updated: ${product.name}`);
    console.log(`    Badge: ${product.badge || 'none'} → coming-soon\n`);
  }
  
  console.log(`✅ Updated ${updated} products to "Coming Soon"`);
  
  // Verify
  const comingSoonCount = await prisma.product.count({
    where: { badge: 'coming-soon' }
  });
  
  console.log(`\n📊 Total products with "Coming Soon" badge: ${comingSoonCount}`);
}

updateToComingSoon()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

