import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteFailedOrders() {
  console.log('🔍 Finding failed orders (pending status = not paid)...')
  
  // Find orders with pending status (not paid)
  const failedOrders = await prisma.order.findMany({
    where: {
      status: 'pending'
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      total: true,
    }
  })
  
  console.log(`📋 Found ${failedOrders.length} pending (unpaid) orders:`)
  failedOrders.forEach(order => {
    console.log(`  - Order #${order.id.slice(0, 8)} | Status: "${order.status}" | Total: $${order.total} | Created: ${order.createdAt}`)
  })
  
  if (failedOrders.length === 0) {
    console.log('✅ No pending orders to delete!')
    return
  }
  
  // Delete the pending orders
  const deleteResult = await prisma.order.deleteMany({
    where: {
      status: 'pending'
    }
  })
  
  console.log(`\n🗑️  Deleted ${deleteResult.count} pending orders`)
  console.log('✅ Done!')
}

deleteFailedOrders()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
