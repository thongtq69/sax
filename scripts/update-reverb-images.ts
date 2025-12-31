// Update products with real Reverb images
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ReverbImageData {
  itemId: string;
  url: string;
  name: string;
  price: number;
  description: string;
  condition: string;
  images: string[];
  make?: string;
  model?: string;
}

async function updateProductsWithImages() {
  console.log('🖼️  Updating products with Reverb images...\n');
  
  // Load image data
  const imageDataPath = path.join(__dirname, '../data/reverb-images.json');
  const imageData: ReverbImageData[] = JSON.parse(
    fs.readFileSync(imageDataPath, 'utf-8')
  );
  
  console.log(`📦 Loaded ${imageData.length} products with images\n`);
  
  let updated = 0;
  let notFound = 0;
  
  for (const item of imageData) {
    // Extract slug from URL
    const slugFromUrl = item.url
      .split('/')
      .pop()
      ?.replace(/^\d+-/, '')
      .replace(/[^a-z0-9-]/gi, '-')
      .replace(/-+/g, '-')
      .toLowerCase() || '';
    
    // Try to find product by slug or name
    let product = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: { contains: slugFromUrl.substring(0, 30) } },
          { name: { contains: item.name.replace('NO TARIFFS - ', '').substring(0, 30) } }
        ]
      }
    });
    
    // If not found, try by make/model
    if (!product && item.make && item.model) {
      product = await prisma.product.findFirst({
        where: {
          AND: [
            { brand: item.make },
            { name: { contains: item.model.substring(0, 20) } }
          ]
        }
      });
    }
    
    if (product && item.images && item.images.length > 0) {
      // Convert to high-res URLs (remove quality=medium-low, use original)
      const highResImages = item.images.map(img => 
        img.replace(/quality=medium-low,height=800,width=800,fit=contain/, 'quality=high')
          .replace(/quality=medium-low/, 'quality=high')
      );
      
      await prisma.product.update({
        where: { id: product.id },
        data: {
          images: highResImages,
          description: item.description
            .replace(/<[^>]+>/g, ' ') // Remove HTML tags
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 2000), // Limit length
          specs: {
            ...(product.specs as any || {}),
            'Condition': item.condition,
            'Make': item.make || '',
            'Model': item.model || '',
            'Reverb Item ID': item.itemId
          }
        }
      });
      
      updated++;
      console.log(`  ✓ [${updated}] ${product.name.substring(0, 50)}... (${highResImages.length} images)`);
    } else {
      notFound++;
      console.log(`  ✗ Not found: ${item.name.substring(0, 50)}`);
    }
  }
  
  console.log(`\n✅ Updated ${updated} products with images`);
  if (notFound > 0) {
    console.log(`⚠️  ${notFound} products not found in database`);
  }
}

updateProductsWithImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

