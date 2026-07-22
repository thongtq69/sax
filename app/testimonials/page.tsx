import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, ExternalLink, Quote, Star } from 'lucide-react'
import { StructuredData } from '@/components/seo/StructuredData'
import { prisma } from '@/lib/prisma'
import { buildCanonicalUrl, getBaseUrl } from '@/lib/seo'

export const revalidate = 300

const pageTitle = 'Customer Testimonials & Reviews'
const socialTitle = 'Customer Testimonials & Reviews | James Sax Corner'
const pageDescription = 'Read verified customer testimonials and reviews from musicians who purchased professional saxophones from James Sax Corner.'

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    'James Sax Corner reviews',
    'James Sax Corner testimonials',
    'saxophone customer reviews',
    'professional saxophone dealer reviews',
    'buy saxophone online reviews',
  ],
  alternates: {
    canonical: buildCanonicalUrl('/testimonials'),
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: socialTitle,
    description: pageDescription,
    url: buildCanonicalUrl('/testimonials'),
    type: 'website',
    siteName: 'James Sax Corner',
  },
  twitter: {
    card: 'summary_large_image',
    title: socialTitle,
    description: pageDescription,
  },
}

async function getTestimonials() {
  const reviews = await prisma.review.findMany({
    where: {
      message: { not: '' },
    },
    select: {
      id: true,
      buyerName: true,
      rating: true,
      title: true,
      message: true,
      date: true,
      isVerified: true,
      customProductName: true,
      sourceUrl: true,
      product: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
    take: 200,
  }).catch(() => [])

  return reviews.filter((review) => review.message.trim().length > 0)
}

function formatReviewDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export default async function TestimonialsPage() {
  const reviews = await getTestimonials()
  const baseUrl = getBaseUrl()
  const averageRating = reviews.length
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
    : 0

  const testimonialsSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Customer Testimonials & Reviews',
    description: pageDescription,
    url: `${baseUrl}/testimonials`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: reviews.length,
      itemListElement: reviews.map((review, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: review.buyerName,
          },
          datePublished: review.date.toISOString().split('T')[0],
          name: review.title || `Review from ${review.buyerName}`,
          reviewBody: review.message,
          reviewRating: {
            '@type': 'Rating',
            ratingValue: review.rating,
            bestRating: 5,
            worstRating: 1,
          },
          itemReviewed: {
            '@type': 'Store',
            name: 'James Sax Corner',
            url: baseUrl,
          },
        },
      })),
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Testimonials',
        item: `${baseUrl}/testimonials`,
      },
    ],
  }

  return (
    <main className="min-h-screen bg-[#faf9f6]">
      <StructuredData data={testimonialsSchema} />
      <StructuredData data={breadcrumbSchema} />

      <section className="relative overflow-hidden bg-secondary px-4 py-12 text-white md:py-16">
        <Quote className="absolute -right-8 -top-10 h-48 w-48 rotate-12 text-white/5 md:h-64 md:w-64" aria-hidden="true" />
        <div className="container relative mx-auto max-w-5xl text-center">
          <nav aria-label="Breadcrumb" className="mb-5 text-xs text-white/65">
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span aria-current="page">Testimonials</span>
          </nav>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#d8ca6d]">
            Trusted by musicians worldwide
          </p>
          <h1 className="font-display text-3xl font-bold md:text-5xl">
            Customer Testimonials &amp; Reviews
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">
            Read what musicians, students, and professional players say about their experience with James Sax Corner.
          </p>

          {reviews.length > 0 && (
            <div className="mx-auto mt-7 flex w-fit flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-full border border-white/15 bg-white/10 px-6 py-3 backdrop-blur-sm">
              <span className="flex items-center gap-2 font-semibold">
                <span className="text-xl">{averageRating.toFixed(1)}</span>
                <span className="flex" aria-label={`${averageRating.toFixed(1)} out of 5 stars`}>
                  {[0, 1, 2, 3, 4].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-[#d8ca6d] text-[#d8ca6d]" aria-hidden="true" />
                  ))}
                </span>
              </span>
              <span className="hidden h-5 w-px bg-white/25 sm:block" aria-hidden="true" />
              <span className="text-sm text-white/80">{reviews.length} customer testimonials</span>
            </div>
          )}
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 py-10 md:py-14">
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2">
            {reviews.map((review) => {
              const productName = review.product?.name || review.customProductName

              return (
                <article
                  key={review.id}
                  className="relative overflow-hidden rounded-xl border border-[#afa65f]/20 bg-white p-5 shadow-sm transition-shadow hover:shadow-md md:p-6"
                >
                  <Quote className="absolute -right-3 -top-3 h-20 w-20 rotate-12 text-[#afa65f]/[0.07]" aria-hidden="true" />
                  <div className="relative">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-display text-lg font-bold text-secondary">
                          {review.title || review.buyerName}
                        </h2>
                        {review.title && (
                          <p className="mt-0.5 text-sm font-medium text-gray-600">{review.buyerName}</p>
                        )}
                      </div>
                      {review.isVerified && (
                        <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                          <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                          Verified buyer
                        </span>
                      )}
                    </div>

                    <div className="mb-3 flex items-center gap-2">
                      <span className="flex" aria-label={`${review.rating} out of 5 stars`}>
                        {[0, 1, 2, 3, 4].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${star < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
                            aria-hidden="true"
                          />
                        ))}
                      </span>
                      <time dateTime={review.date.toISOString().split('T')[0]} className="text-xs text-gray-400">
                        {formatReviewDate(review.date)}
                      </time>
                    </div>

                    <blockquote className="text-sm leading-7 text-gray-700 md:text-[15px]">
                      <p>&ldquo;{review.message}&rdquo;</p>
                    </blockquote>

                    {(productName || review.sourceUrl) && (
                      <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 text-xs text-gray-500">
                        {productName ? <span>{productName}</span> : <span />}
                        {review.sourceUrl && (
                          <a
                            href={review.sourceUrl}
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                            className="inline-flex items-center gap-1 font-medium text-[#8a8347] hover:underline"
                          >
                            Original feedback
                            <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          </a>
                        )}
                      </footer>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white px-5 py-16 text-center shadow-sm">
            <Quote className="mx-auto mb-3 h-10 w-10 text-[#afa65f]" aria-hidden="true" />
            <h2 className="font-display text-xl font-bold text-secondary">Testimonials are being updated</h2>
            <p className="mt-2 text-sm text-gray-600">Please check back soon for customer feedback.</p>
          </div>
        )}

        <div className="mt-10 rounded-xl bg-secondary px-6 py-7 text-center text-white md:px-10">
          <h2 className="font-display text-2xl font-bold">Find your next saxophone</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-white/75">
            Explore our current selection of professionally inspected instruments or contact us for personalized assistance.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/shop" className="rounded-md bg-[#afa65f] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#9a9254]">
              Browse Instruments
            </Link>
            <Link href="/inquiry" className="rounded-md border border-white/35 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
