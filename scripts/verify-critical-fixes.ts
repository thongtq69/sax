import { sanitizeEditableHtml } from '../lib/sanitize-html'
import { generateGuestAccessToken, getGuestVerificationCode } from '../lib/guest-order'
import { buildInvoiceSnapshot, renderInvoiceHtml } from '../lib/invoice'
import { getVerificationAddress } from '../lib/order-address'
import { normalizeProductImages, ProductImageValidationError } from '../lib/product-images'
import { getImageUrl } from '../lib/utils'

const clean = sanitizeEditableHtml(
  '<style>.x{color:red}</style><div class="x" onclick="bad()">OK</div><script>alert(1)</script>',
)
if (!clean?.includes('<style>') || clean.includes('onclick') || clean.includes('<script>')) {
  throw new Error('Safe HTML sanitizer regression')
}

if (getGuestVerificationCode({ zip: '12345-9', phone: '+1 555 890' }) !== '12345890') {
  throw new Error('Guest verification code regression')
}

if (!/^[A-F0-9]{32}$/.test(generateGuestAccessToken())) {
  throw new Error('Guest access token entropy regression')
}

const verificationAddress = getVerificationAddress(
  { paypalOrderId: 'PAYPAL-1', payerEmail: 'buyer@example.com' },
  { zip: '90210', phone: '+1 555 123 4567' },
)
if (getGuestVerificationCode(verificationAddress) !== '90210567') {
  throw new Error('Guest verification address fallback regression')
}

const snapshot = buildInvoiceSnapshot({
  items: [],
  total: 0,
  billingAddress: { paypalEmail: 'buyer@example.com', paypalName: 'James Buyer' },
  shippingAddress: { address1: '1 Main St', city: 'Austin', state: 'TX', zip: '78701', country: 'US' },
})
if (snapshot.billTo.address1 !== '1 Main St' || snapshot.billTo.email !== 'buyer@example.com') {
  throw new Error('Legacy PayPal invoice address regression')
}

if (getImageUrl('https://example.com/?rvb-img.reverb.com') !== 'https://example.com/?rvb-img.reverb.com') {
  throw new Error('Remote image hostname validation regression')
}

const productImages = normalizeProductImages([' https://example.com/a.jpg ', 'https://example.com/a.jpg'])
if (productImages.length !== 1) throw new Error('Product image normalization regression')
try {
  normalizeProductImages(['javascript:alert(1)'])
  throw new Error('Unsafe product image URL accepted')
} catch (error) {
  if (!(error instanceof ProductImageValidationError)) throw error
}

const invoice = renderInvoiceHtml(
  { seller: { name: 'James' }, billTo: { firstName: 'A' }, items: [], subtotal: 0, shipping: 0, total: 0 },
  'INV-1',
  '1',
  new Date('2026-01-01'),
)
if (!invoice.includes('INV-1') || !invoice.includes('BILL TO')) {
  throw new Error('Invoice rendering regression')
}

console.log('Critical fix verification passed.')
