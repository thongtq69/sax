// Import 28 products from Reverb - James Sax Corner
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Placeholder images for saxophones (will be replaced with actual images)
const placeholderImages = {
  'tenor': [
    'https://images.unsplash.com/photo-1558098329-a11cff621064?w=800',
    'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800'
  ],
  'alto': [
    'https://images.unsplash.com/photo-1558098329-a11cff621064?w=800',
    'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800'
  ],
  'soprano': [
    'https://images.unsplash.com/photo-1558098329-a11cff621064?w=800'
  ],
  'parts': [
    'https://images.unsplash.com/photo-1558098329-a11cff621064?w=800'
  ]
};

const products = [
  {
    name: "Yamaha YTS-62 Tenor Saxophone",
    slug: "yamaha-yts-62-tenor-saxophone",
    brand: "Yamaha",
    price: 3099,
    shippingCost: 200,
    description: "This is a vintage Yamaha YTS-62 'Purple Logo' Professional Tenor Saxophone in excellent condition.",
    category: "woodwinds",
    subcategory: "tenor-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Vintage Yamaha YAS-62 Alto Saxophone Purple Logo",
    slug: "yamaha-yas-62-alto-saxophone-purple-logo",
    brand: "Yamaha",
    price: 2699,
    shippingCost: 200,
    description: "This is a Yamaha YAS-62 Purple Logo alto saxophone—first generation with the rare 'rope pattern' design.",
    category: "woodwinds",
    subcategory: "alto-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Yanagisawa SC-992 Curved Soprano Saxophone",
    slug: "yanagisawa-sc-992-curved-soprano-saxophone",
    brand: "Yanagisawa",
    price: 4699,
    shippingCost: 200,
    description: "This is a very beautiful Yanagisawa 992 curved soprano saxophone, fully serviced.",
    category: "woodwinds",
    subcategory: "soprano-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Yanagisawa A-WO10 Alto Saxophone",
    slug: "yanagisawa-a-wo10-alto-saxophone",
    brand: "Yanagisawa",
    price: 2699,
    shippingCost: 200,
    description: "This budget-friendly Yanagisawa Alto WO10 is part of the brand's premium professional series.",
    category: "woodwinds",
    subcategory: "alto-saxophones",
    condition: "Used – Very Good"
  },
  {
    name: "Yanagisawa S-6S Silver Soprano Saxophone",
    slug: "yanagisawa-s-6s-silver-soprano-saxophone",
    brand: "Yanagisawa",
    price: 2299,
    shippingCost: 200,
    description: "This Yanagisawa S-6S silver soprano saxophone is a professional-grade instrument.",
    category: "woodwinds",
    subcategory: "soprano-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Yanagisawa S-901 Soprano Saxophone",
    slug: "yanagisawa-s-901-soprano-saxophone",
    brand: "Yanagisawa",
    price: 2899,
    shippingCost: 200,
    description: "The Yanagisawa S-901 is a professional soprano saxophone featuring exceptional build quality.",
    category: "woodwinds",
    subcategory: "soprano-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Yamaha YTS-82Z Tenor Saxophone",
    slug: "yamaha-yts-82z-tenor-saxophone-1",
    brand: "Yamaha",
    price: 3999,
    shippingCost: 200,
    description: "The Yamaha YTS-82Z is a Custom Z series professional tenor saxophone.",
    category: "woodwinds",
    subcategory: "tenor-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Yanagisawa A-901 Alto Saxophone",
    slug: "yanagisawa-a-901-alto-saxophone",
    brand: "Yanagisawa",
    price: 1999,
    shippingCost: 200,
    description: "The Yanagisawa A-901 is a professional alto saxophone offering outstanding value.",
    category: "woodwinds",
    subcategory: "alto-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Yanagisawa A-900u Alto Saxophone",
    slug: "yanagisawa-a-900u-alto-saxophone",
    brand: "Yanagisawa",
    price: 1599,
    shippingCost: 200,
    description: "The Yanagisawa A-900u is a professional unlacquered alto saxophone.",
    category: "woodwinds",
    subcategory: "alto-saxophones",
    condition: "Used – Very Good"
  },
  {
    name: "Selmer SA80 Serie 2 Alto Original Pads Set",
    slug: "selmer-sa80-serie-2-alto-original-pads-set",
    brand: "Selmer",
    price: 399,
    shippingCost: 50,
    description: "Original Selmer pads set for the SA80 Serie II alto saxophone.",
    category: "accessories",
    subcategory: "parts",
    condition: "New"
  },
  {
    name: "Yamaha YAS 875EX Original Pads Set",
    slug: "yamaha-yas-875ex-original-pads-set",
    brand: "Yamaha",
    price: 299,
    shippingCost: 50,
    description: "Original Yamaha pads set for the YAS-875EX Custom EX alto saxophone.",
    category: "accessories",
    subcategory: "parts",
    condition: "New"
  },
  {
    name: "Yamaha YAS 62 Original Pads Set",
    slug: "yamaha-yas-62-original-pads-set",
    brand: "Yamaha",
    price: 199,
    shippingCost: 50,
    description: "Original Yamaha pads set for the YAS-62 alto saxophone.",
    category: "accessories",
    subcategory: "parts",
    condition: "New"
  },
  {
    name: "Yamaha Original Pivot Screw Set",
    slug: "yamaha-original-pivot-screw-set",
    brand: "Yamaha",
    price: 99,
    shippingCost: 30,
    description: "Original Yamaha pivot screw set for saxophone maintenance.",
    category: "accessories",
    subcategory: "parts",
    condition: "New"
  },
  {
    name: "Yamaha YTS 62 Original Spring Set",
    slug: "yamaha-yts-62-original-spring-set",
    brand: "Yamaha",
    price: 79,
    shippingCost: 30,
    description: "Original Yamaha spring set for the YTS-62 tenor saxophone.",
    category: "accessories",
    subcategory: "parts",
    condition: "New"
  },
  {
    name: "Yamaha YTS 62 Original Pads Set",
    slug: "yamaha-yts-62-original-pads-set",
    brand: "Yamaha",
    price: 199,
    shippingCost: 50,
    description: "Original Yamaha pads set for the YTS-62 tenor saxophone.",
    category: "accessories",
    subcategory: "parts",
    condition: "New"
  },
  {
    name: "Yamaha YTS-62II Tenor Saxophone",
    slug: "yamaha-yts-62ii-tenor-saxophone-1",
    brand: "Yamaha",
    price: 3099,
    shippingCost: 200,
    description: "The Yamaha YTS-62II is the second generation of the legendary YTS-62.",
    category: "woodwinds",
    subcategory: "tenor-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Selmer Reference 54 Hummingbird Charlie Parker",
    slug: "selmer-reference-54-hummingbird-charlie-parker",
    brand: "Selmer",
    price: 5999,
    shippingCost: 200,
    description: "The Selmer Reference 54 Hummingbird is a special limited edition alto saxophone.",
    category: "woodwinds",
    subcategory: "alto-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Yamaha YTS-82Z Tenor Saxophone Black",
    slug: "yamaha-yts-82z-tenor-saxophone-black",
    brand: "Yamaha",
    price: 3699,
    shippingCost: 200,
    description: "Yamaha YTS-82Z Custom Z series tenor saxophone in stunning black lacquer finish.",
    category: "woodwinds",
    subcategory: "tenor-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Yamaha YTS-62 Tenor Saxophone Purple Logo Vintage",
    slug: "yamaha-yts-62-tenor-saxophone-purple-logo",
    brand: "Yamaha",
    price: 2799,
    shippingCost: 200,
    description: "Vintage Yamaha YTS-62 'Purple Logo' tenor saxophone in excellent condition.",
    category: "woodwinds",
    subcategory: "tenor-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Selmer Super Action 80 Series II Alto Saxophone",
    slug: "selmer-super-action-80-series-ii-alto-saxophone",
    brand: "Selmer",
    price: 3199,
    shippingCost: 200,
    description: "The Selmer Super Action 80 Series II is one of the most sought-after professional alto saxophones.",
    category: "woodwinds",
    subcategory: "alto-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Yanagisawa A-991 Alto Saxophone",
    slug: "yanagisawa-a-991-alto-saxophone",
    brand: "Yanagisawa",
    price: 2899,
    shippingCost: 200,
    description: "The Yanagisawa A-991 is a professional alto saxophone featuring solid silver neck and bell.",
    category: "woodwinds",
    subcategory: "alto-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Yamaha YAS-62S Silver Alto Saxophone Purple Logo",
    slug: "yamaha-yas-62s-silver-alto-saxophone-purple-logo",
    brand: "Yamaha",
    price: 3599,
    shippingCost: 200,
    description: "Rare Yamaha YAS-62S silver-plated alto saxophone with the vintage 'Purple Logo'.",
    category: "woodwinds",
    subcategory: "alto-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Yanagisawa A-990 Elimona Alto Saxophone",
    slug: "yanagisawa-a-990-elimona-alto-saxophone",
    brand: "Yanagisawa",
    price: 2699,
    shippingCost: 200,
    description: "The Yanagisawa A-990 Elimona is a professional alto saxophone.",
    category: "woodwinds",
    subcategory: "alto-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Yamaha YTS-82ZII V1 Neck Tenor Saxophone",
    slug: "yamaha-yts-82zii-v1-neck-tenor-saxophone",
    brand: "Yamaha",
    price: 4299,
    shippingCost: 200,
    description: "Yamaha YTS-82ZII with the coveted V1 neck.",
    category: "woodwinds",
    subcategory: "tenor-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Yanagisawa A-900 Alto Saxophone",
    slug: "yanagisawa-a-900-alto-saxophone",
    brand: "Yanagisawa",
    price: 1599,
    shippingCost: 200,
    description: "The Yanagisawa A-900 is a professional alto saxophone offering exceptional value.",
    category: "woodwinds",
    subcategory: "alto-saxophones",
    condition: "Used – Very Good"
  },
  {
    name: "Yamaha YTS-62 Tenor Saxophone Purple Logo Early",
    slug: "yamaha-yts-62-tenor-saxophone-purple-logo-early",
    brand: "Yamaha",
    price: 2399,
    shippingCost: 200,
    description: "Early model Yamaha YTS-62 'Purple Logo' tenor saxophone in excellent condition.",
    category: "woodwinds",
    subcategory: "tenor-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Yamaha YTS-62II Tenor Saxophone Late Model",
    slug: "yamaha-yts-62ii-tenor-saxophone-late",
    brand: "Yamaha",
    price: 2799,
    shippingCost: 200,
    description: "Late model Yamaha YTS-62II professional tenor saxophone in excellent condition.",
    category: "woodwinds",
    subcategory: "tenor-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Yanagisawa A-992 Solid Silver Neck Alto Saxophone",
    slug: "yanagisawa-a-992-solid-silver-neck-alto-saxophone",
    brand: "Yanagisawa",
    price: 3200,
    shippingCost: 200,
    description: "The Yanagisawa A-992 features a solid silver neck for enhanced resonance.",
    category: "woodwinds",
    subcategory: "alto-saxophones",
    condition: "Used – Excellent"
  }
];

async function main() {
  console.log('🌱 Seeding 28 products from James Sax Corner Reverb shop...\n');
  
  let woodwindsCategory = await prisma.category.findFirst({ where: { slug: 'woodwinds' } });
  if (!woodwindsCategory) {
    woodwindsCategory = await prisma.category.create({
      data: { name: 'Woodwinds', slug: 'woodwinds', path: '/woodwinds' }
    });
  }
  
  let accessoriesCategory = await prisma.category.findFirst({ where: { slug: 'accessories' } });
  if (!accessoriesCategory) {
    accessoriesCategory = await prisma.category.create({
      data: { name: 'Accessories', slug: 'accessories', path: '/accessories' }
    });
  }
  
  console.log('🗑️  Clearing existing products...');
  await prisma.product.deleteMany({});
  
  console.log('📦 Creating products...\n');
  
  let created = 0;
  for (const p of products) {
    let images: string[] = [];
    if (p.subcategory.includes('tenor')) {
      images = placeholderImages.tenor;
    } else if (p.subcategory.includes('alto')) {
      images = placeholderImages.alto;
    } else if (p.subcategory.includes('soprano')) {
      images = placeholderImages.soprano;
    } else {
      images = placeholderImages.parts;
    }
    
    try {
      const catId = p.category === 'accessories' ? accessoriesCategory.id : woodwindsCategory.id;
      
      await prisma.product.create({
        data: {
          name: p.name,
          slug: p.slug,
          brand: p.brand,
          price: p.price,
          shippingCost: p.shippingCost,
          description: p.description,
          images: images,
          inStock: true,
          stock: 1,
          badge: 'new',
          rating: 5.0,
          reviewCount: 0,
          sku: `JSC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          specs: {
            'Condition': p.condition,
            'Brand': p.brand,
            'Type': p.subcategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            'Ships From': 'Hanoi, Vietnam',
            'Shipping': 'FedEx/DHL/UPS with tracking'
          },
          included: ['Original Case', 'All accessories as pictured'],
          category: { connect: { id: catId } }
        }
      });
      created++;
      console.log(`  ✓ [${created}] ${p.name}`);
    } catch (error: any) {
      console.log(`  ✗ Error: ${p.name} - ${error.message}`);
    }
  }
  
  console.log(`\n✅ Successfully created ${created} products!`);
  console.log('\n📊 Summary:');
  console.log(`   - Saxophones: ${products.filter(p => p.subcategory.includes('saxophone')).length}`);
  console.log(`   - Parts/Accessories: ${products.filter(p => p.subcategory === 'parts').length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
