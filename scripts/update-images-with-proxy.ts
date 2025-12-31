// Update all product images to use proxy URLs
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateImagesWithProxy() {
  console.log('🔄 Updating product images to use proxy...\n');
  
  const products = await prisma.product.findMany({
    where: {
      images: { isEmpty: false }
    }
  });
  
  console.log(`Found ${products.length} products with images\n`);
  
  let updated = 0;
  
  for (const product of products) {
    const originalImages = product.images;
    const proxyImages = originalImages.map(img => {
      // If already using proxy, skip
      if (img.includes('/api/image-proxy')) return img;
      
      // If Reverb image, convert to proxy
      if (img.includes('reverb.com') || img.includes('rvb-img.reverb.com') || img.includes('img.reverb.com')) {
        return `/api/image-proxy?url=${encodeURIComponent(img)}`;
      }
      
      // Otherwise keep original
      return img;
    });
    
    // Only update if changed
    if (JSON.stringify(originalImages) !== JSON.stringify(proxyImages)) {
      await prisma.product.update({
        where: { id: product.id },
        data: { images: proxyImages }
      });
      updated++;
      console.log(`  ✓ [${updated}] ${product.name.substring(0, 50)}...`);
    }
  }
  
  console.log(`\n✅ Updated ${updated} products with proxy URLs`);
}

updateImagesWithProxy()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

