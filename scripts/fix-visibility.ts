import { prisma } from '../lib/prisma'

async function main() {
    console.log('🔄 Đang ép lại kiểu dữ liệu isVisible cho tất cả sản phẩm...')

    const allProducts = await prisma.product.findMany({
        select: { id: true, name: true, isVisible: true }
    })

    console.log(`🔍 Tìm thấy ${allProducts.length} sản phẩm.`)

    let updatedCount = 0
    for (const product of allProducts) {
        await prisma.product.update({
            where: { id: product.id },
            data: { isVisible: true }
        })
        updatedCount++
    }

    console.log(`✅ Đã ép kiểu thành công cho ${updatedCount} sản phẩm.`)

    const visibleCount = await prisma.product.count({
        where: { isVisible: true }
    })
    console.log(`📊 Số sản phẩm hiển thị sau khi sửa: ${visibleCount}`)
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect()
    })
