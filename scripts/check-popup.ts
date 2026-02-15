import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const count = await prisma.popupAd.count()
    const active = await prisma.popupAd.findMany({ where: { isActive: true } })
    console.log('Total PopupAds:', count)
    console.log('Active PopupAds:', active.length)
    if (active.length > 0) {
        console.log('Active Ads:', JSON.stringify(active, null, 2))
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
