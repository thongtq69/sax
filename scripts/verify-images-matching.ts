// Verify and fix image matching for all products
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ProductImages {
  reverbUrl: string;
  itemId: string;
  images: string[];
  urlSlug: string;
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
        images: [],
        urlSlug
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

function extractProductInfo(urlSlug: string) {
  const parts = urlSlug.split('-').filter(p => p.length > 0);
  
  // Brands
  const brands = ['yamaha', 'yanagisawa', 'selmer'];
  const brand = brands.find(b => urlSlug.includes(b)) || '';
  
  // Models - various patterns
  const modelPatterns = [
    { pattern: /yts-?(\d+)/i, name: 'YTS' },
    { pattern: /yas-?(\d+)/i, name: 'YAS' },
    { pattern: /a-?(\d+)/i, name: 'A' },
    { pattern: /s-?(\d+)/i, name: 'S' },
    { pattern: /sc-?(\d+)/i, name: 'SC' },
    { pattern: /sa(\d+)/i, name: 'SA' },
  ];
  
  let model = '';
  let modelNumber = '';
  for (const { pattern, name } of modelPatterns) {
    const match = urlSlug.match(pattern);
    if (match) {
      model = name;
      modelNumber = match[1];
      break;
    }
  }
  
  // Types
  const types = ['alto', 'tenor', 'soprano', 'curved'];
  const type = types.find(t => urlSlug.includes(t)) || '';
  
  // Special features
  const features = ['purple-logo', 'silver', 'unlacquered', 'v1-neck', 'hummingbird', 'elimona'];
  const feature = features.find(f => urlSlug.includes(f)) || '';
  
  return { brand, model, modelNumber, type, feature, parts };
}

function findMatchingProduct(item: ProductImages, allProducts: Array<{id: string, name: string, slug: string}>) {
  const info = extractProductInfo(item.urlSlug);
  
  // Method 1: Exact slug match
  let product = allProducts.find(p => p.slug.toLowerCase() === item.urlSlug);
  if (product) return { product, method: 'exact-slug' };
  
  // Method 2: Partial slug match
  product = allProducts.find(p => {
    const pSlug = p.slug.toLowerCase();
    return pSlug.includes(item.urlSlug.substring(0, 30)) ||
           item.urlSlug.includes(pSlug.substring(0, 30));
  });
  if (product) return { product, method: 'partial-slug' };
  
  // Method 3: Brand + Model + Number match
  if (info.brand && info.model && info.modelNumber) {
    product = allProducts.find(p => {
      const nameLower = p.name.toLowerCase();
      const hasBrand = nameLower.includes(info.brand);
      const hasModel = nameLower.includes(`${info.model}-${info.modelNumber}`) ||
                      nameLower.includes(`${info.model}${info.modelNumber}`);
      return hasBrand && hasModel;
    });
    if (product) return { product, method: 'brand-model-number' };
  }
  
  // Method 4: Brand + Model + Type match
  if (info.brand && info.model && info.type) {
    product = allProducts.find(p => {
      const nameLower = p.name.toLowerCase();
      return nameLower.includes(info.brand) &&
             nameLower.includes(info.model) &&
             nameLower.includes(info.type);
    });
    if (product) return { product, method: 'brand-model-type' };
  }
  
  // Method 5: Brand + Model + Feature match
  if (info.brand && info.model && info.feature) {
    product = allProducts.find(p => {
      const nameLower = p.name.toLowerCase();
      const hasBrand = nameLower.includes(info.brand);
      const hasModel = nameLower.includes(info.model);
      const hasFeature = info.feature === 'purple-logo' ? nameLower.includes('purple') :
                        info.feature === 'v1-neck' ? nameLower.includes('v1') :
                        nameLower.includes(info.feature);
      return hasBrand && hasModel && hasFeature;
    });
    if (product) return { product, method: 'brand-model-feature' };
  }
  
  // Method 6: Keyword matching (at least 4 matches)
  const keyWords = info.parts.filter(w => 
    w.length > 2 && 
    !['no', 'tariffs', 'item', 'and', 'the', 'for', 'saxophone'].includes(w.toLowerCase())
  );
  
  product = allProducts.find(p => {
    const nameLower = p.name.toLowerCase();
    const matches = keyWords.filter(keyword => 
      nameLower.includes(keyword.toLowerCase())
    );
    return matches.length >= 4; // Require more matches for accuracy
  });
  
  if (product) return { product, method: 'keywords' };
  
  return { product: null, method: 'none' };
}

async function verifyAndFixMatching() {
  console.log('🔍 Verifying and fixing image matching...\n');
  
  const imageFilePath = path.join(__dirname, '../../reverb_images.txt');
  
  if (!fs.existsSync(imageFilePath)) {
    console.error('❌ File not found: reverb_images.txt');
    return;
  }
  
  const productImages = parseImageFile(imageFilePath);
  console.log(`📦 Parsed ${productImages.length} products from file\n`);
  
  const allProducts = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      images: true
    },
    orderBy: { name: 'asc' }
  });
  
  console.log(`📊 Found ${allProducts.length} products in database\n`);
  console.log('─'.repeat(80));
  
  let updated = 0;
  let notFound = 0;
  let alreadyHasImages = 0;
  const notFoundItems: Array<{url: string, slug: string, info: any}> = [];
  
  for (const item of productImages) {
    const { product, method } = findMatchingProduct(item, allProducts);
    
    if (product) {
      const currentImageCount = product.images?.length || 0;
      const newImageCount = item.images.length;
      
      if (currentImageCount === newImageCount && currentImageCount > 0) {
        // Check if images are the same
        const currentFirst = product.images?.[0] || '';
        const newFirst = item.images[0] || '';
        if (currentFirst === newFirst) {
          alreadyHasImages++;
          console.log(`  ✓ ${product.name.substring(0, 55).padEnd(55)} | Already has ${currentImageCount} images (${method})`);
          continue;
        }
      }
      
      await prisma.product.update({
        where: { id: product.id },
        data: { images: item.images }
      });
      
      updated++;
      console.log(`  ✓ ${product.name.substring(0, 55).padEnd(55)} | Updated: ${currentImageCount} → ${newImageCount} images (${method})`);
    } else {
      notFound++;
      const info = extractProductInfo(item.urlSlug);
      notFoundItems.push({
        url: item.reverbUrl,
        slug: item.urlSlug,
        info
      });
      console.log(`  ✗ ${item.urlSlug.substring(0, 55).padEnd(55)} | NOT FOUND`);
      console.log(`    Info: brand=${info.brand}, model=${info.model}${info.modelNumber}, type=${info.type}, feature=${info.feature}`);
    }
  }
  
  console.log('─'.repeat(80));
  console.log(`\n📊 Summary:`);
  console.log(`   Total products in file: ${productImages.length}`);
  console.log(`   Successfully matched & updated: ${updated}`);
  console.log(`   Already had correct images: ${alreadyHasImages}`);
  console.log(`   Not found: ${notFound}`);
  
  if (notFound > 0) {
    console.log(`\n⚠️  Products from file that couldn't be matched:`);
    notFoundItems.forEach((item, idx) => {
      console.log(`\n   ${idx + 1}. ${item.url.split('/').pop()}`);
      console.log(`      Slug: ${item.slug}`);
      console.log(`      Info: ${JSON.stringify(item.info, null, 6)}`);
      
      // Try to find similar products
      const similar = allProducts.filter(p => {
        const nameLower = p.name.toLowerCase();
        return item.info.brand && nameLower.includes(item.info.brand) ||
               item.info.model && nameLower.includes(item.info.model);
      });
      
      if (similar.length > 0) {
        console.log(`      Similar products in DB:`);
        similar.slice(0, 3).forEach(p => {
          console.log(`        - ${p.name} (${p.slug})`);
        });
      }
    });
  }
  
  // Check products in DB without images
  const productsWithoutImages = allProducts.filter(p => !p.images || p.images.length === 0);
  if (productsWithoutImages.length > 0) {
    console.log(`\n⚠️  Products in database without images (${productsWithoutImages.length}):`);
    productsWithoutImages.forEach(p => {
      console.log(`   - ${p.name} (${p.slug})`);
    });
  }
}

verifyAndFixMatching()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

