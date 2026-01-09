import { prisma } from '../lib/prisma'
import { products, categories, promoBanners, featuredCollections } from '../lib/data'
import { blogPosts } from '../data/blogPosts'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data
  console.log('🗑️  Clearing existing data...')
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.subCategory.deleteMany()
  await prisma.category.deleteMany()
  await prisma.blogPost.deleteMany()
  await prisma.promoBanner.deleteMany()
  await prisma.featuredCollection.deleteMany()

  // Seed Categories and SubCategories
  console.log('📁 Seeding categories...')
  const categoryMap = new Map<string, string>()
  
  for (const categoryData of categories) {
    const category = await prisma.category.create({
      data: {
        name: categoryData.name,
        slug: categoryData.slug,
        path: categoryData.path,
        subcategories: {
          create: categoryData.subcategories?.map((sub) => ({
            name: sub.name,
            slug: sub.slug,
            path: sub.path,
          })) || [],
        },
      },
    })
    categoryMap.set(categoryData.id, category.id)
    console.log(`  ✓ Created category: ${category.name}`)
  }

  // Seed Products
  console.log('📦 Seeding products...')
  const subcategoryMap = new Map<string, string>()
  
  // First, get all subcategories to map old IDs to new MongoDB IDs
  const allSubcategories = await prisma.subCategory.findMany()
  allSubcategories.forEach(sub => {
    // Find matching subcategory by slug
    categories.forEach(cat => {
      cat.subcategories?.forEach(oldSub => {
        if (oldSub.slug === sub.slug) {
          subcategoryMap.set(oldSub.id, sub.id)
        }
      })
    })
  })
  
  for (const productData of products) {
    const categoryId = categoryMap.get(productData.category)
    const subcategoryId = productData.subcategory 
      ? subcategoryMap.get(productData.subcategory) || null
      : null
    
    if (!categoryId) {
      console.warn(`  ⚠️  Skipping product ${productData.name}: category not found`)
      continue
    }
    
    const product = await prisma.product.create({
      data: {
        name: productData.name,
        slug: productData.slug,
        brand: productData.brand,
        price: productData.price,
        shippingCost: productData.shippingCost,
        categoryId: categoryId,
        subcategoryId: subcategoryId,
        images: productData.images,
        badge: productData.badge || null,
        inStock: productData.inStock,
        stock: productData.stock || 0,
        description: productData.description,
        specs: productData.specs ? (productData.specs as any) : null,
        included: productData.included || [],
        warranty: productData.warranty || null,
        sku: productData.sku,
        rating: productData.rating || 0,
        reviewCount: productData.reviewCount || 0,
      },
    })
    console.log(`  ✓ Created product: ${product.name}`)
  }

  // Seed Blog Posts
  console.log('📝 Seeding blog posts...')
  for (const postData of blogPosts) {
    const post = await prisma.blogPost.create({
      data: {
        title: postData.title,
        slug: postData.slug,
        excerpt: postData.excerpt,
        content: postData.content,
        date: new Date(postData.date),
        author: postData.author,
        categories: postData.categories,
        image: postData.image || null,
        readTime: postData.readTime || null,
      },
    })
    console.log(`  ✓ Created blog post: ${post.title}`)
  }

  // Seed Promo Banners
  console.log('🎯 Seeding promo banners...')
  for (const promoData of promoBanners) {
    const promo = await prisma.promoBanner.create({
      data: {
        title: promoData.title,
        description: promoData.description,
        image: promoData.image,
        ctaText: promoData.ctaText,
        ctaLink: promoData.ctaLink,
      },
    })
    console.log(`  ✓ Created promo banner: ${promo.title}`)
  }

  // Seed Featured Collections
  console.log('⭐ Seeding featured collections...')
  // Get all products to map old IDs to new MongoDB IDs
  const allProducts = await prisma.product.findMany()
  const productIdMap = new Map<string, string>()
  allProducts.forEach(product => {
    // Map by slug since we can't use old IDs
    const oldProduct = products.find(p => p.slug === product.slug)
    if (oldProduct) {
      productIdMap.set(oldProduct.id, product.id)
    }
  })
  
  for (const collectionData of featuredCollections) {
    // Map old product IDs to new MongoDB IDs
    const newProductIds = collectionData.productIds
      .map(oldId => productIdMap.get(oldId))
      .filter((id): id is string => id !== undefined)
    
    const collection = await prisma.featuredCollection.create({
      data: {
        name: collectionData.name,
        slug: collectionData.slug,
        productIds: newProductIds,
      },
    })
    console.log(`  ✓ Created featured collection: ${collection.name}`)
  }

  // Create default admin user
  console.log('👤 Creating admin user...')
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@saxcorner.com' },
    update: {},
    create: {
      email: 'admin@saxcorner.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'admin',
    },
  })
  console.log(`  ✓ Created admin user: ${adminUser.email}`)

  console.log('✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

