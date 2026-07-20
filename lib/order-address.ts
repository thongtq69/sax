export type OrderAddress = Record<string, any>

const text = (value: unknown) => typeof value === 'string' ? value.trim() : ''

/** Normalize checkout and legacy PayPal address shapes for invoices and verification. */
export function normalizeOrderAddress(address: any): OrderAddress {
  const source = address && typeof address === 'object' ? address : {}
  const paypalAddress = source.paypalAddress && typeof source.paypalAddress === 'object'
    ? source.paypalAddress
    : {}
  const paypalName = text(source.paypalName || source.name)
  const nameParts = paypalName.split(/\s+/).filter(Boolean)
  const firstName = text(source.firstName) || nameParts[0] || ''
  const lastName = text(source.lastName) || nameParts.slice(1).join(' ')

  return {
    name: text(source.name) || [firstName, lastName].filter(Boolean).join(' '),
    firstName,
    lastName,
    company: text(source.company),
    email: text(source.email || source.payerEmail || source.paypalEmail),
    phone: text(source.phone || source.contactPhone),
    address1: text(source.address1 || source.address_line_1 || paypalAddress.address_line_1),
    address2: text(source.address2 || source.address_line_2 || paypalAddress.address_line_2),
    city: text(source.city || source.admin_area_2 || paypalAddress.city),
    state: text(source.state || source.admin_area_1 || paypalAddress.state),
    zip: text(source.zip || source.postal_code || paypalAddress.postal_code),
    country: text(source.country || source.countryCode || source.country_code || paypalAddress.country_code),
  }
}

export function mergeOrderAddress(primary: any, fallback: any): OrderAddress {
  const preferred = normalizeOrderAddress(primary)
  const secondary = normalizeOrderAddress(fallback)
  return Object.fromEntries(
    Object.keys(secondary)
      .concat(Object.keys(preferred))
      .filter((key, index, keys) => keys.indexOf(key) === index)
      .map((key) => [key, preferred[key] || secondary[key] || '']),
  )
}

export function hasPostalAddress(address: any) {
  const normalized = normalizeOrderAddress(address)
  return Boolean(normalized.address1 && normalized.city && normalized.zip)
}

export function getBillingAddress(billingAddress: any, shippingAddress: any) {
  const normalizedBilling = normalizeOrderAddress(billingAddress)
  return hasPostalAddress(normalizedBilling)
    ? mergeOrderAddress(normalizedBilling, shippingAddress)
    : mergeOrderAddress(shippingAddress, normalizedBilling)
}

export function getVerificationAddress(billingAddress: any, shippingAddress: any) {
  const candidates = [billingAddress, shippingAddress].map(normalizeOrderAddress)
  return candidates.find((address) => address.zip && address.phone)
    || candidates.find((address) => address.zip)
    || candidates.find((address) => address.phone)
    || {}
}
