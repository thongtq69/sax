/**
 * Reverb Shop Scraper for James Sax Corner
 * Enhanced version with better image extraction
 * 
 * Usage: node scripts/scrape-reverb.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SHOP_URL = 'https://reverb.com/shop/jamessaxcorner';

async function scrapeReverbShop() {
  console.log('🎷 Starting Reverb Shop Scraper with Puppeteer...\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });
  
  const page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  // Intercept network requests to capture images
  const capturedImages = new Map();
  
  await page.setRequestInterception(true);
  page.on('request', request => {
    request.continue();
  });
  
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('images.reverb.com') && (url.includes('.jpg') || url.includes('.png') || url.includes('.webp'))) {
      // Extract product ID from URL if possible
      const cleanUrl = url.split('?')[0];
      if (!capturedImages.has(cleanUrl)) {
        capturedImages.set(cleanUrl, url);
      }
    }
  });
  
  try {
    console.log('📂 Loading shop page...');
    await page.goto(SHOP_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    
    await autoScroll(page);
    await page.waitForSelector('a[href*="/item/"]', { timeout: 30000 });
    
    const productLinks = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href*="/item/"]');
      const uniqueLinks = new Set();
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes('/item/')) {
          uniqueLinks.add(href.startsWith('http') ? href : `https://reverb.com${href}`);
        }
      });
      return Array.from(uniqueLinks);
    });
    
    console.log(`\n✅ Found ${productLinks.length} products\n`);
    
    const products = [];
    
    for (let i = 0; i < productLinks.length; i++) {
      const url = productLinks[i];
      console.log(`[${i + 1}/${productLinks.length}] Scraping: ${url.split('/').pop().substring(0, 50)}...`);
      
      try {
        const productData = await scrapeProductPage(page, url);
        if (productData) {
          products.push(productData);
          console.log(`  ✓ ${productData.name.substring(0, 50)}... (${productData.images.length} images)`);
        }
      } catch (error) {
        console.log(`  ✗ Error: ${error.message}`);
      }
      
      await sleep(2500);
    }
    
    // Save to JSON file
    const outputPath = path.join(__dirname, '../data/reverb-products.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));
    
    console.log(`\n🎉 SUCCESS! Scraped ${products.length} products`);
    console.log(`📁 Saved to: ${outputPath}`);
    
    await generateSeedData(products);
    
    return products;
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

async function scrapeProductPage(page, url) {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  
  // Wait for images to load
  await sleep(3000);
  
  // Click on thumbnail gallery to load more images
  try {
    const thumbnails = await page.$$('[data-testid="image-gallery-thumbnail"], .gallery-thumbnail, [class*="thumbnail"]');
    for (let i = 0; i < Math.min(thumbnails.length, 10); i++) {
      await thumbnails[i].click();
      await sleep(500);
    }
  } catch (e) {}
  
  await sleep(1000);
  
  const productData = await page.evaluate((sourceUrl) => {
    // Get title
    const titleEl = document.querySelector('h1');
    const name = titleEl ? titleEl.textContent.trim() : 'Unknown Product';
    
    // Get price - multiple selectors
    let price = 0;
    const priceSelectors = [
      '[data-testid="price"]',
      '.price-display',
      '[class*="price"]',
      'span[class*="Price"]'
    ];
    
    for (const selector of priceSelectors) {
      const el = document.querySelector(selector);
      if (el) {
        const priceMatch = el.textContent.match(/\$([0-9,]+)/);
        if (priceMatch) {
          price = parseFloat(priceMatch[1].replace(',', ''));
          break;
        }
      }
    }
    
    // Get ALL images from various sources
    const images = new Set();
    
    // Method 1: Get from srcset
    document.querySelectorAll('img[srcset*="reverb"], img[src*="reverb"]').forEach(img => {
      const srcset = img.getAttribute('srcset');
      if (srcset) {
        const matches = srcset.match(/https:\/\/images\.reverb\.com\/[^\s,]+/g);
        if (matches) {
          matches.forEach(m => {
            const clean = m.split('?')[0];
            if (clean.includes('/s_') || clean.includes('/w_')) {
              // Convert to large size
              const large = clean.replace(/\/s_[^\/]+\//, '/s_large/').replace(/\/w_\d+/, '/w_1200');
              images.add(large);
            } else {
              images.add(clean);
            }
          });
        }
      }
      const src = img.src;
      if (src && src.includes('images.reverb.com')) {
        const clean = src.split('?')[0];
        const large = clean.replace(/\/s_[^\/]+\//, '/s_large/').replace(/\/w_\d+/, '/w_1200');
        images.add(large);
      }
    });
    
    // Method 2: Background images
    document.querySelectorAll('[style*="reverb"]').forEach(el => {
      const style = el.getAttribute('style') || '';
      const match = style.match(/url\(['"](https:\/\/images\.reverb\.com\/[^'"]+)['"]\)/);
      if (match) {
        const clean = match[1].split('?')[0];
        images.add(clean);
      }
    });
    
    // Method 3: Data attributes
    document.querySelectorAll('[data-src*="reverb"], [data-image*="reverb"]').forEach(el => {
      ['data-src', 'data-image', 'data-original'].forEach(attr => {
        const val = el.getAttribute(attr);
        if (val && val.includes('reverb')) {
          images.add(val.split('?')[0]);
        }
      });
    });
    
    // Method 4: Look in scripts for image arrays
    document.querySelectorAll('script').forEach(script => {
      const content = script.textContent || '';
      const imgMatches = content.match(/https:\/\/images\.reverb\.com\/image\/upload\/[^"'\s,\]]+/g);
      if (imgMatches) {
        imgMatches.forEach(img => {
          const clean = img.split('?')[0];
          images.add(clean);
        });
      }
    });
    
    // Get description
    let description = '';
    const descSelectors = [
      '[data-testid="listing-description"]',
      '.description-text',
      '[class*="description"]',
      '.listing-description'
    ];
    
    for (const selector of descSelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.length > 50) {
        description = el.textContent.trim();
        break;
      }
    }
    
    // Get condition
    let condition = 'Excellent';
    const conditionEl = document.querySelector('[data-testid="condition"], [class*="condition"]');
    if (conditionEl) {
      condition = conditionEl.textContent.trim();
    }
    
    // Get video URL if exists
    let videoUrl = null;
    const videoEl = document.querySelector('iframe[src*="youtube"], iframe[src*="vimeo"], video source');
    if (videoEl) {
      videoUrl = videoEl.src || videoEl.getAttribute('src');
    }
    
    return {
      name,
      price,
      images: Array.from(images).filter(img => 
        img.includes('images.reverb.com') && 
        !img.includes('avatar') && 
        !img.includes('logo') &&
        !img.includes('placeholder')
      ),
      description,
      condition,
      videoUrl,
      sourceUrl
    };
  }, url);
  
  // Generate slug
  const slug = url.split('/').pop()
    .replace(/^\d+-/, '')
    .replace(/[^a-z0-9-]/gi, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
    .substring(0, 80);
  
  // Determine brand
  const brandPatterns = [
    { pattern: /yanagisawa/i, brand: 'Yanagisawa' },
    { pattern: /yamaha/i, brand: 'Yamaha' },
    { pattern: /selmer/i, brand: 'Selmer' },
    { pattern: /buffet/i, brand: 'Buffet Crampon' },
    { pattern: /jupiter/i, brand: 'Jupiter' },
    { pattern: /conn/i, brand: 'Conn' },
    { pattern: /king/i, brand: 'King' },
    { pattern: /keilwerth/i, brand: 'Keilwerth' },
    { pattern: /mauriat/i, brand: 'P. Mauriat' },
    { pattern: /cannonball/i, brand: 'Cannonball' },
  ];
  
  let brand = 'James Sax Corner';
  for (const { pattern, brand: b } of brandPatterns) {
    if (pattern.test(productData.name)) {
      brand = b;
      break;
    }
  }
  
  // Determine category and subcategory
  let category = 'woodwinds';
  let subcategory = 'saxophones';
  const nameLower = productData.name.toLowerCase();
  
  if (/soprano/i.test(nameLower)) {
    subcategory = 'soprano-saxophones';
  } else if (/alto/i.test(nameLower)) {
    subcategory = 'alto-saxophones';
  } else if (/tenor/i.test(nameLower)) {
    subcategory = 'tenor-saxophones';
  } else if (/baritone|bari/i.test(nameLower)) {
    subcategory = 'baritone-saxophones';
  } else if (/pad|spring|screw/i.test(nameLower)) {
    category = 'accessories';
    subcategory = 'parts';
  }
  
  // Clean up description
  let cleanDescription = productData.description
    .replace(/About this listing/gi, '')
    .replace(/Show More/gi, '')
    .replace(/This item is sold As-Described[\s\S]*?Learn More\./gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  return {
    name: productData.name.replace('NO TARIFFS - ', '').trim(),
    slug,
    brand,
    price: productData.price,
    retailPrice: Math.round(productData.price * 1.15),
    description: cleanDescription,
    category,
    subcategory,
    condition: productData.condition,
    images: productData.images.slice(0, 25),
    videoUrl: productData.videoUrl,
    inStock: true,
    stock: 1,
    badge: 'new',
    rating: 5.0,
    reviewCount: 0,
    sku: `JSC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
    sourceUrl: url,
    specs: {
      'Condition': productData.condition,
      'Brand': brand,
      'Category': subcategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    },
    included: ['Original Case', 'Mouthpiece', 'All accessories as pictured']
  };
}

async function generateSeedData(products) {
  const seedPath = path.join(__dirname, '../prisma/seed-reverb.ts');
  
  const seedContent = `// Auto-generated from Reverb scraper - ${new Date().toISOString()}
// Run: npx tsx prisma/seed-reverb.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const reverbProducts = ${JSON.stringify(products, null, 2)};

async function seedReverbProducts() {
  console.log('🌱 Seeding ${products.length} Reverb products...');
  
  // Get or create categories
  let woodwindsCategory = await prisma.category.findFirst({
    where: { slug: 'woodwinds' }
  });
  
  if (!woodwindsCategory) {
    woodwindsCategory = await prisma.category.create({
      data: {
        name: 'Woodwinds',
        slug: 'woodwinds',
        description: 'Professional woodwind instruments'
      }
    });
  }
  
  let accessoriesCategory = await prisma.category.findFirst({
    where: { slug: 'accessories' }
  });
  
  if (!accessoriesCategory) {
    accessoriesCategory = await prisma.category.create({
      data: {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Instrument parts and accessories'
      }
    });
  }
  
  // Delete existing products to avoid duplicates
  console.log('🗑️  Clearing existing products...');
  await prisma.product.deleteMany({});
  
  let created = 0;
  for (const product of reverbProducts) {
    try {
      const categoryId = product.category === 'accessories' 
        ? accessoriesCategory.id 
        : woodwindsCategory.id;
      
      await prisma.product.create({
        data: {
          name: product.name,
          slug: product.slug,
          brand: product.brand,
          price: product.price,
          retailPrice: product.retailPrice,
          description: product.description,
          category: product.category,
          subcategory: product.subcategory,
          images: product.images,
          inStock: product.inStock,
          stock: product.stock || 1,
          badge: product.badge,
          rating: product.rating,
          reviewCount: product.reviewCount,
          sku: product.sku,
          specs: product.specs,
          included: product.included,
          categoryId: categoryId
        }
      });
      created++;
      console.log(\`  ✓ [\${created}] \${product.name.substring(0, 50)}...\`);
    } catch (error: any) {
      console.log(\`  ✗ Error: \${product.name.substring(0, 30)}... - \${error.message}\`);
    }
  }
  
  console.log(\`\\n✅ Created \${created} products!\`);
}

seedReverbProducts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
`;

  fs.writeFileSync(seedPath, seedContent);
  console.log(`\n📝 Generated seed file: ${seedPath}`);
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 500;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight || totalHeight > 10000) {
          clearInterval(timer);
          resolve();
        }
      }, 200);
    });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

scrapeReverbShop();
