import { prisma } from '../lib/prisma'

async function main() {
    const p = await prisma.product.findUnique({
        where: { slug: 'selmer-reference-54-hummingbird-charlie-parker-edition-alto-saxophone-n68xxx' }
    })
    console.log('Product Found:', !!p)
    if (p) {
        console.log('isVisible:', (p as any).isVisible)
        console.log('stockStatus:', p.stockStatus)
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect()
    })
