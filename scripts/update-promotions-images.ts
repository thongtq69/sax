// Update promotional banners with actual product images
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updatePromotionImages() {
  console.log('🖼️ Updating promotion images with product URLs...\n');
  
  // Get sample products for each brand
  const yamahaProduct = await prisma.product.findFirst({
    where: { brand: 'Yamaha' },
    select: { images: true }
  });
  
  const yanagisawaProduct = await prisma.product.findFirst({
    where: { brand: 'Yanagisawa' },
    select: { images: true }
  });
  
  const selmerProduct = await prisma.product.findFirst({
    where: { brand: 'Selmer' },
    select: { images: true }
  });
  
  // Get a general saxophone image for other promotions
  const generalProduct = await prisma.product.findFirst({
    where: { images: { isEmpty: false } },
    select: { images: true }
  });
  
  const yamahaImage = yamahaProduct?.images[0] || generalProduct?.images[0] || '/images/promos/yamaha-saxophones.jpg';
  const yanagisawaImage = yanagisawaProduct?.images[0] || generalProduct?.images[0] || '/images/promos/yanagisawa-collection.jpg';
  const selmerImage = selmerProduct?.images[0] || generalProduct?.images[0] || '/images/promos/selmer-professional.jpg';
  const generalImage = generalProduct?.images[0] || '/images/promos/professional-setup.jpg';
  
  const promotions = await prisma.promoBanner.findMany({
    orderBy: { createdAt: 'asc' }
  });
  
  const updates = [
    { title: 'Yamaha Saxophones', image: yamahaImage },
    { title: 'Yanagisawa Collection', image: yanagisawaImage },
    { title: 'Selmer Professional', image: selmerImage },
    { title: 'Professional Setup', image: generalImage },
    { title: '0% APR Financing', image: generalImage },
    { title: 'Trade-In Program', image: generalImage },
  ];
  
  for (let i = 0; i < promotions.length && i < updates.length; i++) {
    const promo = promotions[i];
    const update = updates[i];
    
    if (promo.title === update.title) {
      await prisma.promoBanner.update({
        where: { id: promo.id },
        data: { image: update.image }
      });
      console.log(`  ✓ Updated: ${promo.title}`);
      console.log(`    Image: ${update.image.substring(0, 80)}...`);
    }
  }
  
  console.log(`\n✅ Updated ${updates.length} promotion images`);
}

updatePromotionImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

