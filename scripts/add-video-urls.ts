// Add YouTube video URLs from reverb_media.txt to products
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ProductVideo {
  reverbUrl: string;
  itemId: string;
  videoUrl: string | null;
  urlSlug: string;
}

function parseMediaFile(filePath: string): ProductVideo[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const products: ProductVideo[] = [];
  let currentProduct: ProductVideo | null = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (!trimmed) continue;
    
    // Check if it's a Reverb URL (product URL)
    if (trimmed.startsWith('https://reverb.com/item/')) {
      // Save previous product if exists
      if (currentProduct) {
        products.push(currentProduct);
      }
      
      const itemIdMatch = trimmed.match(/item\/(\d+)/);
      const itemId = itemIdMatch ? itemIdMatch[1] : '';
      
      const urlSlug = trimmed
        .split('/')
        .pop()
        ?.replace(/^\d+-/, '')
        .replace(/no-tariffs-/, '')
        .replace(/[^a-z0-9-]/gi, '-')
        .replace(/-+/g, '-')
        .toLowerCase() || '';
      
      currentProduct = {
        reverbUrl: trimmed,
        itemId,
        videoUrl: null,
        urlSlug
      };
    } else if (trimmed.startsWith('video:')) {
      // Extract video URL
      const videoUrl = trimmed.replace(/^video:\s*/, '').trim();
      if (currentProduct && videoUrl) {
        // Normalize YouTube URL to embed format
        let normalizedUrl = videoUrl;
        
        // Convert youtu.be to youtube.com/watch
        if (videoUrl.includes('youtu.be/')) {
          const videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
          normalizedUrl = `https://www.youtube.com/watch?v=${videoId}`;
        }
        // Convert youtube.com/shorts/ to youtube.com/watch
        else if (videoUrl.includes('youtube.com/shorts/')) {
          const videoId = videoUrl.split('youtube.com/shorts/')[1].split('?')[0];
          normalizedUrl = `https://www.youtube.com/watch?v=${videoId}`;
        }
        // Keep youtube.com/watch as is
        else if (videoUrl.includes('youtube.com/watch')) {
          normalizedUrl = videoUrl;
        }
        
        currentProduct.videoUrl = normalizedUrl;
      }
    }
  }
  
  // Don't forget the last product
  if (currentProduct) {
    products.push(currentProduct);
  }
  
  return products;
}

function findBestMatch(item: ProductVideo, allProducts: Array<{id: string, name: string, slug: string}>) {
  // Priority 1: Exact slug match
  let match = allProducts.find(p => p.slug.toLowerCase() === item.urlSlug);
  if (match) return { product: match, confidence: 'high', reason: 'Exact slug match' };
  
  // Priority 2: Partial slug match (for products with -1 suffix)
  match = allProducts.find(p => {
    const pSlug = p.slug.toLowerCase();
    return pSlug.includes(item.urlSlug.substring(0, 35)) || item.urlSlug.includes(pSlug.substring(0, 35));
  });
  if (match) return { product: match, confidence: 'medium', reason: 'Partial slug match' };
  
  return { product: null, confidence: 'none', reason: 'No match' };
}

async function addVideoUrls() {
  console.log('🎥 Adding YouTube video URLs to products...\n');
  
  const mediaFilePath = path.join(__dirname, '../../reverb_media.txt');
  
  if (!fs.existsSync(mediaFilePath)) {
    console.error('❌ File not found: reverb_media.txt');
    return;
  }
  
  const productVideos = parseMediaFile(mediaFilePath);
  console.log(`📦 Parsed ${productVideos.length} products from file`);
  console.log(`🎥 Found ${productVideos.filter(p => p.videoUrl).length} products with videos\n`);
  
  const allProducts = await prisma.product.findMany({
    select: { id: true, name: true, slug: true, videoUrl: true },
    orderBy: { name: 'asc' }
  });
  
  console.log(`📊 Found ${allProducts.length} products in database\n`);
  console.log('─'.repeat(80));
  
  let updated = 0;
  let skipped = 0;
  let notFound = 0;
  
  for (const item of productVideos) {
    if (!item.videoUrl) {
      skipped++;
      continue;
    }
    
    const { product, confidence, reason } = findBestMatch(item, allProducts);
    
    if (!product) {
      notFound++;
      console.log(`  ✗ Item ${item.itemId}: NO MATCH - ${item.urlSlug.substring(0, 50)}...`);
      continue;
    }
    
    // Skip if already has the same video URL
    if (product.videoUrl === item.videoUrl) {
      console.log(`  ⊘ ${product.name.substring(0, 50).padEnd(50)} | Already has video`);
      skipped++;
      continue;
    }
    
    await prisma.product.update({
      where: { id: product.id },
      data: { videoUrl: item.videoUrl }
    });
    
    updated++;
    console.log(`  ✓ ${product.name.substring(0, 50).padEnd(50)} | Added video (${reason})`);
    console.log(`    ${item.videoUrl}`);
  }
  
  console.log('─'.repeat(80));
  console.log(`\n📊 Summary:`);
  console.log(`   Total products in file: ${productVideos.length}`);
  console.log(`   Products with videos: ${productVideos.filter(p => p.videoUrl).length}`);
  console.log(`   Successfully updated: ${updated}`);
  console.log(`   Already had video: ${skipped}`);
  console.log(`   Not found: ${notFound}`);
}

addVideoUrls()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

