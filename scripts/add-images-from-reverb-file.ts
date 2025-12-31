// Add all images from reverb_images.txt to products in database
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ProductImages {
  reverbUrl: string;
  itemId: string;
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
      
      // Extract item ID
      const itemIdMatch = trimmed.match(/item\/(\d+)/);
      const itemId = itemIdMatch ? itemIdMatch[1] : '';
      
      // Start new product
      currentProduct = {
        reverbUrl: trimmed,
        itemId,
        images: []
      };
    } else if (trimmed.startsWith('https://rvb-img.reverb.com/') || trimmed.startsWith('https://img.reverb.com/')) {
      // It's an image URL - keep original URL (no proxy, no modification)
      if (currentProduct) {
        currentProduct.images.push(trimmed);
      }
    }
  }
  
  // Don't forget the last product
  if (currentProduct) {
    products.push(currentProduct);
  }
  
  return products;
}

// Improved matching function
function findMatchingProduct(item: ProductImages, allProducts: Array<{id: string, name: string, slug: string}>) {
  // Extract product name from URL
  const urlSlug = item.reverbUrl
    .split('/')
    .pop()
    ?.replace(/^\d+-/, '')
    .replace(/no-tariffs-/, '')
    .replace(/[^a-z0-9-]/gi, '-')
    .replace(/-+/g, '-')
    .toLowerCase() || '';
  
  // Method 1: Try to match by item ID in slug or name (if stored)
  // This is unlikely but worth trying
  
  // Method 2: Try exact slug match
  let product = allProducts.find(p => {
    const productSlug = p.slug.toLowerCase();
    return productSlug === urlSlug || 
           productSlug.includes(urlSlug.substring(0, 30)) ||
           urlSlug.includes(productSlug.substring(0, 30));
  });
  
  if (product) return product;
  
  // Method 3: Extract key identifiers from URL
  const urlParts = urlSlug.split('-').filter(p => p.length > 0);
  
  // Look for brand names and model numbers
  const brands = ['yamaha', 'yanagisawa', 'selmer'];
  const modelPatterns = [
    /yts-?\d+/i,  // YTS-62, YTS62
    /yas-?\d+/i,  // YAS-62
    /a-?\d+/i,    // A-900, A900
    /s-?\d+/i,    // S-901, S901
    /sc-?\d+/i,   // SC-992
    /sa\d+/i,     // SA80
    /reference/i,
    /hummingbird/i,
  ];
  
  // Find brand
  const brand = brands.find(b => urlSlug.includes(b));
  
  // Find model
  let model = '';
  for (const pattern of modelPatterns) {
    const match = urlSlug.match(pattern);
    if (match) {
      model = match[0].toLowerCase();
      break;
    }
  }
  
  // Method 4: Match by brand + model
  if (brand && model) {
    product = allProducts.find(p => {
      const nameLower = p.name.toLowerCase();
      return nameLower.includes(brand) && nameLower.includes(model.replace(/-/g, ''));
    });
    
    if (product) return product;
  }
  
  // Method 5: Match by key words (at least 3 matches)
  const keyWords = urlParts.filter(w => 
    w.length > 2 && 
    !['no', 'tariffs', 'item', 'and', 'the', 'for', 'alto', 'tenor', 'soprano', 'saxophone'].includes(w.toLowerCase())
  );
  
  product = allProducts.find(p => {
    const nameLower = p.name.toLowerCase();
    const matches = keyWords.filter(keyword => 
      nameLower.includes(keyword.toLowerCase())
    );
    return matches.length >= 3; // Require at least 3 matches for better accuracy
  });
  
  return product || null;
}

async function addImagesToProducts() {
  console.log('🖼️  Reading and adding images from reverb_images.txt...\n');
  
  const imageFilePath = path.join(__dirname, '../../reverb_images.txt');
  
  if (!fs.existsSync(imageFilePath)) {
    console.error('❌ File not found: reverb_images.txt');
    console.error('   Expected at:', imageFilePath);
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
  const notFoundItems: string[] = [];
  
  for (const item of productImages) {
    const product = findMatchingProduct(item, allProducts);
    
    if (product && item.images.length > 0) {
      // Use DIRECT URLs from file (no proxy, no modification)
      await prisma.product.update({
        where: { id: product.id },
        data: { images: item.images }
      });
      
      updated++;
      console.log(`  ✓ [${updated}] ${product.name.substring(0, 60)}... (${item.images.length} images)`);
    } else {
      notFound++;
      const productName = item.reverbUrl.split('/').pop()?.substring(0, 60) || 'Unknown';
      notFoundItems.push(productName);
      console.log(`  ✗ [${notFound}] Not found: ${productName}`);
    }
  }
  
  console.log(`\n✅ Successfully updated ${updated} products with images`);
  if (notFound > 0) {
    console.log(`⚠️  ${notFound} products not found in database:`);
    notFoundItems.forEach((item, idx) => {
      console.log(`   ${idx + 1}. ${item}`);
    });
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total products in file: ${productImages.length}`);
  console.log(`   Successfully matched: ${updated}`);
  console.log(`   Not found: ${notFound}`);
  console.log(`   Total images added: ${productImages.reduce((sum, item) => sum + item.images.length, 0)}`);
}

addImagesToProducts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

