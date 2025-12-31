// Create subcategories based on actual products
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSubcategories() {
  console.log('📂 Creating subcategories based on product types...\n');
  
  // Get Woodwinds category
  const woodwinds = await prisma.category.findFirst({
    where: { slug: 'woodwinds' }
  });
  
  if (!woodwinds) {
    console.error('❌ Woodwinds category not found');
    return;
  }
  
  const subcategories = [
    { name: 'Alto Saxophones', slug: 'alto-saxophones', path: '/shop/woodwinds/alto-saxophones' },
    { name: 'Tenor Saxophones', slug: 'tenor-saxophones', path: '/shop/woodwinds/tenor-saxophones' },
    { name: 'Soprano Saxophones', slug: 'soprano-saxophones', path: '/shop/woodwinds/soprano-saxophones' },
  ];
  
  console.log('Creating subcategories:');
  
  for (const sub of subcategories) {
    // Check if exists
    const existing = await prisma.subCategory.findUnique({
      where: { slug: sub.slug }
    });
    
    if (existing) {
      console.log(`  ⊘ Already exists: ${sub.name}`);
    } else {
      await prisma.subCategory.create({
        data: {
          name: sub.name,
          slug: sub.slug,
          path: sub.path,
          categoryId: woodwinds.id
        }
      });
      console.log(`  ✓ Created: ${sub.name}`);
    }
  }
  
  // Update products to assign to subcategories
  console.log('\n📦 Assigning products to subcategories...');
  
  const products = await prisma.product.findMany({
    where: { categoryId: woodwinds.id },
    select: { id: true, name: true }
  });
  
  for (const product of products) {
    const name = product.name.toLowerCase();
    let subcategorySlug = null;
    
    if (name.includes('alto')) {
      subcategorySlug = 'alto-saxophones';
    } else if (name.includes('tenor')) {
      subcategorySlug = 'tenor-saxophones';
    } else if (name.includes('soprano')) {
      subcategorySlug = 'soprano-saxophones';
    }
    
    if (subcategorySlug) {
      const subcategory = await prisma.subCategory.findUnique({
        where: { slug: subcategorySlug }
      });
      
      if (subcategory) {
        await prisma.product.update({
          where: { id: product.id },
          data: { subcategoryId: subcategory.id }
        });
        console.log(`  ✓ Assigned: ${product.name.substring(0, 50)} → ${subcategory.name}`);
      }
    }
  }
  
  console.log('\n✅ Subcategories created and products assigned');
}

createSubcategories()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

