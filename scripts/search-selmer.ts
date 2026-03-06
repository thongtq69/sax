import { prisma } from '../lib/prisma'

async function main() {
    const products = await prisma.product.findMany({
        where: {
            OR: [
                { name: { contains: 'selmer', mode: 'insensitive' } },
                { slug: { contains: 'selmer', mode: 'insensitive' } }
            ]
        },
        select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
            isVisible: true
        }
    })
    console.log('Found:', products.length)
    console.log(JSON.stringify(products, null, 2))
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect()
    })
