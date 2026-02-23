// Script to check all image URLs stored in MongoDB
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('=== CHECKING ALL IMAGE URLs IN DATABASE ===\n')
  
  const cloudinaryUrls = new Set()
  const otherUrls = new Set()
  const cloudNames = new Set()

  function collectUrl(url, source) {
    if (!url) return
    if (url.includes('res.cloudinary.com')) {
      cloudinaryUrls.add(url)
      // Extract cloud name from URL: res.cloudinary.com/CLOUD_NAME/...
      const match = url.match(/res\.cloudinary\.com\/([^/]+)/)
      if (match) cloudNames.add(match[1])
      console.log(`  [Cloudinary] ${source}: ${url.substring(0, 120)}`)
    } else if (url.startsWith('http')) {
      otherUrls.add(url)
      console.log(`  [External] ${source}: ${url.substring(0, 120)}`)
    } else {
      console.log(`  [Local] ${source}: ${url}`)
    }
  }

  // 1. Products
  console.log('--- Products ---')
  const products = await prisma.product.findMany({ select: { id: true, name: true, images: true } })
  for (const p of products) {
    for (const img of p.images) {
      collectUrl(img, `Product: ${p.name}`)
    }
  }
  console.log(`  Total products: ${products.length}\n`)

  // 2. Blog Posts
  console.log('--- Blog Posts ---')
  const blogs = await prisma.blogPost.findMany({ select: { id: true, title: true, image: true } })
  for (const b of blogs) {
    collectUrl(b.image, `Blog: ${b.title}`)
  }
  console.log(`  Total blogs: ${blogs.length}\n`)

  // 3. Banners
  console.log('--- Banners ---')
  const banners = await prisma.banner.findMany({ select: { id: true, title: true, image: true } })
  for (const b of banners) {
    collectUrl(b.image, `Banner: ${b.title}`)
  }
  console.log(`  Total banners: ${banners.length}\n`)

  // 4. Promo Banners
  console.log('--- Promo Banners ---')
  const promos = await prisma.promoBanner.findMany({ select: { id: true, title: true, image: true } })
  for (const p of promos) {
    collectUrl(p.image, `Promo: ${p.title}`)
  }
  console.log(`  Total promos: ${promos.length}\n`)

  // 5. Homepage Content
  console.log('--- Homepage Content ---')
  const homepage = await prisma.homepageContent.findMany({ select: { id: true, sectionKey: true, image: true, metadata: true } })
  for (const h of homepage) {
    collectUrl(h.image, `Homepage: ${h.sectionKey}`)
    if (h.metadata && typeof h.metadata === 'object') {
      const meta = h.metadata
      // Check for nested image URLs in metadata
      const metaStr = JSON.stringify(meta)
      const cloudMatches = metaStr.match(/https?:\/\/res\.cloudinary\.com[^"']*/g)
      if (cloudMatches) {
        for (const m of cloudMatches) {
          collectUrl(m, `Homepage metadata: ${h.sectionKey}`)
        }
      }
    }
  }
  console.log(`  Total homepage sections: ${homepage.length}\n`)

  // 6. Featured Collections
  console.log('--- Featured Collections ---')
  const collections = await prisma.featuredCollection.findMany({ select: { id: true, name: true, backgroundImage: true } })
  for (const c of collections) {
    collectUrl(c.backgroundImage, `Collection: ${c.name}`)
  }
  console.log(`  Total collections: ${collections.length}\n`)

  // 7. Popup Ads
  console.log('--- Popup Ads ---')
  const popups = await prisma.popupAd.findMany({ select: { id: true, title: true, image: true } })
  for (const p of popups) {
    collectUrl(p.image, `Popup: ${p.title}`)
  }
  console.log(`  Total popups: ${popups.length}\n`)

  // 8. Brands
  console.log('--- Brands ---')
  const brands = await prisma.brand.findMany({ select: { id: true, name: true, logo: true } })
  for (const b of brands) {
    collectUrl(b.logo, `Brand: ${b.name}`)
  }
  console.log(`  Total brands: ${brands.length}\n`)

  // 9. Users (profile images)
  console.log('--- Users ---')
  const users = await prisma.user.findMany({ select: { id: true, email: true, image: true } })
  for (const u of users) {
    collectUrl(u.image, `User: ${u.email}`)
  }
  console.log(`  Total users: ${users.length}\n`)

  // Summary
  console.log('\n========== SUMMARY ==========')
  console.log(`Total Cloudinary URLs found: ${cloudinaryUrls.size}`)
  console.log(`Total External URLs found: ${otherUrls.size}`)
  console.log(`Cloudinary cloud names found: ${[...cloudNames].join(', ') || 'none'}`)
  
  if (cloudNames.size > 0) {
    console.log('\n--- Cloud Names Breakdown ---')
    for (const name of cloudNames) {
      const count = [...cloudinaryUrls].filter(u => u.includes(name)).length
      console.log(`  ${name}: ${count} URLs`)
    }
  }

  console.log('\n--- All unique Cloudinary URLs ---')
  for (const url of cloudinaryUrls) {
    console.log(`  ${url}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
