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
      email: 'order@jamessaxcorner.com',
      location: 'Hanoi, Vietnam',
    },
    billTo,
    shipTo,
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
    total: order.total,
    currency: 'USD',
    notes: 'Thank you for choosing James Sax Corner.',
  }
}

export function renderInvoiceHtml(snapshot: any, invoiceNumber: string, orderNumber: string, issuedAt: Date) {
  const renderAddress = (address: any) => addressLines(address).map((line) => `<div>${esc(line)}</div>`).join('')
  const itemRows = (snapshot.items || []).map((item: any) => `
    <tr>
      <td><strong>${esc(item.description)}</strong><br><small>${esc(item.sku)}</small></td>
      <td class="num">${esc(item.quantity)}</td>
      <td class="num">$${Number(item.unitPrice || 0).toLocaleString()}</td>
      <td class="num">$${Number(item.amount || 0).toLocaleString()}</td>
    </tr>`).join('')

  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${esc(invoiceNumber)}</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#fff;color:#24303d;font:14px Arial,sans-serif}.page{max-width:900px;margin:auto;padding:52px}
.head{display:flex;justify-content:space-between;border-bottom:3px solid #b0a456;padding-bottom:24px}.brand{font:700 30px Georgia,serif}.invoice{font-size:34px;letter-spacing:.12em}
.meta{margin-top:10px;color:#667}.addresses{display:grid;grid-template-columns:${snapshot.shipTo ? '1fr 1fr' : '1fr'};gap:32px;margin:32px 0}.label{font-size:11px;letter-spacing:.16em;color:#847a35;font-weight:700;margin-bottom:9px}
table{width:100%;border-collapse:collapse}th{background:#2f3f4f;color:#fff;text-align:left;padding:12px}td{border-bottom:1px solid #ddd;padding:14px}.num{text-align:right}
.totals{width:340px;margin:24px 0 0 auto}.row{display:flex;justify-content:space-between;padding:7px 0}.grand{border-top:2px solid #2f3f4f;margin-top:7px;padding-top:13px;font-size:19px;font-weight:700}
.notes{margin-top:40px;padding:18px;background:#f5f3e9}.footer{margin-top:45px;border-top:1px solid #ddd;padding-top:14px;color:#777;font-size:12px}
@media print{.page{padding:22px}@page{margin:12mm}}
</style></head><body><div class="page">
<div class="head"><div><div class="brand">${esc(snapshot.seller?.name)}</div><div class="meta">${esc(snapshot.seller?.email)}<br>${esc(snapshot.seller?.location)}</div></div><div style="text-align:right"><div class="invoice">INVOICE</div><div class="meta">${esc(invoiceNumber)}<br>Order #${esc(orderNumber)}<br>${esc(issuedAt.toLocaleDateString('en-US'))}</div></div></div>
<div class="addresses"><div><div class="label">BILL TO</div>${renderAddress(snapshot.billTo)}</div>${snapshot.shipTo ? `<div><div class="label">SHIP TO</div>${renderAddress(snapshot.shipTo)}</div>` : ''}</div>
<table><thead><tr><th>Description</th><th class="num">Qty</th><th class="num">Unit price</th><th class="num">Amount</th></tr></thead><tbody>${itemRows}</tbody></table>
<div class="totals"><div class="row"><span>Subtotal</span><span>$${Number(snapshot.subtotal || 0).toLocaleString()}</span></div>${snapshot.discount ? `<div class="row"><span>Discount</span><span>-$${Number(snapshot.discount).toLocaleString()}</span></div>` : ''}<div class="row"><span>Shipping</span><span>$${Number(snapshot.shipping || 0).toLocaleString()}</span></div><div class="row grand"><span>Total USD</span><span>$${Number(snapshot.total || 0).toLocaleString()}</span></div></div>
${snapshot.notes ? `<div class="notes">${esc(snapshot.notes)}</div>` : ''}<div class="footer">This finalized invoice is a permanent snapshot of the paid order. Print this page to save a PDF copy.</div>
</div></body></html>`
}
