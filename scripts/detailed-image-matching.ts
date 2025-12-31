// Detailed image matching with manual verification
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
  const matches: Array<{product: any, score: number, reason: string}> = [];
  
  // Score 100: Exact slug match + image count match
  const exactSlug = allProducts.find(p => p.slug.toLowerCase() === item.urlSlug);
  if (exactSlug) {
    const imageCountMatch = (exactSlug.images?.length || 0) === item.images.length;
    matches.push({ 
      product: exactSlug, 
      score: imageCountMatch ? 100 : 95, 
      reason: `Exact slug match${imageCountMatch ? ' + image count match' : ''}` 
    });
  }
  
  // Score 95: Slug contains + image count match (for products with -1 suffix)
  allProducts.forEach(p => {
    const pSlug = p.slug.toLowerCase();
    const imageCount = p.images?.length || 0;
    const imageCountMatch = imageCount === item.images.length;
    
    if ((pSlug.includes(item.urlSlug.substring(0, 40)) || item.urlSlug.includes(pSlug.substring(0, 40))) && imageCountMatch) {
      if (!matches.find(m => m.product.id === p.id)) {
        matches.push({ product: p, score: 95, reason: 'Partial slug + image count match' });
      }
    }
  });
  
  // Score 90: Slug contains or is contained (without image count check)
  allProducts.forEach(p => {
    const pSlug = p.slug.toLowerCase();
    if (pSlug.includes(item.urlSlug.substring(0, 40)) || item.urlSlug.includes(pSlug.substring(0, 40))) {
      if (!matches.find(m => m.product.id === p.id)) {
        matches.push({ product: p, score: 90, reason: 'Partial slug match' });
      }
    }
  });
  
  // Score 80: Name contains all key parts
  const keyParts = item.urlSlug.split('-').filter(p => 
    p.length > 2 && 
    !['no', 'tariffs', 'item', 'and', 'the', 'for', 'saxophone', 'tenor', 'alto', 'soprano'].includes(p.toLowerCase())
  );
  
  allProducts.forEach(p => {
    const nameLower = p.name.toLowerCase();
    const matchingParts = keyParts.filter(part => nameLower.includes(part));
    if (matchingParts.length >= keyParts.length * 0.7 && !matches.find(m => m.product.id === p.id)) {
      matches.push({ product: p, score: 80, reason: `Name contains ${matchingParts.length}/${keyParts.length} key parts` });
    }
  });
  
  // Sort by score and return best match
  matches.sort((a, b) => b.score - a.score);
  return matches[0] || null;
}

async function detailedMatching() {
  console.log('🔍 Detailed Image Matching Analysis...\n');
  
  const imageFilePath = path.join(__dirname, '../../reverb_images.txt');
  const productImages = parseImageFile(imageFilePath);
  const allProducts = await prisma.product.findMany({
    select: { id: true, name: true, slug: true, images: true },
    orderBy: { name: 'asc' }
  }) as Array<{id: string, name: string, slug: string, images: string[]}>;
  
  console.log(`📦 File: ${productImages.length} products`);
  console.log(`📊 Database: ${allProducts.length} products\n`);
  console.log('═'.repeat(100));
  
  const results: Array<{
    fileItem: ProductImages;
    match: {product: any, score: number, reason: string} | null;
    status: string;
  }> = [];
  
  for (const item of productImages) {
    const match = findBestMatch(item, allProducts);
    let status = '';
    
    if (match) {
      const currentImages = match.product.images?.length || 0;
      const newImages = item.images.length;
      
      if (currentImages === newImages) {
        status = `✓ Already has ${currentImages} images`;
      } else {
        status = `⚠ Needs update: ${currentImages} → ${newImages} images`;
      }
    } else {
      status = '✗ NO MATCH FOUND';
    }
    
    results.push({ fileItem: item, match, status });
  }
  
  // Display results
  results.forEach((result, idx) => {
    const item = result.fileItem;
    const match = result.match;
    
    console.log(`\n${idx + 1}. ${item.urlName.substring(0, 70)}`);
    console.log(`   Item ID: ${item.itemId}`);
    console.log(`   URL Slug: ${item.urlSlug}`);
    console.log(`   Images: ${item.images.length}`);
    
    if (match) {
      console.log(`   ${result.status}`);
      console.log(`   Matched: ${match.product.name}`);
      console.log(`   DB Slug: ${match.product.slug}`);
      console.log(`   Score: ${match.score} (${match.reason})`);
      console.log(`   Current DB Images: ${match.product.images?.length || 0}`);
    } else {
      console.log(`   ${result.status}`);
      // Show similar products
      const similar = allProducts.filter(p => {
        const nameLower = p.name.toLowerCase();
        const urlLower = item.urlSlug.toLowerCase();
        return nameLower.includes('yamaha') && urlLower.includes('yamaha') ||
               nameLower.includes('yanagisawa') && urlLower.includes('yanagisawa') ||
               nameLower.includes('selmer') && urlLower.includes('selmer');
      }).slice(0, 3);
      
      if (similar.length > 0) {
        console.log(`   Similar products:`);
        similar.forEach(p => console.log(`     - ${p.name} (${p.slug})`));
      }
    }
  });
  
  console.log('\n' + '═'.repeat(100));
  console.log('\n📊 Summary:');
  
  const matched = results.filter(r => r.match).length;
  const needsUpdate = results.filter(r => {
    if (!r.match) return false;
    const current = r.match.product.images?.length || 0;
    const newCount = r.fileItem.images.length;
    return current !== newCount;
  }).length;
  const notFound = results.filter(r => !r.match).length;
  
  console.log(`   Matched: ${matched}/${productImages.length}`);
  console.log(`   Needs update: ${needsUpdate}`);
  console.log(`   Not found: ${notFound}`);
  
  // Update products that need updating
  if (needsUpdate > 0) {
    console.log(`\n🔄 Updating ${needsUpdate} products...`);
    let updated = 0;
    
    for (const result of results) {
      if (result.match) {
        const current = result.match.product.images?.length || 0;
        const newCount = result.fileItem.images.length;
        
        if (current !== newCount) {
          await prisma.product.update({
            where: { id: result.match.product.id },
            data: { images: result.fileItem.images }
          });
          updated++;
          console.log(`   ✓ Updated: ${result.match.product.name} (${current} → ${newCount} images)`);
        }
      }
    }
    
    console.log(`\n✅ Updated ${updated} products`);
  }
}

detailedMatching()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

