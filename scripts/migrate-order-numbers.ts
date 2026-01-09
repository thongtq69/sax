/**
 * Script to migrate existing orders to have orderNumber
 * Run with: npx ts-node scripts/migrate-order-numbers.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function generateOrderNumberFromDate(date: Date): string {
  // Convert to Vietnam timezone
  const vietnamTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }))
  
  const day = vietnamTime.getDate()
  const month = vietnamTime.getMonth() + 1
  const year = vietnamTime.getFullYear() % 100
  const hour = vietnamTime.getHours()
  const minute = vietnamTime.getMinutes()
  const second = vietnamTime.getSeconds()
  const ms = date.getMilliseconds()
  
  return `${day}${month}${year}${hour}${minute}${second}${ms.toString().padStart(3, '0')}21`
}

async function migrateOrderNumbers() {
  console.log('Starting order number migration...')
  
  // Get all orders without orderNumber
  const orders = await prisma.order.findMany({
    where: {
      orderNumber: null
    },
    orderBy: {
      createdAt: 'asc'
    }
  })
  
  console.log(`Found ${orders.length} orders without orderNumber`)
  
  for (const order of orders) {
    const orderNumber = generateOrderNumberFromDate(order.createdAt)
    
    try {
      await prisma.order.update({
        where: { id: order.id },
        data: { orderNumber }
      })
      console.log(`Updated order ${order.id} -> ${orderNumber}`)
    } catch (error: any) {
      // If duplicate, add random suffix
      if (error.code === 'P2002') {
        const uniqueOrderNumber = `${orderNumber}${Math.floor(Math.random() * 1000)}`
        await prisma.order.update({
          where: { id: order.id },
          data: { orderNumber: uniqueOrderNumber }
        })
        console.log(`Updated order ${order.id} -> ${uniqueOrderNumber} (with suffix)`)
      } else {
        throw error
      }
    }
  }
  
  console.log('Migration completed!')
}

migrateOrderNumbers()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
