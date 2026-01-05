import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const faqs = [
  {
    question: "Is this a beginner saxophone?",
    answer: "No. We sell professional models only, intended for serious students and working musicians.",
    category: "Products",
    order: 1
  },
  {
    question: "Is this instrument ready to ship?",
    answer: "Yes. All listed saxophones are fully prepared and ready for immediate shipment.",
    category: "Shipping",
    order: 2
  },
  {
    question: "How long does delivery to the U.S. take?",
    answer: "We use FedEx, DHL, or UPS express international shipping, with delivery typically in 3–4 business days.",
    category: "Shipping",
    order: 3
  },
  {
    question: "Is payment secure?",
    answer: "Yes. All payments are processed via PayPal with full buyer protection.",
    category: "Payment",
    order: 4
  },
  {
    question: "Can I ask questions before buying?",
    answer: "Absolutely. We encourage you to contact us before purchase for detailed guidance.",
    category: "General",
    order: 5
  },
  {
    question: "What saxophones do you sell?",
    answer: "We specialize exclusively in professional-level saxophones. We do not sell beginner or entry-level models. All instruments are selected for serious students, advanced players, and working musicians. If you cannot find the exact model you are looking for, we also accept tailor-made sourcing requests and will assist in locating the right instrument whenever possible.",
    category: "Products",
    order: 6
  },
  {
    question: "What shipping carriers do you use?",
    answer: "We use FedEx, DHL, and UPS express services exclusively to ensure fast, reliable, and fully trackable international delivery.",
    category: "Shipping",
    order: 7
  },
  {
    question: "What payment methods do you accept?",
    answer: "All payments are processed securely through PayPal, providing full buyer protection and peace of mind for U.S. customers.",
    category: "Payment",
    order: 8
  },
  {
    question: "Do you accept returns?",
    answer: "Due to the complexity and high cost of international logistics, we do not accept returns. Every saxophone is professionally prepared before shipping, and the consistency of our quality and service is reflected in the testimonials from satisfied U.S. customers.",
    category: "Returns",
    order: 9
  },
  {
    question: "Are your reviews from real buyers?",
    answer: "Yes. All testimonials come from verified customers and reflect real experiences with our instruments and services.",
    category: "General",
    order: 10
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes. We ship to the United States, Canada, and selected European countries using express international services. Availability may vary by destination.",
    category: "Shipping",
    order: 11
  },
  {
    question: "Do you offer private saxophone lessons?",
    answer: "Yes. We offer private lessons for both beginners and advanced players, available online and in person, tailored to individual musical goals.",
    category: "Services",
    order: 12
  },
  {
    question: "Do you offer repair services?",
    answer: "We provide professional repair and maintenance services for local clients only, focusing on precision setup, pad sealing, and balanced mechanical response.",
    category: "Services",
    order: 13
  }
]

const banners = [
  {
    title: "Professional Saxophones",
    subtitle: "Handpicked for Serious Musicians",
    image: "/images/banners/hero-saxophone.jpg",
    link: "/shop",
    isActive: true,
    order: 1
  },
  {
    title: "New Arrivals",
    subtitle: "Discover Our Latest Collection",
    image: "/images/banners/new-arrivals.jpg",
    link: "/shop?sort=newest",
    isActive: true,
    order: 2
  },
  {
    title: "Expert Repair Services",
    subtitle: "Professional Maintenance & Setup",
    image: "/images/banners/repair-service.jpg",
    link: "/about",
    isActive: true,
    order: 3
  }
]

async function main() {
  console.log('🌱 Seeding CMS data...')

  // Seed FAQs
  console.log('📝 Seeding FAQs...')
  // First, check if FAQs already exist
  const existingFaqs = await prisma.fAQ.count()
  if (existingFaqs === 0) {
    await prisma.fAQ.createMany({ data: faqs })
    console.log(`✅ Seeded ${faqs.length} FAQs`)
  } else {
    console.log(`ℹ️ FAQs already exist (${existingFaqs} found), skipping...`)
  }

  // Seed Banners
  console.log('🖼️ Seeding Banners...')
  for (const banner of banners) {
    const existing = await prisma.banner.findFirst({
      where: { title: banner.title }
    })
    if (!existing) {
      await prisma.banner.create({ data: banner })
    } else {
      await prisma.banner.update({
        where: { id: existing.id },
        data: banner
      })
    }
  }
  console.log(`✅ Seeded ${banners.length} Banners`)

  // Seed default Site Settings if not exists
  console.log('⚙️ Checking Site Settings...')
  const existingSettings = await prisma.siteSettings.findFirst()
  if (!existingSettings) {
    await prisma.siteSettings.create({
      data: {
        siteName: "James Sax Corner",
        siteDescription: "Professional Saxophone Shop - Handpicked instruments for serious musicians",
        contactEmail: "contact@jamessaxcorner.com",
        contactPhone: "+1 (555) 123-4567",
        address: "123 Music Street, New York, NY 10001",
        socialLinks: {
          facebook: "https://facebook.com/jamessaxcorner",
          instagram: "https://instagram.com/jamessaxcorner",
          youtube: "https://youtube.com/jamessaxcorner"
        },
        businessHours: {
          monday: "9:00 AM - 6:00 PM",
          tuesday: "9:00 AM - 6:00 PM",
          wednesday: "9:00 AM - 6:00 PM",
          thursday: "9:00 AM - 6:00 PM",
          friday: "9:00 AM - 6:00 PM",
          saturday: "10:00 AM - 4:00 PM",
          sunday: "Closed"
        }
      }
    })
    console.log('✅ Created default Site Settings')
  } else {
    console.log('ℹ️ Site Settings already exist')
  }

  // Seed Homepage Content
  console.log('🏠 Seeding Homepage Content...')
  const homepageSections = [
    {
      sectionKey: "hero",
      title: "Professional Saxophones",
      subtitle: "Handpicked for Serious Musicians",
      content: "Discover our curated collection of professional-grade saxophones, each individually inspected and prepared for optimal performance.",
      isVisible: true,
      order: 1
    },
    {
      sectionKey: "about",
      title: "About James Sax Corner",
      subtitle: "Your Trusted Saxophone Specialist",
      content: "We are dedicated to providing musicians with the finest professional saxophones. Every instrument in our collection is carefully selected and prepared to meet the highest standards.",
      isVisible: true,
      order: 2
    },
    {
      sectionKey: "features",
      title: "Why Choose Us",
      subtitle: "What Sets Us Apart",
      content: "Professional expertise, quality instruments, secure payments, and worldwide shipping.",
      isVisible: true,
      order: 3,
      metadata: {
        features: [
          { icon: "Music", title: "Saxophone Specialists", desc: "We focus exclusively on saxophones" },
          { icon: "Shield", title: "Secure Payments", desc: "PayPal buyer protection" },
          { icon: "Globe", title: "Worldwide Shipping", desc: "Fast international delivery" }
        ]
      }
    }
  ]

  for (const section of homepageSections) {
    await prisma.homepageContent.upsert({
      where: { sectionKey: section.sectionKey },
      update: section,
      create: section
    })
  }
  console.log(`✅ Seeded ${homepageSections.length} Homepage sections`)

  console.log('🎉 CMS data seeding complete!')
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
