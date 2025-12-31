/**
 * Reverb Scraper - With Image Capture via Network
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SHOP_URL = 'https://reverb.com/shop/jamessaxcorner';

async function scrapeReverbShop() {
  console.log('🎷 Reverb Scraper with Network Image Capture\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });
  
  try {
    const shopPage = await browser.newPage();
    await shopPage.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    
    console.log('📂 Loading shop...');
    await shopPage.goto(SHOP_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Scroll to load all
    for (let i = 0; i < 15; i++) {
      await shopPage.evaluate(() => window.scrollBy(0, 500));
      await sleep(300);
    }
    
    const productLinks = await shopPage.evaluate(() => {
      const links = [];
      document.querySelectorAll('a[href*="/item/"]').forEach(a => {
        const href = a.href || a.getAttribute('href');
        if (href && href.includes('/item/') && !links.includes(href)) {
          links.push(href.startsWith('http') ? href : `https://reverb.com${href}`);
        }
      });
      return links;
    });
    
    await shopPage.close();
    console.log(`✅ Found ${productLinks.length} products\n`);
    
    const products = [];
    
    for (let i = 0; i < productLinks.length; i++) {
      const url = productLinks[i];
      const shortName = url.split('/').pop().substring(0, 45);
      process.stdout.write(`[${i+1}/${productLinks.length}] ${shortName}... `);
      
      try {
        const product = await scrapeProductWithImages(browser, url);
        products.push(product);
        console.log(`✓ ${product.images.length} imgs, $${product.price}`);
      } catch (e) {
        console.log(`✗ ${e.message}`);
      }
      
      await sleep(1000);
    }
    
    // Save
    const outPath = path.join(__dirname, '../data/reverb-products.json');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(products, null, 2));
    
    console.log(`\n🎉 Done! ${products.length} products saved`);
    
    // Generate seed
    generateSeed(products);
    
  } finally {
    await browser.close();
  }
}

async function scrapeProductWithImages(browser, url) {
  const page = await browser.newPage();
  const capturedImages = new Set();
  
  // Intercept network to capture images
  await page.setRequestInterception(true);
  
  page.on('request', req => {
    req.continue();
  });
  
  page.on('response', async res => {
    const resUrl = res.url();
    if (resUrl.includes('images.reverb.com') && 
        (resUrl.includes('.jpg') || resUrl.includes('.png') || resUrl.includes('.webp'))) {
      // Convert to large size
      let large = resUrl
        .replace(/\/s_\w+\//, '/s_large/')
        .replace(/w_\d+,h_\d+/, 'w_1200,h_1200')
        .replace(/c_thumb/, 'c_limit')
        .split('?')[0];
      
      if (!large.includes('avatar') && !large.includes('logo')) {
        capturedImages.add(large);
      }
    }
  });
  
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  
  // Scroll and interact to trigger image loading
  await sleep(1500);
  
  // Click on thumbnails to load all images
  const thumbs = await page.$$('.gallery-thumbnail, [class*="thumbnail"], [class*="Thumbnail"]');
  for (let i = 0; i < Math.min(thumbs.length, 20); i++) {
    try {
      await thumbs[i].click();
      await sleep(400);
    } catch (e) {}
  }
  
  // Scroll through page
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => window.scrollBy(0, 400));
    await sleep(300);
  }
  
  await sleep(1000);
  
  // Extract page data
  const data = await page.evaluate(() => {
    // Name
    const h1 = document.querySelector('h1');
    const name = h1 ? h1.textContent.trim() : 'Unknown';
    
    // Price
    let price = 0;
    const priceMatch = document.body.innerText.match(/\$([0-9,]+)/);
    if (priceMatch) price = parseFloat(priceMatch[1].replace(',', ''));
    
    // Description
    let desc = '';
    const descEl = document.querySelector('[class*="description"], .listing-description, [class*="Description"]');
    if (descEl) desc = descEl.innerText;
    
    // Condition
    let condition = 'Excellent';
    document.querySelectorAll('*').forEach(el => {
      if (el.textContent.includes('Condition') && el.textContent.length < 100) {
        const match = el.textContent.match(/Condition[:\s]*([\w\s–-]+)/i);
        if (match) condition = match[1].trim();
      }
    });
    
    // Also try to get images from page
    const pageImages = [];
    document.querySelectorAll('img[src*="reverb"], [style*="reverb"]').forEach(el => {
      const src = el.src || el.style.backgroundImage?.match(/url\(['"]?([^'"]+)['"]?\)/)?.[1];
      if (src && src.includes('images.reverb.com') && !pageImages.includes(src)) {
        pageImages.push(src.split('?')[0]);
      }
    });
    
    return { name, price, desc, condition, pageImages };
  });
  
  await page.close();
  
  // Combine images from network and page
  data.pageImages.forEach(img => {
    let large = img.replace(/\/s_\w+\//, '/s_large/');
    if (!large.includes('avatar')) capturedImages.add(large);
  });
  
  // Build product object
  const slug = url.split('/').pop()
    .replace(/^\d+-/, '')
    .replace(/[^a-z0-9-]/gi, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
    .slice(0, 80);
  
  const brands = ['Yanagisawa', 'Yamaha', 'Selmer', 'Buffet', 'Jupiter', 'Conn', 'King', 'Keilwerth'];
  let brand = 'James Sax Corner';
  for (const b of brands) {
    if (data.name.toLowerCase().includes(b.toLowerCase())) { brand = b; break; }
  }
  
  let subcategory = 'saxophones';
  const nl = data.name.toLowerCase();
  if (nl.includes('soprano')) subcategory = 'soprano-saxophones';
  else if (nl.includes('alto')) subcategory = 'alto-saxophones';
  else if (nl.includes('tenor')) subcategory = 'tenor-saxophones';
  else if (nl.includes('baritone')) subcategory = 'baritone-saxophones';
  else if (nl.includes('pad') || nl.includes('spring') || nl.includes('screw')) subcategory = 'parts';
  
  const cleanDesc = data.desc
    .replace(/About this listing/gi, '')
    .replace(/Show More.*$/gi, '')
    .replace(/This item is sold As-Described.*$/gis, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  return {
    name: data.name.replace(/^NO TARIFFS\s*-\s*/i, '').trim(),
    slug,
    brand,
    price: data.price,
    retailPrice: Math.round(data.price * 1.15),
    description: cleanDesc,
    category: subcategory === 'parts' ? 'accessories' : 'woodwinds',
    subcategory,
    condition: data.condition,
    images: Array.from(capturedImages).slice(0, 25),
    inStock: true,
    stock: 1,
    badge: 'new',
    rating: 5.0,
    reviewCount: 0,
    sku: `JSC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    sourceUrl: url,
    specs: { 'Condition': data.condition, 'Brand': brand },
    included: ['Original Case', 'All accessories as pictured']
  };
}

function generateSeed(products) {
  const content = `import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const products = ${JSON.stringify(products, null, 2)};

async function main() {
  console.log('Seeding ${products.length} products...');
  
  let cat = await prisma.category.findFirst({ where: { slug: 'woodwinds' } });
  if (!cat) cat = await prisma.category.create({ data: { name: 'Woodwinds', slug: 'woodwinds', path: '/woodwinds' } });
  
  await prisma.product.deleteMany({});
  
  for (const p of products) {
    await prisma.product.create({
      data: { ...p, categoryId: cat.id }
    });
    console.log('✓', p.name.slice(0, 50));
  }
  console.log('\\nDone!');
}

main().finally(() => prisma.$disconnect());
`;
  
  fs.writeFileSync(path.join(__dirname, '../prisma/seed-reverb.ts'), content);
  console.log('📝 Seed file generated');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

scrapeReverbShop();
