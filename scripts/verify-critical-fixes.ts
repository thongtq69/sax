import { sanitizeEditableHtml } from '../lib/sanitize-html'
import { getGuestVerificationCode } from '../lib/guest-order'
import { renderInvoiceHtml } from '../lib/invoice'

const clean = sanitizeEditableHtml(
  '<style>.x{color:red}</style><div class="x" onclick="bad()">OK</div><script>alert(1)</script>',
)
if (!clean?.includes('<style>') || clean.includes('onclick') || clean.includes('<script>')) {
  throw new Error('Safe HTML sanitizer regression')
}

if (getGuestVerificationCode({ zip: '12345-9', phone: '+1 555 890' }) !== '12345890') {
  throw new Error('Guest verification code regression')
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
