import { prisma } from '../lib/prisma'

async function main() {
    const sn = process.argv[2]
    if (!sn) {
        console.log('Usage: npx tsx scripts/search-sn.ts <serial>')
        return
    }
    const products = await prisma.product.findMany({
        where: {
            OR: [
                { sku: { contains: sn, mode: 'insensitive' } },
                { slug: { contains: sn, mode: 'insensitive' } },
                { name: { contains: sn, mode: 'insensitive' } }
            ]
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
