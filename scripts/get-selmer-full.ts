import { prisma } from '../lib/prisma'

async function main() {
    const product = await prisma.product.findFirst({
        where: { slug: 'selmer-reference-54-hummingbird-charlie-parker-edition-alto-saxophone-n68xxx' },
        include: {
            category: true,
            subcategory: true
        }
    })
    console.log(JSON.stringify(product, null, 2))
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect()
    })
