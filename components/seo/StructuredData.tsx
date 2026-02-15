'use client'

interface StructuredDataProps {
  data: Record<string, any>
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Organization Schema
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "James Sax Corner",
  "url": process.env.NEXT_PUBLIC_BASE_URL || "https://jamessaxcorner.com",
  "logo": `${process.env.NEXT_PUBLIC_BASE_URL || "https://jamessaxcorner.com"}/logo.png`,
  "description": "Premium saxophones, expertly maintained for peak performance. Trusted by musicians worldwide.",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "availableLanguage": ["English"],
    "email": "contact@jamessaxcorner.com"
  },
  "sameAs": []
}

// Website Schema
export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "James Sax Corner",
  "url": process.env.NEXT_PUBLIC_BASE_URL || "https://jamessaxcorner.com",
  "description": "Premium saxophones and professional wind instruments",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${process.env.NEXT_PUBLIC_BASE_URL || "https://jamessaxcorner.com"}/shop?search={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
}

// Product Schema Generator
export function generateProductSchema(product: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.images,
    "brand": {
      "@type": "Brand",
      "name": product.brand
    },
    "sku": product.sku,
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "USD",
      "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "James Sax Corner"
      }
    },
    "aggregateRating": product.rating > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.reviewCount
    } : undefined
  }
}

// BreadcrumbList Schema Generator
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url,
    })),
  }
}

// FAQ Schema Generator (for About page)
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  }
}

// Local Business Schema
export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "Store",
  "name": "James Sax Corner",
  "url": process.env.NEXT_PUBLIC_BASE_URL || "https://jamessaxcorner.com",
  "logo": `${process.env.NEXT_PUBLIC_BASE_URL || "https://jamessaxcorner.com"}/logo.png`,
  "description": "Premium saxophones, expertly maintained for peak performance. Trusted by musicians worldwide.",
  "priceRange": "$$",
  "currenciesAccepted": "USD",
  "paymentAccepted": "PayPal",
  "makesOffer": {
    "@type": "Offer",
    "itemOffered": {
      "@type": "Product",
      "name": "Professional Saxophones"
    }
  }
}