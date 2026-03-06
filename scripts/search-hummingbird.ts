import { prisma } from '../lib/prisma'

async function main() {
    const products = await prisma.product.findMany({
        where: { name: { contains: 'Hummingbird', mode: 'insensitive' } }
    })
    console.log(JSON.stringify(products, null, 2))
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect()
    })
