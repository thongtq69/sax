import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // First, get or create a category
  let category = await prisma.category.findFirst({
    where: { slug: 'accessories' }
  })

  if (!category) {
    // Get any existing category
    category = await prisma.category.findFirst()
  }

  if (!category) {
    // Create a category if none exists
    category = await prisma.category.create({
      data: {
        name: 'Accessories',
        slug: 'accessories',
        path: '/shop/accessories'
      }
    })
    console.log('Created category:', category.name)
  }

  // Check if test product already exists
  const existingProduct = await prisma.product.findUnique({
    where: { sku: 'TEST-PRODUCT-10' }
  })

  if (existingProduct) {
    console.log('Test product already exists:', existingProduct.name)
    console.log('Product ID:', existingProduct.id)
    console.log('URL: /product/' + existingProduct.slug)
    return
  }

  // Create test product
  const product = await prisma.product.create({
    data: {
      name: 'Test Payment Product - $10',
      slug: 'test-payment-product-10',
      brand: 'Test Brand',
      price: 10.00,
      shippingCost: 200,
      categoryId: category.id,
      images: ['/placeholder.jpg'],
      badge: null,
      inStock: true,
      stock: 100,
      description: 'This is a test product for payment testing. Price: $10 USD. You can refund this purchase after testing.',
      specs: {
        'Purpose': 'Payment Testing',
        'Price': '$10.00 USD',
        'Refundable': 'Yes'
      },
      included: ['Test item'],
      warranty: 'No warranty - test product',
      sku: 'TEST-PRODUCT-10',
      rating: 5,
      reviewCount: 0
    }
  })

  console.log('✅ Test product created successfully!')
  console.log('Product ID:', product.id)
  console.log('Product Name:', product.name)
  console.log('Price: $' + product.price)
  console.log('SKU:', product.sku)
  console.log('URL: /product/' + product.slug)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
