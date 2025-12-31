// Update product images from reverb_images.txt
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ProductImages {
  reverbUrl: string;
  images: string[];
}

function parseImageFile(filePath: string): ProductImages[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const products: ProductImages[] = [];
  let currentProduct: ProductImages | null = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (!trimmed) continue;
    
    // Check if it's a Reverb URL (product URL)
    if (trimmed.startsWith('https://reverb.com/item/')) {
      // Save previous product if exists
      if (currentProduct) {
        products.push(currentProduct);
      }
      
      // Start new product
      currentProduct = {
        reverbUrl: trimmed,
        images: []
      };
    } else if (trimmed.startsWith('https://rvb-img.reverb.com/') || trimmed.startsWith('https://img.reverb.com/')) {
      // It's an image URL
      if (currentProduct) {
        // Convert to high quality URL
        const highResUrl = trimmed
          .replace(/quality=medium-low,height=800,width=800,fit=contain/, 'quality=high')
          .replace(/quality=medium-low/, 'quality=high')
          .split('?')[0]; // Remove query params for cleaner URL
        
        currentProduct.images.push(highResUrl);
      }
    }
  }
  
  // Don't forget the last product
  if (currentProduct) {
    products.push(currentProduct);
  }
  
  return products;
}

async function updateProductsWithImages() {
  console.log('🖼️  Updating products with images from reverb_images.txt...\n');
  
  const imageFilePath = path.join(__dirname, '../../reverb_images.txt');
  
  if (!fs.existsSync(imageFilePath)) {
    console.error('❌ File not found: reverb_images.txt');
    return;
  }
  
  const productImages = parseImageFile(imageFilePath);
  console.log(`📦 Parsed ${productImages.length} products with images\n`);
  
  // Get all products from database
  const allProducts = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true
    }
  });
  
  console.log(`📊 Found ${allProducts.length} products in database\n`);
  
  let updated = 0;
  let notFound = 0;
  
  for (const item of productImages) {
    // Extract slug from Reverb URL
    const urlSlug = item.reverbUrl
      .split('/')
      .pop()
      ?.replace(/^\d+-/, '')
      .replace(/[^a-z0-9-]/gi, '-')
      .replace(/-+/g, '-')
      .toLowerCase() || '';
    
    // Try to find product by slug match
    let product = allProducts.find(p => {
      // Exact match or partial match
      const productSlug = p.slug.toLowerCase();
      const urlSlugLower = urlSlug.toLowerCase();
      
      // Check if slugs match (allowing for variations)
      if (productSlug === urlSlugLower || 
          productSlug.includes(urlSlugLower.substring(0, 20)) ||
          urlSlugLower.includes(productSlug.substring(0, 20))) {
        return true;
      }
      
      return false;
    });
    
    // If still not found, try by name matching
    if (!product) {
      // Extract key words from URL (brand, model numbers)
      const urlParts = urlSlug.split('-');
      const keyWords = urlParts.filter(w => 
        w.length > 2 && 
        !['no', 'tariffs', 'item', 'and', 'the', 'for'].includes(w.toLowerCase()) &&
        (w.match(/^[a-z]+$/i) || w.match(/^\d+[a-z]*$/i)) // Letters or alphanumeric
      );
      
      product = allProducts.find(p => {
        const nameLower = p.name.toLowerCase();
        // Check if at least 2 key words match
        const matches = keyWords.filter(keyword => 
          nameLower.includes(keyword.toLowerCase())
        );
        return matches.length >= 2;
      });
    }
    
    if (product && item.images.length > 0) {
      // Convert to proxy URLs
      const proxyImages = item.images.map(img => 
        `/api/image-proxy?url=${encodeURIComponent(img)}`
      );
      
      await prisma.product.update({
        where: { id: product.id },
        data: { images: proxyImages }
      });
      
      updated++;
      console.log(`  ✓ [${updated}] ${product.name.substring(0, 50)}... (${item.images.length} images)`);
    } else {
      notFound++;
      console.log(`  ✗ Not found: ${item.reverbUrl.split('/').pop()?.substring(0, 50)}`);
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

