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
    retailPrice: 3564,
    description: "This is a vintage Yamaha YTS-62 'Purple Logo' Professional Tenor Saxophone in excellent condition, complete with its original case. As Yamaha's top model at the time, it features modern keywork and outstanding craftsmanship. This early serial version retains the original silk-screened logo and shows minimal cosmetic wear. The pads, keys, and all mechanical aspects are in excellent condition, with recent maintenance—pads care, key regulation, balance check, and oiling - performed by a professional technician, ensuring the horn is fully ready to play.",
    category: "woodwinds",
    subcategory: "tenor-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Vintage Yamaha YAS-62 Alto Saxophone Purple Logo",
    slug: "yamaha-yas-62-alto-saxophone-purple-logo",
    brand: "Yamaha",
    price: 2699,
    retailPrice: 3104,
    description: "This is a Yamaha YAS-62 Purple Logo alto saxophone—first generation with the rare 'rope pattern' design—in phenomenal condition, complete with its original case. Exceptionally well-preserved, this early model is nearly impossible to find in such pristine shape. It has been meticulously maintained by a world-class technician, with all new pads, keywork, oiling, and balance fully serviced for immediate play.",
    category: "woodwinds",
    subcategory: "alto-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Yanagisawa SC-992 Curved Soprano Saxophone",
    slug: "yanagisawa-sc-992-curved-soprano-saxophone",
    brand: "Yanagisawa",
    price: 4699,
    retailPrice: 5404,
    description: "This is a very beautiful Yanagisawa 992 curved soprano saxophone, fully serviced and carefully maintained by a professional. The solid bronze body offers a warm, rich sound with great projection and smooth response throughout all registers. It's rare to find one in this kind of condition — clean, responsive, and ready for immediate performance. Perfect for players who appreciate the unique curved design and Yanagisawa's signature craftsmanship.",
    category: "woodwinds",
    subcategory: "soprano-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Yanagisawa A-WO10 Alto Saxophone",
    slug: "yanagisawa-a-wo10-alto-saxophone",
    brand: "Yanagisawa",
    price: 2699,
    retailPrice: 3104,
    description: "This budget-friendly Yanagisawa Alto WO10 is part of the brand's premium professional series, offering solid brass construction, flawless Japanese craftsmanship, and a bright, focused tone with smooth, responsive action. Fully serviced with pad care, key adjustments, and oiling, it's in perfect playing condition and ready for immediate use.",
    category: "woodwinds",
    subcategory: "alto-saxophones",
    condition: "Used – Very Good"
  },
  {
    name: "Yanagisawa S-6S Silver Soprano Saxophone",
    slug: "yanagisawa-s-6s-silver-soprano-saxophone",
    brand: "Yanagisawa",
    price: 2299,
    retailPrice: 2644,
    description: "This Yanagisawa S-6S silver soprano saxophone is a professional-grade instrument known for its exceptional craftsmanship and beautiful silver finish. Fully serviced and ready to play with excellent intonation throughout all registers.",
    category: "woodwinds",
    subcategory: "soprano-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Yanagisawa S-901 Soprano Saxophone",
    slug: "yanagisawa-s-901-soprano-saxophone",
    brand: "Yanagisawa",
    price: 2899,
    retailPrice: 3334,
    description: "The Yanagisawa S-901 is a professional soprano saxophone featuring exceptional build quality and the signature Yanagisawa tone. This instrument has been fully serviced and is in excellent playing condition.",
    category: "woodwinds",
    subcategory: "soprano-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Yamaha YTS-82Z Tenor Saxophone",
    slug: "yamaha-yts-82z-tenor-saxophone-1",
    brand: "Yamaha",
    price: 3999,
    retailPrice: 4599,
    description: "The Yamaha YTS-82Z is a Custom Z series professional tenor saxophone designed for jazz and contemporary players. Features a one-piece bell, hand-engraved design, and the signature warm, flexible tone that Z series is known for. Fully serviced and ready to perform.",
    category: "woodwinds",
    subcategory: "tenor-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Yanagisawa A-901 Alto Saxophone",
    slug: "yanagisawa-a-901-alto-saxophone",
    brand: "Yanagisawa",
    price: 1999,
    retailPrice: 2299,
    description: "The Yanagisawa A-901 is a professional alto saxophone offering outstanding value. Known for excellent intonation, build quality, and the warm Yanagisawa tone. This instrument has been professionally serviced and is ready for performance.",
    category: "woodwinds",
    subcategory: "alto-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Yanagisawa A-900u Alto Saxophone",
    slug: "yanagisawa-a-900u-alto-saxophone",
    brand: "Yanagisawa",
    price: 1599,
    retailPrice: 1839,
    description: "The Yanagisawa A-900u is a professional unlacquered alto saxophone offering a raw, warm tone. The unlacquered brass finish allows for greater resonance and a more vintage sound character. Fully serviced and ready to play.",
    category: "woodwinds",
    subcategory: "alto-saxophones",
    condition: "Used – Very Good"
  },
  {
    name: "Selmer SA80 Serie 2 Alto Original Pads Set",
    slug: "selmer-sa80-serie-2-alto-original-pads-set",
    brand: "Selmer",
    price: 399,
    retailPrice: 459,
    description: "Original Selmer pads set for the SA80 Serie II alto saxophone. Complete set in excellent condition, perfect for restoring your Selmer to original specifications.",
    category: "accessories",
    subcategory: "parts",
    condition: "New"
  },
  {
    name: "Yamaha YAS 875EX Original Pads Set",
    slug: "yamaha-yas-875ex-original-pads-set",
    brand: "Yamaha",
    price: 299,
    retailPrice: 344,
    description: "Original Yamaha pads set for the YAS-875EX Custom EX alto saxophone. Complete set for full repad, maintaining the original Yamaha quality and response.",
    category: "accessories",
    subcategory: "parts",
    condition: "New"
  },
  {
    name: "Yamaha YAS 62 Original Pads Set",
    slug: "yamaha-yas-62-original-pads-set",
    brand: "Yamaha",
    price: 199,
    retailPrice: 229,
    description: "Original Yamaha pads set for the YAS-62 alto saxophone. Complete set in excellent condition for maintaining your instrument's original playability.",
    category: "accessories",
    subcategory: "parts",
    condition: "New"
  },
  {
    name: "Yamaha Original Pivot Screw Set",
    slug: "yamaha-original-pivot-screw-set",
    brand: "Yamaha",
    price: 99,
    retailPrice: 114,
    description: "Original Yamaha pivot screw set for saxophone maintenance. High-quality replacement parts to keep your Yamaha saxophone in optimal condition.",
    category: "accessories",
    subcategory: "parts",
    condition: "New"
  },
  {
    name: "Yamaha YTS 62 Original Spring Set",
    slug: "yamaha-yts-62-original-spring-set",
    brand: "Yamaha",
    price: 79,
    retailPrice: 91,
    description: "Original Yamaha spring set for the YTS-62 tenor saxophone. Complete set for full spring replacement, restoring original key action and response.",
    category: "accessories",
    subcategory: "parts",
    condition: "New"
  },
  {
    name: "Yamaha YTS 62 Original Pads Set",
    slug: "yamaha-yts-62-original-pads-set",
    brand: "Yamaha",
    price: 199,
    retailPrice: 229,
    description: "Original Yamaha pads set for the YTS-62 tenor saxophone. Complete set for full repad, perfect for maintaining your instrument's original character.",
    category: "accessories",
    subcategory: "parts",
    condition: "New"
  },
  {
    name: "Yamaha YTS-62II Tenor Saxophone",
    slug: "yamaha-yts-62ii-tenor-saxophone-1",
    brand: "Yamaha",
    price: 3099,
    retailPrice: 3564,
    description: "The Yamaha YTS-62II is the second generation of the legendary YTS-62 professional tenor saxophone. Features improved ergonomics, refined key work, and the same outstanding tone that made the original famous. Fully serviced and ready to perform.",
    category: "woodwinds",
    subcategory: "tenor-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Selmer Reference 54 Hummingbird Charlie Parker",
    slug: "selmer-reference-54-hummingbird-charlie-parker",
    brand: "Selmer",
    price: 5999,
    retailPrice: 6899,
    description: "The Selmer Reference 54 Hummingbird is a special limited edition alto saxophone honoring Charlie Parker. Features the classic Reference 54 design with special engraving and finish. An exceptional instrument for serious collectors and performers.",
    category: "woodwinds",
    subcategory: "alto-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Yamaha YTS-82Z Tenor Saxophone Black",
    slug: "yamaha-yts-82z-tenor-saxophone-black",
    brand: "Yamaha",
    price: 3699,
    retailPrice: 4254,
    description: "Yamaha YTS-82Z Custom Z series tenor saxophone in stunning black lacquer finish. This professional instrument offers the characteristic warm, flexible Z series tone with unique visual appeal. Fully serviced.",
    category: "woodwinds",
    subcategory: "tenor-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Yamaha YTS-62 Tenor Saxophone Purple Logo Vintage",
    slug: "yamaha-yts-62-tenor-saxophone-purple-logo",
    brand: "Yamaha",
    price: 2799,
    retailPrice: 3219,
    description: "Vintage Yamaha YTS-62 'Purple Logo' tenor saxophone in excellent condition. This early model features the original silk-screened logo and classic Yamaha tone. Fully serviced with new pads and ready to play.",
    category: "woodwinds",
    subcategory: "tenor-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Selmer Super Action 80 Series II Alto Saxophone",
    slug: "selmer-super-action-80-series-ii-alto-saxophone",
    brand: "Selmer",
    price: 3199,
    retailPrice: 3679,
    description: "The Selmer Super Action 80 Series II is one of the most sought-after professional alto saxophones. Known for its rich, warm tone and excellent projection. This instrument has been fully serviced and is in excellent playing condition.",
    category: "woodwinds",
    subcategory: "alto-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Yanagisawa A-991 Alto Saxophone",
    slug: "yanagisawa-a-991-alto-saxophone",
    brand: "Yanagisawa",
    price: 2899,
    retailPrice: 3334,
    description: "The Yanagisawa A-991 is a professional alto saxophone featuring solid silver neck and bell. This combination provides exceptional resonance and a rich, complex tone. Fully serviced and ready for performance.",
    category: "woodwinds",
    subcategory: "alto-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Yamaha YAS-62S Silver Alto Saxophone Purple Logo",
    slug: "yamaha-yas-62s-silver-alto-saxophone-purple-logo",
    brand: "Yamaha",
    price: 3599,
    retailPrice: 4139,
    description: "Rare Yamaha YAS-62S silver-plated alto saxophone with the vintage 'Purple Logo'. This stunning instrument combines the classic YAS-62 design with beautiful silver finish. Fully serviced and in excellent condition.",
    category: "woodwinds",
    subcategory: "alto-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Yanagisawa A-990 Elimona Alto Saxophone",
    slug: "yanagisawa-a-990-elimona-alto-saxophone",
    brand: "Yanagisawa",
    price: 2699,
    retailPrice: 3104,
    description: "The Yanagisawa A-990 Elimona is a professional alto saxophone known for its exceptional build quality and warm, centered tone. The Elimona designation indicates premium components and craftsmanship. Fully serviced.",
    category: "woodwinds",
    subcategory: "alto-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Yamaha YTS-82ZII V1 Neck Tenor Saxophone",
    slug: "yamaha-yts-82zii-v1-neck-tenor-saxophone",
    brand: "Yamaha",
    price: 4299,
    retailPrice: 4944,
    description: "Yamaha YTS-82ZII with the coveted V1 neck, providing enhanced projection and flexibility. This Custom Z series professional tenor saxophone is ideal for jazz and contemporary music. Fully serviced and ready to perform.",
    category: "woodwinds",
    subcategory: "tenor-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Yanagisawa A-900 Alto Saxophone",
    slug: "yanagisawa-a-900-alto-saxophone",
    brand: "Yanagisawa",
    price: 1599,
    retailPrice: 1839,
    description: "The Yanagisawa A-900 is a professional alto saxophone offering exceptional value. Known for excellent intonation, build quality, and the signature warm Yanagisawa tone. Fully serviced and ready to play.",
    category: "woodwinds",
    subcategory: "alto-saxophones",
    condition: "Used – Very Good"
  },
  {
    name: "Yamaha YTS-62 Tenor Saxophone Purple Logo Early",
    slug: "yamaha-yts-62-tenor-saxophone-purple-logo-early",
    brand: "Yamaha",
    price: 2399,
    retailPrice: 2759,
    description: "Early model Yamaha YTS-62 'Purple Logo' tenor saxophone in excellent condition. This vintage professional horn features the sought-after early design and original character. Fully serviced with excellent pads.",
    category: "woodwinds",
    subcategory: "tenor-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Yamaha YTS-62II Tenor Saxophone Late Model",
    slug: "yamaha-yts-62ii-tenor-saxophone-late",
    brand: "Yamaha",
    price: 2799,
    retailPrice: 3219,
    description: "Late model Yamaha YTS-62II professional tenor saxophone in excellent condition. Features refined ergonomics and the legendary YTS-62 tone. Fully serviced and ready to perform.",
    category: "woodwinds",
    subcategory: "tenor-saxophones",
    condition: "Used – Excellent"
  },
  {
    name: "Yanagisawa A-992 Solid Silver Neck Alto Saxophone",
    slug: "yanagisawa-a-992-solid-silver-neck-alto-saxophone",
    brand: "Yanagisawa",
    price: 3200,
    retailPrice: 3680,
    description: "The Yanagisawa A-992 features a solid silver neck for enhanced resonance and a rich, complex tone. This professional alto saxophone represents the pinnacle of Yanagisawa craftsmanship. Fully serviced and in excellent condition.",
    category: "woodwinds",
    subcategory: "alto-saxophones",
    condition: "Used – Excellent"
  }
];

async function main() {
  console.log('🌱 Seeding 28 products from James Sax Corner Reverb shop...\n');
  
  // Get or create category
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
  
  // Clear existing products
  console.log('🗑️  Clearing existing products...');
  await prisma.product.deleteMany({});
  
  console.log('📦 Creating products...\n');
  
  let created = 0;
  for (const p of products) {
    // Determine images based on subcategory
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
          retailPrice: p.retailPrice,
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
