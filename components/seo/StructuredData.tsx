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
    "telephone": "+1-XXX-XXX-XXXX", // TODO: Thêm số điện thoại thật
    "contactType": "Customer Service",
    "availableLanguage": ["English"]
  },
  "sameAs": [
    "https://facebook.com/jamessaxcorner", // TODO: Thêm social media links thật
    "https://instagram.com/jamessaxcorner",
    "https://twitter.com/jamessaxcorner"
  ]
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