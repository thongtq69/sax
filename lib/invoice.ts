import { getBillingAddress, normalizeOrderAddress } from './order-address'

const esc = (value: unknown) => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#039;')

const addressLines = (address: any) => [
  [address?.firstName, address?.lastName].filter(Boolean).join(' ') || address?.name,
  address?.company,
  address?.address1,
  address?.address2,
  [address?.city, address?.state, address?.zip].filter(Boolean).join(', '),
  address?.country,
  address?.email,
  address?.phone,
].filter(Boolean)

const sameAddress = (left: any, right: any) =>
  JSON.stringify(addressLines(left).map((line) => String(line).toLowerCase())) ===
  JSON.stringify(addressLines(right).map((line) => String(line).toLowerCase()))

export function getOrderPaymentMethod(order: any) {
  const billing = order?.billingAddress || {}
  const notes = String(order?.notes || '').toLowerCase()
  if (notes.includes('bank')) return 'Bank Transfer'
  if (billing.paypalOrderId || billing.paypalPayerId || billing.paypalEmail) return 'PayPal'
  return 'PayPal'
}

export function buildInvoiceSnapshot(order: any) {
  const subtotal = order.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
  const discount = order.discount || 0
  const shipping = Math.max(0, order.total + discount - subtotal)
  const billTo = getBillingAddress(order.billingAddress, order.shippingAddress)
  const normalizedShipping = normalizeOrderAddress(order.shippingAddress)
  const shipTo = order.shippingAddress && !sameAddress(billTo, normalizedShipping) ? normalizedShipping : null

  return {
    seller: {
      name: 'James Sax Corner',
      tagline: 'PREMIUM SAXOPHONES',
      email: 'order@jamessaxcorner.com',
      location: 'Hanoi, Vietnam',
      website: 'https://www.jamessaxcorner.com/',
      logoUrl: 'https://www.jamessaxcorner.com/LOGO%20JAMES%20(1).svg',
    },
    billTo,
    shipTo,
    paymentMethod: getOrderPaymentMethod(order),
    items: order.items.map((item: any) => ({
      description: item.product?.name || item.productName || 'Professional instrument',
      sku: item.product?.sku || item.productSku || '',
      quantity: item.quantity,
      unitPrice: item.price,
      amount: item.price * item.quantity,
    })),
    subtotal,
    discount,
    shipping,
    deposit: 0,
    total: order.total,
    currency: 'USD',
  }
}

function renderAddress(address: any) {
  if (!address) return '<div class="muted">Not provided</div>'
  const name = [address.firstName, address.lastName].filter(Boolean).join(' ') || address.name
  const contact = [address.email, address.phone].filter(Boolean).join(' · ')
  const street = [address.address1, address.address2].filter(Boolean).join(', ')
  const locality = [address.city, address.state, address.zip].filter(Boolean).join(', ')
  return [
    name ? `<div class="person">${esc(name)}</div>` : '',
    address.company ? `<div>${esc(address.company)}</div>` : '',
    contact ? `<div>${esc(contact)}</div>` : '',
    street ? `<div>${esc(street)}</div>` : '',
    locality ? `<div>${esc(locality)}</div>` : '',
    address.country ? `<div>${esc(address.country)}</div>` : '',
  ].join('')
}

const money = (value: unknown) => Number(value || 0).toLocaleString('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const adjustment = (value: number) => value > 0 ? `-${money(value)}` : money(0)

export function renderInvoiceHtml(snapshot: any, invoiceNumber: string, orderNumber: string, issuedAt: Date) {
  const seller = {
    name: snapshot.seller?.name || 'James Sax Corner',
    tagline: snapshot.seller?.tagline || 'PREMIUM SAXOPHONES',
    email: snapshot.seller?.email || 'order@jamessaxcorner.com',
    location: snapshot.seller?.location || 'Hanoi, Vietnam',
    website: snapshot.seller?.website || 'https://www.jamessaxcorner.com/',
    logoUrl: snapshot.seller?.logoUrl || 'https://www.jamessaxcorner.com/LOGO%20JAMES%20(1).svg',
  }
  const subtotal = Number(snapshot.subtotal || 0)
  const shipping = Number(snapshot.shipping || 0)
  const discount = Math.max(0, Number(snapshot.discount || 0))
  const deposit = Math.max(0, Number(snapshot.deposit || 0))
  const totalDue = Math.max(0, subtotal + shipping - discount - deposit)
  const currency = snapshot.currency || 'USD'
  const paymentMethod = snapshot.paymentMethod || 'PayPal'
  const itemRows = (snapshot.items || []).map((item: any) => `
    <tr class="item-row">
      <td>
        <strong>${esc(String(item.description || 'Professional instrument').toUpperCase())}</strong>
        <small>SKU: ${esc(item.sku || 'N/A')}${Number(item.quantity || 1) > 1 ? ` · QTY: ${esc(item.quantity)}` : ''}</small>
      </td>
      <td class="amount">${money(item.amount ?? Number(item.unitPrice || 0) * Number(item.quantity || 1))}</td>
    </tr>`).join('')

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(invoiceNumber)}</title>
<style>
*{box-sizing:border-box}html,body{margin:0}body{background:#ddd9cf;color:#151515;font:14px Arial,Helvetica,sans-serif;padding:16px}.invoice-page{position:relative;max-width:900px;min-height:1120px;margin:auto;overflow:hidden;background:#f7f1e5;padding:52px 56px 38px;box-shadow:0 8px 28px rgba(0,0,0,.16)}.content{position:relative;z-index:1}.watermark{position:absolute;z-index:0;right:-55px;bottom:50px;width:330px;opacity:.035;filter:grayscale(1)}.header{display:flex;align-items:center;justify-content:space-between;gap:42px;padding-bottom:22px;border-bottom:2px solid #242424}.logo{width:300px;max-height:90px;object-fit:contain}.seller{margin-left:auto;text-align:left;min-width:300px}.seller-name{font:700 28px Georgia,'Times New Roman',serif}.tagline{margin-top:3px;color:#8a7132;font-size:10px;letter-spacing:.2em}.website{display:inline-block;margin-top:10px;color:#222;font-size:12px}.details{display:grid;grid-template-columns:1fr 1.15fr;gap:26px;margin-top:28px}.meta-table{width:100%;border-collapse:collapse}.meta-table th,.meta-table td{padding:8px 0;border-bottom:1px solid #d7d0c2;text-align:left}.meta-table th{width:48%;font-weight:700}.addresses{padding-left:18px}.address-block+.address-block{margin-top:26px;padding-top:18px;border-top:1px dotted #c7bda9}.label{margin-bottom:10px;color:#9a7b35;font-size:10px;font-weight:700;letter-spacing:.18em}.person{margin-bottom:7px;font:italic 18px Georgia,'Times New Roman',serif}.address-block div{margin:4px 0}.items{width:100%;margin-top:32px;border-collapse:collapse;border-top:2px solid #242424}.items th{padding:10px 7px;border-bottom:2px solid #242424;text-align:left;font-size:11px;letter-spacing:.08em}.items th:last-child{text-align:right}.items td{padding:18px 7px;border-bottom:1px solid #d8d0c0}.items small{display:block;margin-top:6px;color:#766f64;font-size:11px;font-weight:400}.amount{text-align:right;white-space:nowrap}.summary-row td{padding:14px 7px;font-weight:700}.summary-row .amount{font-weight:400}.total{border-top:2px solid #242424}.total td{padding:18px 7px}.total-label{color:#9a7b35;font-size:11px;font-weight:700;letter-spacing:.18em}.total-value{text-align:right;font:700 40px Georgia,'Times New Roman',serif}.notes{margin-top:28px}.notes h3{margin:0 0 12px;font-size:14px}.notes p{margin:6px 0}.footer{margin-top:42px;padding-top:20px;border-top:1px solid #d5ccba;text-align:center;color:#a39a89;font-size:11px;letter-spacing:.12em}.thanks{margin:10px 0 14px;color:#a27f37;font:italic 21px Georgia,'Times New Roman',serif}.disclaimer{color:#6f685d;font-size:10px;letter-spacing:0}.muted{color:#777}@media(max-width:680px){body{padding:0}.invoice-page{padding:28px 22px}.header{align-items:flex-start;gap:18px}.logo{width:47%}.seller{min-width:0}.seller-name{font-size:21px}.details{grid-template-columns:1fr}.addresses{padding-left:0}.total-value{font-size:32px}}@media print{@page{size:A4;margin:0}body{background:#f7f1e5;padding:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}.invoice-page{width:210mm;max-width:none;min-height:297mm;padding:14mm 15mm 10mm;box-shadow:none}.watermark{opacity:.035}}
</style></head><body><div class="invoice-page"><img class="watermark" src="https://www.jamessaxcorner.com/saxophone-icon.svg" alt=""><div class="content">
<header class="header"><img class="logo" src="${esc(seller.logoUrl)}" alt="James Sax Corner"><div class="seller"><div class="seller-name">${esc(seller.name)}</div><div class="tagline">${esc(seller.tagline)}</div><a class="website" href="${esc(seller.website)}">${esc(seller.website)}</a></div></header>
<section class="details"><table class="meta-table"><tr><th>Invoice Number</th><td>${esc(invoiceNumber)}</td></tr><tr><th>Invoice Date</th><td>${esc(issuedAt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }))}</td></tr><tr><th>Payment Method</th><td>${esc(paymentMethod)}</td></tr><tr><th>Currency</th><td>${esc(currency)}</td></tr></table><div class="addresses"><div class="address-block"><div class="label">BILL TO</div>${renderAddress(snapshot.billTo)}</div>${snapshot.shipTo ? `<div class="address-block"><div class="label">SHIP TO</div>${renderAddress(snapshot.shipTo)}</div>` : ''}</div></section>
<table class="items"><thead><tr><th>ITEM DESCRIPTION</th><th>PRICE</th></tr></thead><tbody>${itemRows}<tr class="summary-row"><td>Shipping</td><td class="amount">${money(shipping)}</td></tr><tr class="summary-row"><td>Discount</td><td class="amount">${adjustment(discount)}</td></tr><tr class="summary-row"><td>Deposit</td><td class="amount">${adjustment(deposit)}</td></tr><tr class="total"><td class="total-label">TOTAL DUE</td><td class="total-value">$${money(totalDue)}</td></tr></tbody></table>
<section class="notes"><h3>Notes</h3><p>Professionally inspected and regulated prior to shipment.</p><p>For inquiries: ${esc(seller.email)}</p></section>
<footer class="footer"><div>JAMES SAX CORNER&nbsp;&nbsp; | &nbsp;&nbsp;${esc(String(seller.location).toUpperCase())}</div><div class="thanks">Thank you.</div><div class="disclaimer">This invoice is electronically generated; no physical signature is required for validity.</div></footer>
</div></div></body></html>`
}

export function renderInvoiceRecord(invoice: any, order: any) {
  const snapshot = {
    ...(invoice?.snapshot || {}),
    paymentMethod: invoice?.snapshot?.paymentMethod || getOrderPaymentMethod(order),
  }
  return renderInvoiceHtml(
    snapshot,
    invoice.invoiceNumber || `INV-${order.orderNumber || order.id}`,
    order.orderNumber || order.id,
    invoice.finalizedAt || invoice.updatedAt || invoice.createdAt || new Date(),
  )
}
