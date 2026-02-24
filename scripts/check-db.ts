
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const product = await prisma.product.findFirst({
        where: {
            name: { contains: 'Yamaha YTS-62' }
        },
        include: {
            category: true,
            subcategory: true
        }
    })
    console.log(JSON.stringify(product, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
