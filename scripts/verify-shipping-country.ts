import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { findShippingZone, normalizeShippingCountry } from '../lib/shipping-country'

const zones = [
  { name: 'EU', countries: ['SE', 'DE'], shippingCost: 200, isDefault: false },
  { name: 'North America', countries: ['US', 'CA'], shippingCost: 200, isDefault: false },
  { name: 'Legacy Asia', countries: ['Thailand'], shippingCost: 150, isDefault: false },
  { name: 'Rest of World', countries: [], shippingCost: 300, isDefault: true },
]

assert.equal(normalizeShippingCountry('United States'), 'US')
assert.equal(normalizeShippingCountry(' united states '), 'US')
assert.equal(normalizeShippingCountry('US'), 'US')
assert.equal(normalizeShippingCountry('USA'), 'US')
assert.equal(normalizeShippingCountry('United Kingdom'), 'GB')
assert.equal(normalizeShippingCountry('Vietnam'), 'VN')
assert.equal(normalizeShippingCountry('Japan'), 'JP')
assert.equal(normalizeShippingCountry('Sweden'), 'SE')

assert.equal(findShippingZone(zones, 'United States')?.name, 'North America')
assert.equal(findShippingZone(zones, 'US')?.name, 'North America')
assert.equal(findShippingZone(zones, 'Sweden')?.name, 'EU')
assert.equal(findShippingZone(zones, 'Thailand')?.name, 'Legacy Asia')
assert.equal(findShippingZone(zones, 'Brazil')?.name, 'Rest of World')

const checkoutSource = readFileSync(new URL('../app/checkout/page.tsx', import.meta.url), 'utf8')
assert.ok(!checkoutSource.includes('setShippingCost(200)'), 'Checkout must not guess a fallback shipping rate')
assert.ok(checkoutSource.includes('shippingCost !== null'), 'Payment must wait for a valid shipping calculation')

const paypalRouteSource = readFileSync(new URL('../app/api/paypal/create-order/route.ts', import.meta.url), 'utf8')
assert.ok(!/country_code:\s*['"]US['"]/.test(paypalRouteSource), 'PayPal country must not be hard-coded')
assert.ok(paypalRouteSource.includes('country_code: countryCode'), 'PayPal must receive the normalized country code')

console.log('Shipping country normalization verification passed.')
