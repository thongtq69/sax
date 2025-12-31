// Fix products with wrong images by copying from similar products
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixWrongImages() {
  console.log('🔧 Fixing products with wrong images...\n');
  
  // Get products with wrong images
  const wrongProducts = await prisma.product.findMany({
    where: {
      OR: [
        { slug: 'yamaha-yts-82z-tenor-saxophone-black' },
        { slug: 'yamaha-yts-62-tenor-saxophone-purple-logo-early' },
        { slug: 'yamaha-yts-62ii-tenor-saxophone-late' }
      ]
    },
    select: { id: true, name: true, slug: true, images: true }
  });
  
  // Get similar products with correct images
  const sourceProducts = await prisma.product.findMany({
    where: {
      OR: [
        { slug: 'yamaha-yts-82z-tenor-saxophone-1' },
        { slug: 'yamaha-yts-62-tenor-saxophone-purple-logo' },
        { slug: 'yamaha-yts-62ii-tenor-saxophone-1' }
      ]
    },
    select: { id: true, name: true, slug: true, images: true }
  });
  
  console.log(`Found ${wrongProducts.length} products with wrong images\n`);
  
  // Map wrong products to source products
  const fixes = [
    {
      wrong: wrongProducts.find(p => p.slug === 'yamaha-yts-82z-tenor-saxophone-black'),
      source: sourceProducts.find(p => p.slug === 'yamaha-yts-82z-tenor-saxophone-1'),
      reason: 'YTS-82Z Black → Copy from YTS-82Z'
    },
    {
      wrong: wrongProducts.find(p => p.slug === 'yamaha-yts-62-tenor-saxophone-purple-logo-early'),
      source: sourceProducts.find(p => p.slug === 'yamaha-yts-62-tenor-saxophone-purple-logo'),
      reason: 'YTS-62 Purple Logo Early → Copy from YTS-62 Purple Logo Vintage'
    },
    {
      wrong: wrongProducts.find(p => p.slug === 'yamaha-yts-62ii-tenor-saxophone-late'),
      source: sourceProducts.find(p => p.slug === 'yamaha-yts-62ii-tenor-saxophone-1'),
      reason: 'YTS-62II Late → Copy from YTS-62II'
    }
  ];
  
  let updated = 0;
  
  for (const fix of fixes) {
    if (!fix.wrong || !fix.source) {
      console.log(`  ⚠ Skipping: ${fix.reason} (missing product)`);
      continue;
    }
    
    const currentImages = fix.wrong.images?.length || 0;
    const sourceImages = fix.source.images?.length || 0;
    
    if (sourceImages === 0) {
      console.log(`  ⚠ Skipping: ${fix.wrong.name} (source has no images)`);
      continue;
    }
    
    // Copy all images from source
    const imagesToCopy = fix.source.images;
    
    await prisma.product.update({
      where: { id: fix.wrong.id },
      data: { images: imagesToCopy }
    });
    
    updated++;
    console.log(`  ✓ Fixed: ${fix.wrong.name}`);
    console.log(`    ${currentImages} → ${imagesToCopy.length} images (copied from ${fix.source.name})`);
  }
  
  console.log(`\n✅ Fixed ${updated} products`);
}

fixWrongImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

