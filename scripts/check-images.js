const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('=== CHECKING IMAGE URLs ===')
  
  const cloudNames = new Set()
  const allCloudUrls = []

  function check(url, src) {
    if (!url) return
    if (url.includes('res.cloudinary.com')) {
      const m = url.match(/res\.cloudinary\.com\/([^/]+)/)
      if (m) cloudNames.add(m[1])
      allCloudUrls.push({ src, url })
      console.log('[Cloud] ' + src + ': ' + url.substring(0, 150))
    } else if (url.startsWith('http')) {
      console.log('[Ext] ' + src + ': ' + url.substring(0, 150))
    } else {
      console.log('[Local] ' + src + ': ' + url)
    }
  }

  const products = await prisma.product.findMany({ select: { name: true, images: true } })
  console.log('\n--- Products (' + products.length + ') ---')
  products.forEach(p => p.images.forEach(i => check(i, p.name)))

  const blogs = await prisma.blogPost.findMany({ select: { title: true, image: true } })
  console.log('\n--- Blogs (' + blogs.length + ') ---')
  blogs.forEach(b => check(b.image, b.title))

  const banners = await prisma.banner.findMany({ select: { title: true, image: true } })
  console.log('\n--- Banners (' + banners.length + ') ---')
  banners.forEach(b => check(b.image, b.title))

  const promos = await prisma.promoBanner.findMany({ select: { title: true, image: true } })
  console.log('\n--- Promos (' + promos.length + ') ---')
  promos.forEach(p => check(p.image, p.title))

  const homepage = await prisma.homepageContent.findMany({ select: { sectionKey: true, image: true, metadata: true } })
  console.log('\n--- Homepage (' + homepage.length + ') ---')
  homepage.forEach(h => {
    check(h.image, 'HP:' + h.sectionKey)
    if (h.metadata) {
      const s = JSON.stringify(h.metadata)
      const matches = s.match(/https?:\/\/res\.cloudinary\.com[^"']*/g)
      if (matches) matches.forEach(m => check(m, 'HP-meta:' + h.sectionKey))
    }
  })

  const collections = await prisma.featuredCollection.findMany({ select: { name: true, backgroundImage: true } })
  console.log('\n--- Collections (' + collections.length + ') ---')
  collections.forEach(c => check(c.backgroundImage, c.name))

  const popups = await prisma.popupAd.findMany({ select: { title: true, image: true } })
  console.log('\n--- Popups (' + popups.length + ') ---')
  popups.forEach(p => check(p.image, p.title))

  const brands = await prisma.brand.findMany({ select: { name: true, logo: true } })
  console.log('\n--- Brands (' + brands.length + ') ---')
  brands.forEach(b => check(b.logo, b.name))

  console.log('\n========== SUMMARY ==========')
  console.log('Cloud names: ' + [...cloudNames].join(', '))
  console.log('Total Cloudinary URLs: ' + allCloudUrls.length)
  for (const cn of cloudNames) {
    console.log('  ' + cn + ': ' + allCloudUrls.filter(u => u.url.includes(cn)).length + ' URLs')
  }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
