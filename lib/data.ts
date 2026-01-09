export interface Product {
  id: string
  name: string
  slug: string
  brand: string
  price: number
  shippingCost?: number
  category: string
  subcategory?: string
  images: string[]
  videoUrl?: string
  badge?: 'new' | 'sale' | 'limited' | 'coming-soon' | 'out-of-stock'
  inStock: boolean
  stock?: number
  stockStatus?: 'in-stock' | 'sold-out' | 'pre-order'
  description: string
  specs?: Record<string, string>
  included?: string[]
  warranty?: string
  sku: string
  rating?: number
  reviewCount?: number
  productType?: 'new' | 'used'
  condition?: 'mint' | 'excellent' | 'very-good' | 'good' | 'fair'
  conditionNotes?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  path: string
  subcategories?: SubCategory[]
}

export interface SubCategory {
  id: string
  name: string
  slug: string
  path: string
}

export interface PromoBanner {
  id: string
  title: string
  description: string
  image: string
  ctaText: string
  ctaLink: string
}

export interface FeaturedCollection {
  id: string
  name: string
  slug: string
  productIds: string[]
}

// Categories
export const categories: Category[] = [
  {
    id: 'woodwinds',
    name: 'Woodwinds',
    slug: 'woodwinds',
    path: '/shop/woodwinds',
    subcategories: [
      { id: 'flutes', name: 'Flutes', slug: 'flutes', path: '/shop/woodwinds/flutes' },
      { id: 'piccolos', name: 'Piccolos', slug: 'piccolos', path: '/shop/woodwinds/piccolos' },
      { id: 'clarinets', name: 'Clarinets', slug: 'clarinets', path: '/shop/woodwinds/clarinets' },
      { id: 'saxophones', name: 'Saxophones', slug: 'saxophones', path: '/shop/woodwinds/saxophones' },
      { id: 'mouthpieces-ligs', name: 'Mouthpieces & Ligatures', slug: 'mouthpieces-ligs', path: '/shop/woodwinds/mouthpieces-ligs' },
      { id: 'accessories', name: 'Accessories', slug: 'accessories', path: '/shop/woodwinds/accessories' },
    ],
  },
  {
    id: 'brasswinds',
    name: 'Brasswinds',
    slug: 'brasswinds',
    path: '/shop/brasswinds',
    subcategories: [
      { id: 'trumpets', name: 'Trumpets', slug: 'trumpets', path: '/shop/brasswinds/trumpets' },
      { id: 'french-horns', name: 'French Horns', slug: 'french-horns', path: '/shop/brasswinds/french-horns' },
      { id: 'trombones', name: 'Trombones', slug: 'trombones', path: '/shop/brasswinds/trombones' },
      { id: 'euphoniums', name: 'Euphoniums', slug: 'euphoniums', path: '/shop/brasswinds/euphoniums' },
      { id: 'tubas', name: 'Tubas', slug: 'tubas', path: '/shop/brasswinds/tubas' },
    ],
  },
]

// Real Products with actual images
export const products: Product[] = [
  // Flutes
  {
    id: '1',
    name: 'Altus Model 1607SRBEO-D-4 Flute',
    slug: 'altus-1607srbeo-d-4-flute',
    brand: 'Altus',
    price: 11999,
    shippingCost: 200,
    category: 'woodwinds',
    subcategory: 'flutes',
    images: [
      '/images/products/altus-1607-main.jpg',
      '/images/products/altus-1607-hover.jpg',
    ],
    badge: 'new',
    inStock: true,
    stock: 1,
    description: 'The Altus 1607 represents the pinnacle of professional flute craftsmanship. Features sterling silver body, 14K gold riser, and hand-cut headjoint for exceptional tonal richness.',
    specs: {
      'Material': 'Sterling Silver Body',
      'Keys': 'Sterling Silver',
      'Headjoint': '14K Gold Riser',
      'Mechanism': 'Open Hole, B Foot',
      'Finish': 'Silver Plated',
    },
    sku: 'ALT-1607-D4',
    rating: 5.0,
    reviewCount: 12,
  },
  {
    id: '2',
    name: 'Haynes AP86W Amadeus Piccolo A10751',
    slug: 'haynes-ap86w-amadeus-piccolo-a10751',
    brand: 'Haynes',
    price: 2399,
    shippingCost: 200,
    category: 'woodwinds',
    subcategory: 'piccolos',
    images: [
      '/images/products/haynes-piccolo-a10751-main.jpg',
      '/images/products/haynes-piccolo-a10751-hover.jpg',
    ],
    inStock: true,
    stock: 2,
    description: 'The Haynes Amadeus Piccolo offers professional-level performance with a warm, centered tone. Perfect for orchestral and solo work.',
    specs: {
      'Material': 'Grenadilla Wood',
      'Keys': 'Silver Plated',
      'Headjoint': 'Wood',
      'Mechanism': 'Split E',
    },
    sku: 'HAY-AP86W-A10751',
    rating: 4.8,
    reviewCount: 8,
  },
  {
    id: '3',
    name: 'Haynes AP86W Amadeus Piccolo A10971',
    slug: 'haynes-ap86w-amadeus-piccolo-a10971',
    brand: 'Haynes',
    price: 2399,
    shippingCost: 200,
    category: 'woodwinds',
    subcategory: 'piccolos',
    images: [
      '/images/products/haynes-piccolo-a10971-main.jpg',
      '/images/products/haynes-piccolo-a10971-hover.jpg',
    ],
    inStock: true,
    stock: 1,
    description: 'Another exceptional Haynes Amadeus Piccolo with unique serial number. Features the signature Haynes tone and response.',
    specs: {
      'Material': 'Grenadilla Wood',
      'Keys': 'Silver Plated',
      'Headjoint': 'Wood',
      'Mechanism': 'Split E',
    },
    sku: 'HAY-AP86W-A10971',
    rating: 4.9,
    reviewCount: 5,
  },
  {
    id: '4',
    name: 'Altus Model 1507SRBEO-D-4 Flute SN 8163',
    slug: 'altus-1507srbeo-d-4-flute-8163',
    brand: 'Altus',
    price: 9999,
    shippingCost: 200,
    category: 'woodwinds',
    subcategory: 'flutes',
    images: [
      '/images/products/altus-1507-8163-main.jpg',
      '/images/products/altus-1507-8163-hover.jpg',
    ],
    badge: 'sale',
    inStock: true,
    stock: 1,
    description: 'Professional-level Altus flute with sterling silver body and headjoint. Open hole, B foot configuration for advanced players.',
    specs: {
      'Material': 'Sterling Silver',
      'Keys': 'Sterling Silver',
      'Headjoint': 'Sterling Silver',
      'Mechanism': 'Open Hole, B Foot',
      'Serial Number': '8163',
    },
    sku: 'ALT-1507-8163',
    rating: 4.9,
    reviewCount: 15,
  },
  {
    id: '5',
    name: 'Altus Model 1507SRBEO-CD-4 Flute SN 13428',
    slug: 'altus-1507srbeo-cd-4-flute-13428',
    brand: 'Altus',
    price: 9999,
    shippingCost: 200,
    category: 'woodwinds',
    subcategory: 'flutes',
    images: [
      '/images/products/altus-1507-13428-main.jpg',
      '/images/products/altus-1507-13428-hover.jpg',
    ],
    inStock: true,
    stock: 1,
    description: 'Altus 1507 with C# trill key option. Sterling silver construction with exceptional projection and tonal color.',
    specs: {
      'Material': 'Sterling Silver',
      'Keys': 'Sterling Silver',
      'Headjoint': 'Sterling Silver with C# Trill',
      'Mechanism': 'Open Hole, B Foot',
      'Serial Number': '13428',
    },
    sku: 'ALT-1507-13428',
    rating: 5.0,
    reviewCount: 9,
  },
  {
    id: '6',
    name: 'Altus Model 1507SRBO-CD-4 Flute SN 13974',
    slug: 'altus-1507srbo-cd-4-flute-13974',
    brand: 'Altus',
    price: 9999,
    shippingCost: 200,
    category: 'woodwinds',
    subcategory: 'flutes',
    images: [
      '/images/products/altus-1507-13974-main.jpg',
      '/images/products/altus-1507-13974-hover.jpg',
    ],
    inStock: true,
    stock: 1,
    description: 'Professional Altus flute with offset G and C# trill. Perfect for orchestral performance.',
    specs: {
      'Material': 'Sterling Silver',
      'Keys': 'Sterling Silver, Offset G',
      'Mechanism': 'Open Hole, C Foot',
      'Serial Number': '13974',
    },
    sku: 'ALT-1507-13974',
    rating: 4.8,
    reviewCount: 7,
  },
  {
    id: '7',
    name: 'Altus Model 1607SRBEO-CD Flute SN 12299',
    slug: 'altus-1607srbeo-cd-flute-12299',
    brand: 'Altus',
    price: 11999,
    shippingCost: 200,
    category: 'woodwinds',
    subcategory: 'flutes',
    images: [
      '/images/products/altus-1607-12299-main.jpg',
      '/images/products/altus-1607-12299-hover.jpg',
    ],
    badge: 'limited',
    inStock: true,
    stock: 1,
    description: 'Premium Altus 1607 with 14K gold riser and C# trill. Exceptional tonal depth and projection.',
    specs: {
      'Material': 'Sterling Silver Body',
      'Headjoint': '14K Gold Riser',
      'Keys': 'Sterling Silver with C# Trill',
      'Serial Number': '12299',
    },
    sku: 'ALT-1607-12299',
    rating: 5.0,
    reviewCount: 4,
  },
  {
    id: '8',
    name: 'Altus Model 1207SRBEO-CD-PT Platinum Flute',
    slug: 'altus-1207srbeo-cd-pt-platinum-flute',
    brand: 'Altus',
    price: 9999,
    shippingCost: 200,
    category: 'woodwinds',
    subcategory: 'flutes',
    images: [
      '/images/products/altus-1207-platinum-main.jpg',
      '/images/products/altus-1207-platinum-hover.jpg',
    ],
    badge: 'new',
    inStock: true,
    stock: 1,
    description: 'Unique Altus 1207 with platinum riser for added brilliance and projection. A rare find for discerning flutists.',
    specs: {
      'Material': 'Sterling Silver Body',
      'Headjoint': 'Platinum Riser',
      'Keys': 'Sterling Silver with C# Trill',
      'Mechanism': 'Open Hole, B Foot',
    },
    sku: 'ALT-1207-PT',
    rating: 5.0,
    reviewCount: 3,
  },
  {
    id: '9',
    name: 'Altus Model 5207SRBO-CD 14K Gold Flute',
    slug: 'altus-5207srbo-cd-14k-gold-flute',
    brand: 'Altus',
    price: 26999,
    shippingCost: 200,
    category: 'woodwinds',
    subcategory: 'flutes',
    images: [
      '/images/products/altus-5207-gold-main.jpg',
      '/images/products/altus-5207-gold-hover.jpg',
    ],
    badge: 'limited',
    inStock: true,
    stock: 1,
    description: 'Exquisite 14K gold Altus flute representing the ultimate in craftsmanship. Unparalleled warmth and tonal complexity.',
    specs: {
      'Material': '14K Gold Body',
      'Keys': '14K Gold',
      'Headjoint': '14K Gold',
      'Mechanism': 'Open Hole, C Foot with C# Trill',
    },
    sku: 'ALT-5207-GOLD',
    rating: 5.0,
    reviewCount: 2,
  },
  {
    id: '10',
    name: 'Altus Model 1207SRBO-D Flute with 14K Riser',
    slug: 'altus-1207srbo-d-flute-14k-riser',
    brand: 'Altus',
    price: 6999,
    shippingCost: 200,
    category: 'woodwinds',
    subcategory: 'flutes',
    images: [
      '/images/products/altus-1207-14k-main.jpg',
      '/images/products/altus-1207-14k-hover.jpg',
    ],
    inStock: true,
    stock: 2,
    description: 'Step-up Altus flute with 14K gold riser for enhanced tone. Perfect for advancing students and semi-professionals.',
    specs: {
      'Material': 'Sterling Silver Body',
      'Headjoint': '14K Gold Riser',
      'Keys': 'Sterling Silver',
      'Mechanism': 'Open Hole, B Foot',
    },
    sku: 'ALT-1207-14K',
    rating: 4.7,
    reviewCount: 18,
  },
  {
    id: '11',
    name: 'Altus Model 1507SRBEO-CD Flute SN 13111',
    slug: 'altus-1507srbeo-cd-flute-13111',
    brand: 'Altus',
    price: 11499,
    shippingCost: 200,
    category: 'woodwinds',
    subcategory: 'flutes',
    images: [
      '/images/products/altus-1507-13111-main.jpg',
      '/images/products/altus-1507-13111-hover.jpg',
    ],
    inStock: true,
    stock: 1,
    description: 'Professional Altus 1507 with extended features including C# trill. Exquisite craftsmanship in every detail.',
    specs: {
      'Material': 'Sterling Silver',
      'Keys': 'Sterling Silver with C# Trill',
      'Mechanism': 'Open Hole, B Foot',
      'Serial Number': '13111',
    },
    sku: 'ALT-1507-13111',
    rating: 4.9,
    reviewCount: 6,
  },
  {
    id: '12',
    name: 'Altus Model 1807SRBEO-D Flute SN 12388',
    slug: 'altus-1807srbeo-d-flute-12388',
    brand: 'Altus',
    price: 13999,
    shippingCost: 200,
    category: 'woodwinds',
    subcategory: 'flutes',
    images: [
      '/images/products/altus-1807-main.jpg',
      '/images/products/altus-1807-hover.jpg',
    ],
    badge: 'limited',
    inStock: true,
    stock: 1,
    description: 'Top-tier Altus 1807 with 18K gold riser. The finest expression of Altus artistry and sound.',
    specs: {
      'Material': 'Sterling Silver Body',
      'Headjoint': '18K Gold Riser',
      'Keys': 'Sterling Silver',
      'Mechanism': 'Open Hole, B Foot',
      'Serial Number': '12388',
    },
    sku: 'ALT-1807-12388',
    rating: 5.0,
    reviewCount: 5,
  },
  // Saxophones
  {
    id: '13',
    name: 'Selmer Paris Super Action 80 Series II Alto Sax',
    slug: 'selmer-paris-sa80-series-ii-alto-sax',
    brand: 'Selmer Paris',
    price: 3699,
    shippingCost: 200,
    category: 'woodwinds',
    subcategory: 'saxophones',
    images: [
      '/images/products/selmer-sa80-alto-main.jpg',
      '/images/products/selmer-sa80-alto-hover.jpg',
    ],
    badge: 'sale',
    inStock: true,
    stock: 1,
    description: 'The legendary Selmer Paris Super Action 80 Series II alto saxophone. Preferred by professionals worldwide for its rich, dark tone and exceptional playability.',
    specs: {
      'Key': 'Eb Alto',
      'Material': 'Yellow Brass',
      'Finish': 'Gold Lacquer',
      'Keywork': 'Ribbed Construction',
      'Neck': 'Selmer S80 Neck',
    },
    sku: 'SEL-SA80II-ALTO',
    rating: 5.0,
    reviewCount: 45,
  },
  {
    id: '14',
    name: 'Antigua Winds TS4240BG Tenor Saxophone',
    slug: 'antigua-winds-ts4240bg-tenor-sax',
    brand: 'Antigua Winds',
    price: 1799,
    shippingCost: 200,
    category: 'woodwinds',
    subcategory: 'saxophones',
    images: [
      '/images/products/antigua-tenor-main.jpg',
      '/images/products/antigua-tenor-hover.jpg',
    ],
    inStock: true,
    stock: 3,
    description: 'Professional-quality Antigua tenor saxophone with black nickel body and gold lacquer keys. Exceptional value for advancing players.',
    specs: {
      'Key': 'Bb Tenor',
      'Material': 'Yellow Brass',
      'Finish': 'Black Nickel Body, Gold Lacquer Keys',
      'Keywork': 'Ribbed Construction',
      'High F# Key': 'Yes',
    },
    sku: 'ANT-TS4240BG',
    rating: 4.6,
    reviewCount: 23,
  },
  // Student Flute
  {
    id: '15',
    name: 'Selmer Model SFL301 Student Flute',
    slug: 'selmer-sfl301-student-flute',
    brand: 'Selmer',
    price: 499,
    shippingCost: 200,
    category: 'woodwinds',
    subcategory: 'flutes',
    images: [
      '/images/products/selmer-sfl301-main.jpg',
      '/images/products/selmer-sfl301-hover.jpg',
    ],
    inStock: true,
    stock: 5,
    description: 'Excellent student flute from Selmer. Closed hole, C foot design perfect for beginners. Solid construction and reliable performance.',
    specs: {
      'Material': 'Nickel Silver',
      'Finish': 'Silver Plated',
      'Keys': 'Closed Hole',
      'Foot Joint': 'C Foot',
      'Headjoint': 'Standard Cut',
    },
    sku: 'SEL-SFL301',
    rating: 4.5,
    reviewCount: 67,
  },
  // Clarinet
  {
    id: '16',
    name: 'Buffet Crampon R13 Bb Clarinet',
    slug: 'buffet-crampon-r13-bb-clarinet',
    brand: 'Buffet Crampon',
    price: 2499,
    shippingCost: 200,
    category: 'woodwinds',
    subcategory: 'clarinets',
    images: [
      '/images/products/buffet-r13-main.jpg',
      '/images/products/buffet-r13-hover.jpg',
    ],
    badge: 'sale',
    inStock: true,
    stock: 2,
    description: 'The iconic Buffet Crampon R13 - the world\'s most popular professional clarinet. African Blackwood body with exceptional tone and response.',
    specs: {
      'Key': 'Bb',
      'Material': 'African Blackwood (Grenadilla)',
      'Keys': 'Silver Plated',
      'Bore': 'R13 Bore (14.65mm)',
      'Barrel': '65mm',
    },
    sku: 'BUF-R13-BB',
    rating: 4.9,
    reviewCount: 89,
  },
]

// Promotional Banners
export const promoBanners: PromoBanner[] = [
  {
    id: '1',
    title: '0% APR Financing',
    description: 'Get 0% APR financing on all instruments over $1,000. Apply today!',
    image: '/images/products/altus-1607-main.jpg',
    ctaText: 'Learn More',
    ctaLink: '/financing',
  },
  {
    id: '2',
    title: 'New Altus Flutes',
    description: 'Discover our latest collection of professional Altus flutes.',
    image: '/images/products/altus-5207-gold-main.jpg',
    ctaText: 'Shop Now',
    ctaLink: '/shop/woodwinds/flutes',
  },
  {
    id: '3',
    title: 'Professional Setup',
    description: 'Every instrument professionally set up before shipping.',
    image: '/images/products/selmer-sa80-alto-main.jpg',
    ctaText: 'Learn More',
    ctaLink: '/about',
  },
  {
    id: '4',
    title: 'Saxophone Sale',
    description: 'Save up to $800 on select Selmer and Antigua saxophones.',
    image: '/images/products/antigua-tenor-main.jpg',
    ctaText: 'Shop Saxophones',
    ctaLink: '/shop/woodwinds/saxophones',
  },
  {
    id: '5',
    title: 'Buffet Clarinets',
    description: 'The legendary R13 - now at special pricing.',
    image: '/images/products/buffet-r13-main.jpg',
    ctaText: 'View Details',
    ctaLink: '/shop/woodwinds/clarinets',
  },
  {
    id: '6',
    title: 'Trade-In Program',
    description: 'Trade in your old instrument for credit towards a new one.',
    image: '/images/products/haynes-piccolo-a10751-main.jpg',
    ctaText: 'Get Quote',
    ctaLink: '/contact',
  },
]

// Featured Collections
export const featuredCollections: FeaturedCollection[] = [
  {
    id: '1',
    name: 'Professional Flutes',
    slug: 'professional-flutes',
    productIds: ['1', '4', '5', '7', '9', '12'],
  },
  {
    id: '2',
    name: 'Saxophones',
    slug: 'saxophones',
    productIds: ['13', '14'],
  },
  {
    id: '3',
    name: 'Student Instruments',
    slug: 'student-instruments',
    productIds: ['15'],
  },
  {
    id: '4',
    name: 'New Arrivals',
    slug: 'new-arrivals',
    productIds: ['1', '8', '2', '3'],
  },
  {
    id: '5',
    name: 'On Sale',
    slug: 'on-sale',
    productIds: ['4', '13', '16'],
  },
]

// Helper Functions
export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter((product) => product.category === categorySlug)
}

export function getProductsBySubcategory(subcategorySlug: string): Product[] {
  return products.filter((product) => product.subcategory === subcategorySlug)
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug)
}

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id)
}

export function getFeaturedProducts(collectionId: string): Product[] {
  const collection = featuredCollections.find((c) => c.id === collectionId)
  if (!collection) return []
  return collection.productIds
    .map((id) => getProductById(id))
    .filter((product): product is Product => product !== undefined)
}

export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase()
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.brand.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery)
  )
}

export function getRelatedProducts(productId: string, limit: number = 4): Product[] {
  const product = getProductById(productId)
  if (!product) return []

  return products
    .filter((p) => p.id !== productId && p.subcategory === product.subcategory)
    .slice(0, limit)
}
