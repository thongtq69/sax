// Final comprehensive image matching with conflict resolution
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ProductImages {
  reverbUrl: string;
  itemId: string;
  images: string[];
  urlSlug: string;
  urlName: string;
}

function parseImageFile(filePath: string): ProductImages[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const products: ProductImages[] = [];
  let currentProduct: ProductImages | null = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (!trimmed) continue;
    
    if (trimmed.startsWith('https://reverb.com/item/')) {
      if (currentProduct) {
        products.push(currentProduct);
      }
      
      const itemIdMatch = trimmed.match(/item\/(\d+)/);
      const itemId = itemIdMatch ? itemIdMatch[1] : '';
      
      const urlName = trimmed.split('/').pop() || '';
      const urlSlug = urlName
        .replace(/^\d+-/, '')
        .replace(/no-tariffs-/, '')
        .replace(/[^a-z0-9-]/gi, '-')
        .replace(/-+/g, '-')
        .toLowerCase();
      
      currentProduct = {
        reverbUrl: trimmed,
        itemId,
        images: [],
        urlSlug,
        urlName
      };
    } else if (trimmed.startsWith('https://rvb-img.reverb.com/') || trimmed.startsWith('https://img.reverb.com/')) {
      if (currentProduct) {
        currentProduct.images.push(trimmed);
      }
    }
  }
  
  if (currentProduct) {
    products.push(currentProduct);
  }
  
  return products;
}

function findBestMatch(item: ProductImages, allProducts: Array<{id: string, name: string, slug: string, images: string[]}>) {
  // Priority 1: Exact slug + image count match
  let match = allProducts.find(p => 
    p.slug.toLowerCase() === item.urlSlug && 
    (p.images?.length || 0) === item.images.length
  );
  if (match) return { product: match, confidence: 'high', reason: 'Exact slug + image count' };
  
  // Priority 2: Exact slug match (different image count - might be update needed)
  match = allProducts.find(p => p.slug.toLowerCase() === item.urlSlug);
  if (match) return { product: match, confidence: 'high', reason: 'Exact slug' };
  
  // Priority 3: Partial slug + image count match (for products with -1 suffix)
  match = allProducts.find(p => {
    const pSlug = p.slug.toLowerCase();
    return (pSlug.startsWith(item.urlSlug) || item.urlSlug.startsWith(pSlug.substring(0, pSlug.length - 2))) &&
           (p.images?.length || 0) === item.images.length;
  });
  if (match) return { product: match, confidence: 'medium', reason: 'Partial slug + image count' };
  
  // Priority 4: Partial slug match
  match = allProducts.find(p => {
    const pSlug = p.slug.toLowerCase();
    return pSlug.includes(item.urlSlug.substring(0, 35)) || item.urlSlug.includes(pSlug.substring(0, 35));
  });
  if (match) return { product: match, confidence: 'medium', reason: 'Partial slug' };
  
  return { product: null, confidence: 'none', reason: 'No match' };
}

async function finalMatching() {
  console.log('🔍 Final Comprehensive Image Matching...\n');
  
  const imageFilePath = path.join(__dirname, '../../reverb_images.txt');
  const productImages = parseImageFile(imageFilePath);
  const allProducts = await prisma.product.findMany({
    select: { id: true, name: true, slug: true, images: true },
    orderBy: { name: 'asc' }
  }) as Array<{id: string, name: string, slug: string, images: string[]}>;
  
  console.log(`📦 File: ${productImages.length} products`);
  console.log(`📊 Database: ${allProducts.length} products\n`);
  console.log('═'.repeat(100));
  
  const matches = new Map<string, ProductImages[]>(); // Track which DB products are matched
  
  for (const item of productImages) {
    const { product, confidence, reason } = findBestMatch(item, allProducts);
    
    if (product) {
      const key = product.id;
      if (!matches.has(key)) {
        matches.set(key, []);
      }
      matches.get(key)!.push(item);
    }
  }
  
  // Check for conflicts (multiple file items matching same DB product)
  const conflicts: Array<{product: any, items: ProductImages[]}> = [];
  matches.forEach((items, productId) => {
    if (items.length > 1) {
      const product = allProducts.find(p => p.id === productId);
      if (product) {
        conflicts.push({ product, items });
      }
    }
  });
  
  if (conflicts.length > 0) {
    console.log(`\n⚠️  Found ${conflicts.length} conflicts (multiple file items match same DB product):\n`);
    
    for (const conflict of conflicts) {
      console.log(`\nProduct: ${conflict.product.name}`);
      console.log(`  DB Slug: ${conflict.product.slug}`);
      console.log(`  Current Images: ${conflict.product.images?.length || 0}`);
      console.log(`  Matched Items:`);
      
      conflict.items.forEach((item, idx) => {
        const { product: match, reason } = findBestMatch(item, allProducts);
        console.log(`    ${idx + 1}. Item ${item.itemId}: ${item.images.length} images`);
        console.log(`       URL: ${item.urlName.substring(0, 60)}...`);
        console.log(`       Slug: ${item.urlSlug}`);
        console.log(`       Reason: ${reason}`);
      });
      
      // Choose the best match (prefer exact slug + image count, or most images)
      const bestItem = conflict.items.reduce((best, current) => {
        const bestMatch = findBestMatch(best, allProducts);
        const currentMatch = findBestMatch(current, allProducts);
        
        // Prefer exact slug match
        if (currentMatch.reason.includes('Exact') && !bestMatch.reason.includes('Exact')) {
          return current;
        }
        if (bestMatch.reason.includes('Exact') && !currentMatch.reason.includes('Exact')) {
          return best;
        }
        
        // Prefer more images (usually more complete)
        return current.images.length > best.images.length ? current : best;
      });
      
      console.log(`  → Will use: Item ${bestItem.itemId} (${bestItem.images.length} images)`);
    }
  }
  
  console.log('\n' + '═'.repeat(100));
  console.log('\n📋 Processing all items...\n');
  
  let updated = 0;
  let skipped = 0;
  const processedProducts = new Set<string>();
  
  for (const item of productImages) {
    const { product, confidence, reason } = findBestMatch(item, allProducts);
    
    if (!product) {
      console.log(`  ✗ Item ${item.itemId}: NO MATCH - ${item.urlName.substring(0, 50)}...`);
      continue;
    }
    
    // Handle conflicts - only process if this is the best match for this product
    if (conflicts.some(c => c.product.id === product.id)) {
      const conflict = conflicts.find(c => c.product.id === product.id)!;
      const bestItem = conflict.items.reduce((best, current) => {
        const bestMatch = findBestMatch(best, allProducts);
        const currentMatch = findBestMatch(current, allProducts);
        if (currentMatch.reason.includes('Exact') && !bestMatch.reason.includes('Exact')) {
          return current;
        }
        return current.images.length > best.images.length ? current : best;
      });
      
      if (item.itemId !== bestItem.itemId) {
        console.log(`  ⊘ Item ${item.itemId}: SKIPPED (conflict - using item ${bestItem.itemId} instead)`);
        skipped++;
        continue;
      }
    }
    
    // Skip if already processed
    if (processedProducts.has(product.id)) {
      console.log(`  ⊘ Item ${item.itemId}: SKIPPED (product already updated)`);
      skipped++;
      continue;
    }
    
    const currentImages = product.images?.length || 0;
    const newImages = item.images.length;
    
    if (currentImages === newImages && currentImages > 0) {
      // Check if images are the same
      const currentFirst = product.images?.[0] || '';
      const newFirst = item.images[0] || '';
      if (currentFirst === newFirst) {
        console.log(`  ✓ Item ${item.itemId}: ${product.name.substring(0, 50).padEnd(50)} | Already correct (${currentImages} images)`);
        processedProducts.add(product.id);
        continue;
      }
    }
    
    await prisma.product.update({
      where: { id: product.id },
      data: { images: item.images }
    });
    
    updated++;
    processedProducts.add(product.id);
    console.log(`  ✓ Item ${item.itemId}: ${product.name.substring(0, 50).padEnd(50)} | Updated: ${currentImages} → ${newImages} images (${reason})`);
  }
  
  console.log('\n' + '═'.repeat(100));
  console.log(`\n📊 Final Summary:`);
  console.log(`   Total items in file: ${productImages.length}`);
  console.log(`   Successfully updated: ${updated}`);
  console.log(`   Already correct: ${productImages.length - updated - skipped}`);
  console.log(`   Skipped (conflicts): ${skipped}`);
  console.log(`   Conflicts resolved: ${conflicts.length}`);
}

finalMatching()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

