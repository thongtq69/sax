import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SecureOrderViewer } from '@/components/order/SecureOrderViewer'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Secure Order Access',
  robots: { index: false, follow: false, nocache: true },
}

export default async function SecureOrderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const separator = slug.lastIndexOf('-')
  if (separator < 1) notFound()
  const orderNumber = decodeURIComponent(slug.slice(0, separator))
  const token = decodeURIComponent(slug.slice(separator + 1)).toUpperCase()
  // Accept legacy 32-bit links while issuing 128-bit tokens for all new orders.
  if (!/^(?:[A-F0-9]{8}|[A-F0-9]{32})$/.test(token)) notFound()
  return <SecureOrderViewer orderNumber={orderNumber} token={token} />
}
