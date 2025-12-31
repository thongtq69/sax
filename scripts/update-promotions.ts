// Update promotional banners to match actual inventory
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const updatedPromotions = [
  {
    title: 'Yamaha Saxophones',
    description: 'Explore our collection of 15 premium Yamaha saxophones. Professional quality, expertly set up.',
    image: '/images/promos/yamaha-saxophones.jpg',
    ctaText: 'Shop Yamaha',
    ctaLink: '/shop?brand=Yamaha',
  },
  {
    title: 'Yanagisawa Collection',
    description: 'Discover 10 handcrafted Yanagisawa saxophones. Japanese precision meets musical excellence.',
    image: '/images/promos/yanagisawa-collection.jpg',
    ctaText: 'Shop Yanagisawa',
    ctaLink: '/shop?brand=Yanagisawa',
  },
  {
    title: 'Selmer Professional',
    description: 'Premium Selmer saxophones - the choice of professionals worldwide. 3 models available.',
    image: '/images/promos/selmer-professional.jpg',
    ctaText: 'Shop Selmer',
    ctaLink: '/shop?brand=Selmer',
  },
  {
    title: 'Professional Setup',
    description: 'Every instrument professionally set up before shipping. Play-tested by our experts.',
    image: '/images/promos/professional-setup.jpg',
    ctaText: 'Learn More',
    ctaLink: '/about',
  },
  {
    title: '0% APR Financing',
    description: 'Get 0% APR financing on all instruments over $1,000. Apply today!',
    image: '/images/promos/financing.jpg',
    ctaText: 'Learn More',
    ctaLink: '/financing',
  },
  {
    title: 'Trade-In Program',
    description: 'Trade in your old instrument for credit towards a new one. Get a quote today!',
    image: '/images/promos/trade-in.jpg',
    ctaText: 'Get Quote',
    ctaLink: '/contact',
  },
];

async function updatePromotions() {
  console.log('🔄 Updating promotional banners...\n');
  
  // Get existing promotions
  const existing = await prisma.promoBanner.findMany();
  console.log(`Found ${existing.length} existing promotions\n`);
  
  // Update or create promotions
  for (let i = 0; i < updatedPromotions.length; i++) {
    const promo = updatedPromotions[i];
    const existingPromo = existing[i];
    
    if (existingPromo) {
      await prisma.promoBanner.update({
        where: { id: existingPromo.id },
        data: promo
      });
      console.log(`  ✓ Updated: ${promo.title}`);
    } else {
      await prisma.promoBanner.create({
        data: promo
      });
      console.log(`  ✓ Created: ${promo.title}`);
    }
  }
  
  console.log(`\n✅ Updated ${updatedPromotions.length} promotional banners`);
}

updatePromotions()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

