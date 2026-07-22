import assert from 'node:assert/strict'
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

assert.equal(findShippingZone(zones, 'United States')?.name, 'North America')
assert.equal(findShippingZone(zones, 'US')?.name, 'North America')
assert.equal(findShippingZone(zones, 'Sweden')?.name, 'EU')
assert.equal(findShippingZone(zones, 'Thailand')?.name, 'Legacy Asia')
assert.equal(findShippingZone(zones, 'Brazil')?.name, 'Rest of World')

console.log('Shipping country normalization verification passed.')
