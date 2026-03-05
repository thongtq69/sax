import { prisma } from '../lib/prisma'

async function main() {
    const products = await prisma.product.findMany({
        select: {
            id: true,
            name: true,
            slug: true,
            isVisible: true,
            stockStatus: true,
            sku: true
        }
    })
    console.log('Total products in database:', products.length)
    console.log('Visible products:', products.filter(p => p.isVisible).length)
    console.log('Archived products:', products.filter(p => p.stockStatus === 'archived').length)

    if (products.length > 0) {
        console.log('\nSample products:')
        console.log(JSON.stringify(products.slice(0, 5), null, 2))
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect()
    })
