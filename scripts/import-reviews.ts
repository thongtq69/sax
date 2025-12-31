// Import reviews from reverb_feedback.txt
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ReviewData {
  rating: number;
  productName: string;
  buyerName: string;
  date: string;
  message: string;
  listingUrl: string;
  feedbackApi: string;
}

function parseFeedbackFile(filePath: string): ReviewData[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const reviews: ReviewData[] = [];
  
  // Split by separator
  const sections = content.split('---\n\n').filter(s => s.trim());
  
  for (const section of sections) {
    const lines = section.split('\n').map(l => l.trim()).filter(l => l);
    
    let rating = 5;
    let productName = '';
    let buyerName = '';
    let date = '';
    let message = '';
    let listingUrl = '';
    let feedbackApi = '';
    
    for (const line of lines) {
      if (line.startsWith('Rating:')) {
        // Extract rating from "Rating: ★★★★★ (5)"
        const match = line.match(/\((\d+)\)/);
        if (match) {
          rating = parseInt(match[1]);
        }
      } else if (line.startsWith('Product:')) {
        productName = line.replace('Product:', '').trim();
      } else if (line.startsWith('Buyer:')) {
        buyerName = line.replace('Buyer:', '').trim();
      } else if (line.startsWith('Date:')) {
        date = line.replace('Date:', '').trim();
      } else if (line.startsWith('Message:')) {
        message = line.replace('Message:', '').trim();
      } else if (line.startsWith('Listing:')) {
        listingUrl = line.replace('Listing:', '').trim();
      } else if (line.startsWith('Feedback API:')) {
        feedbackApi = line.replace('Feedback API:', '').trim();
      } else if (line && !line.startsWith('Rating:') && !line.startsWith('Product:') && 
                 !line.startsWith('Buyer:') && !line.startsWith('Date:') && 
                 !line.startsWith('Message:') && !line.startsWith('Listing:') && 
                 !line.startsWith('Feedback API:')) {
        // Continuation of message
        if (message) {
          message += ' ' + line;
        }
      }
    }
    
    if (productName && buyerName && message) {
      reviews.push({
        rating,
        productName,
        buyerName,
        date,
        message: message.trim(),
        listingUrl,
        feedbackApi,
      });
    }
  }
  
  return reviews;
}

// Function to match product name to database product
function matchProduct(productName: string, dbProducts: any[]): any | null {
  // Normalize product name
  const normalized = productName.toLowerCase()
    .replace(/vintage\s+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Try exact match first
  let match = dbProducts.find(p => 
    p.name.toLowerCase() === productName.toLowerCase()
  );
  
  if (match) return match;
  
  // Try normalized match
  match = dbProducts.find(p => {
    const pNormalized = p.name.toLowerCase()
      .replace(/vintage\s+/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    return pNormalized === normalized;
  });
  
  if (match) return match;
  
  // Try partial match - extract key identifiers
  const keyWords = normalized.split(' ')
    .filter(w => w.length > 2 && !['the', 'and', 'for', 'with'].includes(w));
  
  match = dbProducts.find(p => {
    const pLower = p.name.toLowerCase();
    return keyWords.every(keyword => pLower.includes(keyword));
  });
  
  if (match) return match;
  
  // Try brand + model match
  const brandMatch = normalized.match(/(yamaha|yanagisawa|selmer)/i);
  if (brandMatch) {
    const brand = brandMatch[1];
    const modelMatch = normalized.match(/(yts|yas|t-|a-|s-|sc-|wo\d+|62|61|875|900|902|992)/i);
    
    if (modelMatch) {
      match = dbProducts.find(p => {
        const pLower = p.name.toLowerCase();
        return pLower.includes(brand) && modelMatch.some(m => pLower.includes(m.toLowerCase()));
      });
    }
  }
  
  return match || null;
}

async function importReviews() {
  console.log('📝 Importing reviews from reverb_feedback.txt...\n');
  
  const filePath = path.join(process.cwd(), '..', 'reverb_feedback.txt');
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ File not found:', filePath);
    return;
  }
  
  const reviews = parseFeedbackFile(filePath);
  console.log(`📦 Parsed ${reviews.length} reviews from file\n`);
  
  // Get all products
  const dbProducts = await prisma.product.findMany({
    select: { id: true, name: true, slug: true },
  });
  console.log(`📊 Found ${dbProducts.length} products in database\n`);
  
  let imported = 0;
  let skipped = 0;
  let notFound = 0;
  const productReviewCounts: Record<string, { count: number; totalRating: number }> = {};
  
  console.log('────────────────────────────────────────────────────────────────────────────────');
  
  for (const review of reviews) {
    const product = matchProduct(review.productName, dbProducts);
    
    if (!product) {
      console.log(`  ✗ Not found: ${review.productName}`);
      notFound++;
      continue;
    }
    
    // Check if review already exists (by buyer name and date)
    const existing = await prisma.review.findFirst({
      where: {
        productId: product.id,
        buyerName: review.buyerName,
        date: new Date(review.date),
      },
    });
    
    if (existing) {
      console.log(`  ⊘ Skipped: ${review.productName} - ${review.buyerName} (already exists)`);
      skipped++;
      continue;
    }
    
    // Create review
    await prisma.review.create({
      data: {
        productId: product.id,
        buyerName: review.buyerName,
        rating: review.rating,
        message: review.message,
        date: new Date(review.date),
        sourceUrl: review.listingUrl || null,
        sourceApi: review.feedbackApi || null,
      },
    });
    
    // Track for rating calculation
    if (!productReviewCounts[product.id]) {
      productReviewCounts[product.id] = { count: 0, totalRating: 0 };
    }
    productReviewCounts[product.id].count++;
    productReviewCounts[product.id].totalRating += review.rating;
    
    console.log(`  ✓ ${review.productName.padEnd(50)} | ${review.buyerName} (${review.rating}★)`);
    imported++;
  }
  
  console.log('────────────────────────────────────────────────────────────────────────────────');
  
  // Update product ratings and review counts
  console.log('\n📊 Updating product ratings and review counts...\n');
  
  for (const [productId, stats] of Object.entries(productReviewCounts)) {
    const avgRating = stats.totalRating / stats.count;
    
    // Get all reviews for this product (including existing ones)
    const allReviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });
    
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const finalAvgRating = totalRating / allReviews.length;
    const finalCount = allReviews.length;
    
    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: Math.round(finalAvgRating * 10) / 10, // Round to 1 decimal
        reviewCount: finalCount,
      },
    });
    
    const product = dbProducts.find(p => p.id === productId);
    console.log(`  ✓ ${product?.name.padEnd(50)} | ${finalCount} reviews, ${finalAvgRating.toFixed(1)}★ avg`);
  }
  
  console.log('\n✅ Import complete!');
  console.log(`   Imported: ${imported}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Not found: ${notFound}`);
  console.log(`   Total reviews in database: ${await prisma.review.count()}`);
}

importReviews()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

